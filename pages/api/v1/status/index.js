import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

async function status(request, response) {
  try {
    const updateAt = new Date().toISOString();

    const postgres_Version = await database.query("SHOW server_version;");
    const databaseVersion = postgres_Version.rows[0].server_version;

    const max_Connections = await database.query("SHOW max_connections;");
    const databaseMaxConnections = max_Connections.rows[0].max_connections;

    const databaseDB = process.env.POSTGRES_DB;
    const databaseMaxConnectionsResult = await database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseDB],
    });
    const databaseOpenConnectionsValue =
      databaseMaxConnectionsResult.rows[0].count;

    response.status(200).json({
      update_at: updateAt,
      version: parseInt(databaseVersion),
      max_connections: parseInt(databaseMaxConnections),
      opened_connections: databaseOpenConnectionsValue,
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do controller:");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
