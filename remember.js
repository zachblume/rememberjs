// Import observable object
import { observeObject } from "./proxy.js";

// Have a little simple starter class
export function Table(tableID, { syncFromLocal, asyncFromServer }) {
  const observedTable = observeObject([]);
  return observedTable;
}
