/**
 * MongoDB Connection Utility
 *
 * Provides reusable access to:
 * - Command database (writes)
 * - Query database (reads)
 *
 * Used by application workflow services,
 * queues and workers.
 */

import { MongoClient, Db } from "mongodb";


const uri = process.env.MONGODB_URI || "";

const commandUri =
  process.env.MONGODB_COMMAND_URI || uri;

const queryUri =
  process.env.MONGODB_QUERY_URI || uri;


const dbName =
  process.env.MONGODB_DB_NAME || "yuvahub";


let commandClient: MongoClient | null = null;
let queryClient: MongoClient | null = null;

let commandDb: Db | null = null;
let queryDb: Db | null = null;



async function connectCommandDB(): Promise<Db> {

  if (commandDb) {
    return commandDb;
  }


  if (!commandUri) {
    throw new Error(
      "MongoDB command URI missing"
    );
  }


  commandClient =
    new MongoClient(commandUri);


  await commandClient.connect();


  commandDb =
    commandClient.db(
      process.env.MONGODB_COMMAND_DB ||
      dbName
    );


  console.log(
    "[MongoDB] Command DB connected"
  );


  return commandDb;
}



async function connectQueryDB(): Promise<Db> {

  if (queryDb) {
    return queryDb;
  }


  if (!queryUri) {
    throw new Error(
      "MongoDB query URI missing"
    );
  }


  queryClient =
    new MongoClient(queryUri);


  await queryClient.connect();


  queryDb =
    queryClient.db(
      process.env.MONGODB_QUERY_DB ||
      dbName
    );


  console.log(
    "[MongoDB] Query DB connected"
  );


  return queryDb;
}



export async function getCommandDB() {
  return connectCommandDB();
}



export async function getQueryDB() {
  return connectQueryDB();
}



export async function closeMongoConnections() {

  if (commandClient) {
    await commandClient.close();
    commandClient = null;
    commandDb = null;
  }


  if (queryClient) {
    await queryClient.close();
    queryClient = null;
    queryDb = null;
  }


}