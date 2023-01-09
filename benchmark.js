const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();

let person = [];
let personProxy = new Proxy(person, {
  set: (target, prop, value, receiver) => {
    const returnVal = Reflect.set(target, prop, value, receiver);
    // target[prop] = value;
    return returnVal;
  },
});

suite
  .add("native", () => {
    person.push({ a: "b", b: "c" });
    if (person.length > 1 * 1000) person.length = 0; // Prevent memory overload
  })
  .add("proxy", () => {
    personProxy.push({ a: "b", b: "c" });
    if (personProxy.length > 1 * 1000) personProxy.length = 0; // Prevent memory overload
  })
  .on("cycle", (event) => console.log(event.target.toString()))
  .run();
