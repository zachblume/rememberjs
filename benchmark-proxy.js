const proxy = [];
const proxyObj = new Proxy([], {
  set: (target, prop, value, receiver) => {
    // console.log({ target, prop, value, receiver });
    const returnVal = Reflect.set(target, prop, value, receiver);
    if (prop != "length")
      console.log(
        "Proxy single addition time in nanoseconds " +
          (process.hrtime.bigint() - BigInt(value)).toString()
      );
    return returnVal;
  },
});

// proxyObj.push(process.hrtime.bigint().toString());
proxyObj[proxyObj.length] = process.hrtime.bigint().toString();
proxyObj[proxyObj.length] = process.hrtime.bigint().toString();

proxy[proxy.length] = process.hrtime.bigint().toString();
console.log(
  "Native single addition time in nanoseconds " +
    (process.hrtime.bigint() - BigInt(proxy[0])).toString()
);

proxy[proxy.length] = process.hrtime.bigint().toString();
console.log(
  "Native single addition time in nanoseconds " +
    (process.hrtime.bigint() - BigInt(proxy[1])).toString()
);
// proxyObj[proxyObj.length] = process.hrtime.bigint().toString();
