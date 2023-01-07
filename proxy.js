import { Subject, Observable, Subscription } from "rxjs";

export function observeObject(obj, child = false) {
  /// Variables
  const changes$ = new Subject();
  const propertySubscriptions = new Map();

  /// Helper Functions
  const observeChildObject = (target, prop, childVal) => {
    const [childProxy, childChanges$] = observeObject(childVal, true);
    const sub = childChanges$.subscribe((childObj) => changes$.next(target));
    propertySubscriptions.set(prop, sub);
    return childProxy;
  };
  const stopObservingChildObject = (prop) => {
    propertySubscriptions.get(prop).unsubscribe();
    propertySubscriptions.delete(prop);
  };

  /// Proxy Creation
  var arrayWithSubscribe = obj || [];
  if (!child) {
    arrayWithSubscribe.subscribe = (v) => changes$.subscribe(v);
    arrayWithSubscribe.onSnapshot = (v) => changes$.subscribe(v);
    arrayWithSubscribe.delete = function (filterExpression) {
      // This new code is like 1000x faster than the for/splice version below

      // Running the filter in reverse for targeting, and store a copy of new filter-passing items
      var newArray = this.filter((value) => !filterExpression(value));

      // Clear the array
      this.length = 0;

      // The following is like 2-3x faster but exceed stack memory at ~1 million items, yuck
      // this.push(...newArray);

      // Push all the filtered items back to the array, passing along a special flag to make sure additions aren't emitted
      for (let i = 0; i < newArray.length; i++)
        this.push({ ...newArray[i], observableIgnoreFlag: true });

      changes$.next(proxy);

      // Old version :)
      // // Loop through every element in /this/ (the array)
      // for (let i = 0; i < this.length; i++) {
      //   if (i >= this.length) break;
      //   var j = i;
      //   console.time(j);
      //   // And pass the filter function element, index, array as defined in js docs for .filter
      //   // And delete the index&value if present
      //   if (filter(this[i], i, this)) {
      //     // Remove an index:
      //     this.splice(i, 1);
      //     // Move the index/counter back one because we have deleted an index!
      //     i--;
      //   }
      //   console.timeEnd(j);
      // }
    };
  }

  const proxy = new Proxy(arrayWithSubscribe, {
    set: (target, prop, value, receiver) => {
      // if (value.observableIgnoreFlag) {
      let observableIgnoreFlag = false;
      if (value && value.observableIgnoreFlag) {
        observableIgnoreFlag = value.observableIgnoreFlag;
        delete value.observableIgnoreFlag;
      }
      // return Reflect.set(target, prop, valueWithoutFlag, receiver);
      // }
      // If property is changed TO an object.
      if (typeof value === "object" && !propertySubscriptions.has(prop)) {
        value = observeChildObject(target, prop, value);
      }
      // If property is changed FROM an object.
      else if (typeof value !== "object" && propertySubscriptions.has(prop)) {
        stopObservingChildObject(prop);
      }
      const returnVal = Reflect.set(target, prop, value, receiver);

      if (prop != "length" && !observableIgnoreFlag) changes$.next(target);
      return returnVal;
    },
    deleteProperty: (target, prop) => {
      const returnVal = Reflect.deleteProperty(target, prop);
      if (propertySubscriptions.has(prop)) {
        stopObservingChildObject(prop);
      }
      // Need a way of pausing this while we batch deletes, also it includes nulls? Also it fires three times on delete? weird
      changes$.next(proxy);
      return returnVal;
    },
  });

  /// Initialization
  for (let key of Object.keys(obj)) {
    proxy[key] = obj[key];
  }

  return [proxy, changes$];
}
