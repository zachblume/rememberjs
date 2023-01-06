# remember.js
Use in-memory JS arrays as if they were a persistent database table.
- Adds RxDB functionality to native javascript arrays: observable, offline persistant, server replicated.
- Adds some SQL-like delete and update functions while maintaining native JS filter callback style.
- Use native javascript array as db table, meaning you can .push(), .splice(), and table[index][property]=reassignedValue;
- Use .filter(row=>expression) and filter-style .delete(row=>expression) and .update(filter, newProps)
- Allow for .onSnapshot(data=>callback) and delta-only .subscription(changes=>callback)
- Load synchronously from a local indexedDB cache and replicate asyncronously to server
- Strip out APIs and React hooks and just leave React templating

## Get started

Create a database table!
>const people = new Table("people");

Add a row!
>people.push(row)

You can manipulate the array -- it's normal javascript!
>people[0]['name']='Sarah';
>
>people.splice(0,1) // Gets rid of first row
>
>people.forEach(row,index=>{people[index]={newColumn:'defaultValue',...row}})

Print filtered rows to console! (like SELECT ... WHERE)
>people.filter(row => row.id == 49).forEach(console.log)

Delete matching rows (like DELETE ... WHERE)
>people.delete(row => row.name == 'Zach')

Updates the properties of matching rows (like UPDATE ... WHERE)
>people.update(row => row.name == 'Zach', {status:'active'})
