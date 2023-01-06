console.time();
function time(name, operation) {
  console.time(name);
  operation();
  console.timeEnd(name);
}

const log = console.log;

// Import the table object
import { Table } from "./remember.js";

// Load a array table from indexedDB
const [table, b] = new Table("people", {
  syncFromLocal: true, // Synchronously from local ... i.e., do not proceed until stale is recieved
  asyncFromServer: true, // Pull and push asychronously to server, i.e. proceed and transact in async
});

// Pass the entire updated table on each change
table.onSnapshot((fullTable) => log("Snapshot: " + JSON.stringify(fullTable)));

// You can have more than 1 handler!
// table.onSnapshot((fullTable) => log("You can have more than 1 handler!"));

// Right now, only snapshot is working...
// table.subscribe((change) => log("Update! " + JSON.stringify(change)));

// Add one thousand random people rows to table
const fillerDataLength = 10;
const randomName = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]/g, "");
for (let i = 0; i < fillerDataLength; i++)
  table.push({ id: i, name: randomName() }); // 16ms for 10k rows

// Delete an element from table, using .filter syntax
time("Delete operation performance", () => table.delete((row) => row.id > 2));

// Select elements from table
table.filter((row) => row.id == 5); // ID match
table.filter((row) => row.name.match(/zach/, "i")); // Case insensitive name match

// Join two tables to produce a view
// var joinedTables = table.leftJoin(tableTwo);

console.log("table[2] = { newobject: true };");
table[2] = { newobject: true };

console.log('table[1].name = "zach";');
table[1].name = "zach";
table[1].name = "zdfgach";
table[1].name = "zacdfgh";

console.log("end of app.js!");
console.timeEnd();
