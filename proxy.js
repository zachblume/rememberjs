import { Subject, Observable, Subscription } from "rxjs";

export function observeObject(obj, child = false) {
  /// Variables
  const changes$ = new Subject();
  const propertySubscriptions = new Map();

  /// Helper Functions
  const observeChildObject = (target, prop, childVal) => {
    // console.log("observeChildObject", { target, prop, childVal });
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

  // Add our special table and observation functions
  if (!child) {
    arrayWithSubscribe.subscribe = (v) => changes$.subscribe(v);
    arrayWithSubscribe.onSnapshotImmediate = (v) => changes$.subscribe(v);
    // For now, assign onSnapshot, but in future this needs to be "debounced" to buffer sub-milisecond operations to fire snapshots in batches
    arrayWithSubscribe.onSnapshot = (v) =>
      arrayWithSubscribe.onSnapshotImmediate(v);

    arrayWithSubscribe.delete = function (filterExpression) {
      // This new code is like 1000x faster than the for/splice version below

      // Running the filter in reverse for targeting, and store a copy of new filter-passing items
      var newArray = this.filter((value) => !filterExpression(value));

      // Clear the array
      this.length = 0;

      // The following is like 2-3x faster but exceed stack memory at ~1 million items, yuck
      // this.push(...newArray);

      // Push all the filtered items back to the array, passing along a special flag to make sure additions aren't emitted
      for (let i = 0; i < newArray.length; i++) {
        newArray[i]["observableIgnoreFlag"] = true;
        // console.warn(newArray[i]);
        this.push(newArray[i]);
      }

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

    const genericLeftJoin = (objArr1, objArr2, key1, key2) =>
      objArr1.map((anObj1) => ({
        ...objArr2.find((anObj2) => anObj1[key1] === anObj2[key2]),
        ...anObj1,
      }));
    arrayWithSubscribe.leftJoin = (rightTable, matchingKey) =>
      genericLeftJoin(arrayWithSubscribe, rightTable, matchingKey, matchingKey);
  }

  const proxy = new Proxy(arrayWithSubscribe, {
    set: (target, prop, value, receiver) => {
      let observableIgnoreFlag = false;
      if (
        ![
          "subscribe",
          "onSnapshot",
          "delete",
          "length",
          "observableIgnoreFlag",
        ].includes(prop)
      ) {
        // console.warn("proxy.set", { target, prop, value, receiver });
        if (value && value.observableIgnoreFlag) {
          observableIgnoreFlag = value.observableIgnoreFlag;
          delete value.observableIgnoreFlag;
        }
        // console.warn("proxy.set.observableIgnoreFlag", observableIgnoreFlag);
      }
      // If property is changed TO an object.
      if (typeof value === "object" && !propertySubscriptions.has(prop)) {
        value = observeChildObject(target, prop, {
          observableIgnoreFlag: observableIgnoreFlag,
          ...value,
        });
      }
      // If property is changed FROM an object.
      else if (typeof value !== "object" && propertySubscriptions.has(prop)) {
        stopObservingChildObject(prop);
      }
      // Pass along to real function
      const returnVal = Reflect.set(target, prop, value, receiver);

      // Fire snapshot and subscription handlers if property isnt length and isnt a delete re-addition
      if (
        ![
          "subscribe",
          "onSnapshot",
          "delete",
          "length",
          "observableIgnoreFlag",
        ].includes(prop) &&
        !observableIgnoreFlag
      )
        changes$.next(target);
      return returnVal;
    },
    deleteProperty: (target, prop) => {
      const returnVal = Reflect.deleteProperty(target, prop);
      if (
        ![
          // "subscribe",
          // "onSnapshot",
          // "delete",
          // "length",
          "observableIgnoreFlag",
        ].includes(prop)
      ) {
        if (propertySubscriptions.has(prop)) {
          stopObservingChildObject(prop);
        }
        // Need a way of pausing this while we batch deletes, also it includes nulls? Also it fires three times on delete? weird
        changes$.next(proxy);
      }
      return returnVal;
    },
  });

  /// Initialization
  for (let key of Object.keys(obj)) {
    proxy[key] = obj[key];
  }

  return [proxy, changes$];
}
