import { store } from "../app/store.js";
import {
  exportStateToJson,
  importStateFromJson,
} from "../app/services/dataTransfer.js";
import { showToast } from "./toast.js";

export function exportAppData() {
  const json = exportStateToJson(store.getState());
  showToast({ message: "Data exported successfully", type: "success" });
  return json;
}

export function importAppData(jsonString) {
  importStateFromJson(store, jsonString);
  showToast({ message: "Data imported successfully", type: "success" });
}
