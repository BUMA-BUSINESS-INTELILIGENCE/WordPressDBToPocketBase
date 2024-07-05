import Pocketbase from "pocketbase";
import mysql, { RowDataPacket } from "mysql2/promise";
import MySqlField from "./models/MySqlField.js";
import { PocketBaseCollection } from "./constants/pocketBaseCollection.js";
import { PocketBaseField } from "./constants/pocketBaseField.js";

const pb = new Pocketbase("http://127.0.0.1:8090");
pb.autoCancellation(false);
async function run() {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3300,
    user: "root",
    password: "Cheick.15",
    database: "dayisabi",
  });

  try {
    const results = await connection.query<RowDataPacket[]>("SHOW TABLES;");
    for (let i = 0; i < results[0].length; i++) {
      const connectionCurrent = await mysql.createConnection({
        host: "localhost",
        port: 3300,
        user: "root",
        password: "Cheick.15",
        database: "dayisabi",
      });
      const tableName = results[0][i].Tables_in_dayisabi;
      const base = await tableToBase(tableName, connectionCurrent);
      const tableDatas = await getTablesData(tableName, connectionCurrent);
      await insertTablesDataAsRecord(base, tableDatas);
    }
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête :", error);
  } finally {
    // Fermer la connexion
    await connection.end();
  }
}
//La fonction TableToBase convertit une table mysql en un format de collection PocketBase
async function tableToBase(tableName: string, connection: mysql.Connection) {
  const structureQuery = await connection.query<RowDataPacket[]>(
    "DESCRIBE " + tableName + ";"
  );
  const structure = structureQuery[0];
  let base: PocketBaseCollection = {
    name: tableName,
    type: "base",
    schema: [],
  };
  structure.forEach((element) => {
    const msField = MySqlField.fromObject(element);
    let pocketBaseField = msField.toPocketField();
    if (
      pocketBaseField.name.toLowerCase() == "id" ||
      pocketBaseField.name.toLowerCase() == "created" ||
      pocketBaseField.name.toLowerCase() == "updated"
    ) {
    } else {
      base.schema.push(pocketBaseField);
    }
  });

  return base;
}
//La fonction getTablesData va recuperer tous les doonees d'une table mysql selon son nom
async function getTablesData(tableName: string, connection: mysql.Connection) {
  const structureQuery = await connection.query<RowDataPacket[]>(
    "SELECT * FROM " + tableName + ";"
  );
  const data = structureQuery[0];
  return data;
}
//La fonction createBasePocketbase s'authentifie en tant que admin et creer une collection a l'aide d'un schema eu par tableToBase
async function createBasePocketbase(baseData: PocketBaseCollection) {
  await pb.admins.authWithPassword("iceebboy145@gmail.com", "1234567890");
  await pb.collections.create(baseData);
}
// la Fonction lineToRecordData convertit une ligne sql en record format
function lineToRecordData(
  schema: PocketBaseField[],
  line: mysql.RowDataPacket
) {
  let form_data = new FormData();

  for (var key in line) {
    let keyValue: string = "";
    let isDate: boolean = false;
    schema.forEach((element) => {
      if (element.name == key) {
        keyValue = element.name;
        if (element.type == "date") {
          isDate = true;
        }
      }
    });
    if (isDate && !isNaN(new Date(line[key]).getTime())) {
      const date = new Date(line[key]).toISOString();
      form_data.append(keyValue, date);
    } else {
      form_data.append(keyValue, line[key] == "Invalid Date" ? "" : line[key]);
    }
  }
  return form_data;
}
//la fonction insertRecord creer une nouvelle ligne dans la base pocketbase specifier
async function insertRecord(record: FormData, baseName: string) {
  await pb.collection(baseName).create(record);
}
// la fonction insertTablesDataAsRecord va a travers le nom de la table creer la base et inserer ses lignes.
async function insertTablesDataAsRecord(
  baseData: PocketBaseCollection,
  dataTable: mysql.RowDataPacket[]
) {
  await createBasePocketbase(baseData);
  for (let i = 0; i < dataTable.length; i++) {
    await insertRecord(
      lineToRecordData(baseData.schema, dataTable[i]),
      baseData.name
    );
  }
}

run().catch(console.error);
