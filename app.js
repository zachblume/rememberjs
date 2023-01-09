// Import the table object
import { Table } from "./remember.js";

// Loads a proxied array
// TODO: Load a array table from indexedDB
const [table, b] = new Table("people", {
  syncFromLocal: true, // Synchronously from local ... i.e., do not proceed until stale is recieved
  asyncFromServer: true, // Pull and push asychronously to server, i.e. proceed and transact in async
});

// Subscribe a callback to the entire updated table, on each change
table.onSnapshot((fullTable) =>
  console.log("Change event! Array size is now " + fullTable.length + ".")
);

// TODO: Right now, only snapshot is working...
// table.subscribe((change) => console.log("Update! " + stringify(change)));

console.warn("Push elements one at a time");
table.push({ id: 1, name: "John", companyId: 1 });
table.push({ id: 2, name: "Jane", companyId: 1 });

console.warn("Push multiple elements simultaneously");
table.push(
  { id: 3, name: "Marie", companyId: 2 },
  { id: 4, name: "Thomas", companyId: 2 }
);

console.warn("Delete an element from table, using .filter syntax");
table.delete((row) => row.id > 3);

console.warn("Select elements by property filter from table");
const result1 = table.filter((row) => row.id > 0);
const result2 = table.filter((row) => row.name?.match(/John/));
console.log(result1.length, result2.length);

console.warn("Join two tables to produce a view");
const joinedTables = table.leftJoin(
  [
    { companyId: 1, company: "Microsoft", location: "Seattle" },
    { companyId: 2, company: "Google", location: "Mountain View" },
  ],
  "companyId"
);
console.log("joinedTables", joinedTables);

console.warn("Re-assign an array element");
table[1] = { newObject: "" };

console.warn("Re-assign the property of one array element, bracket notation");
table[0]["name"] = "Zach";

console.warn("Re-assign the property of one array element, dot notation");
table[0].name = "John";
