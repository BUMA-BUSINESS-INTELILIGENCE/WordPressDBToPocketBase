import { PocketBaseField } from "./pocketBaseField.js";

export interface PocketBaseCollection {
  name: string;
  type: string;
  schema: PocketBaseField[];
}
