const {
  DynamoDBClient,
  DeleteTableCommand,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const dynamoClient = new DynamoDBClient({ region: "eu-central-1" });
const serviceName = "uniapply-app";
const stage = "dev";

const tableNames = [
  `${serviceName}-users-${stage}`,
  `${serviceName}-forms-${stage}`,
  `${serviceName}-applications-${stage}`,
  `${serviceName}-roles-${stage}`,
  `${serviceName}-audit-${stage}`,
  `${serviceName}-rate-limits-${stage}`,
  `${serviceName}-token-blacklist-${stage}`,
  `${serviceName}-security-events-${stage}`,
];

async function cleanupDynamoDB() {
  try {
    console.log("Checking for existing DynamoDB tables...");

    // List all tables to see what exists
    const listResponse = await dynamoClient.send(new ListTablesCommand({}));
    console.log("Existing tables:", listResponse.TableNames);

    // Delete each table if it exists
    for (const tableName of tableNames) {
      if (listResponse.TableNames.includes(tableName)) {
        console.log(`Deleting table: ${tableName}`);
        try {
          await dynamoClient.send(
            new DeleteTableCommand({ TableName: tableName })
          );
          console.log(`Successfully deleted table: ${tableName}`);
        } catch (error) {
          console.error(`Error deleting table ${tableName}:`, error.message);
        }
      } else {
        console.log(`Table ${tableName} does not exist, skipping...`);
      }
    }

    console.log("DynamoDB cleanup completed");
  } catch (error) {
    console.error("Error during DynamoDB cleanup:", error);
    throw error;
  }
}

cleanupDynamoDB().catch(console.error);
