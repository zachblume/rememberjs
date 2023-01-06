# rememberjs
An observable JS array that functions as a in-memory reactive database, with replication.
- Use native javascript array as db table, meaning you can .push(), .splice(), and table[index][property]=reassignedValue;
- Use .filter(row=>expression) and filter-style .delete(row=>expression)
- Allow for .onSnapshot(data=>callback) and delta-only .subscription(changes=>callback)
- Replicate asyncronously to server, and load synchronously from a local indexedDB cache
- Creates ability for React two-way binding with native array/tables!
