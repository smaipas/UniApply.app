const {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  ListUserPoolClientsCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({
  region: "eu-central-1",
});
const serviceName = "uniapply-app";
const stage = "dev";
const userPoolName = `${serviceName}-${stage}-userpool`;

async function getNewCognitoConfig() {
  try {
    console.log("Getting new Cognito configuration...");

    // List user pools to find the new one
    const listPoolsResponse = await cognitoClient.send(
      new ListUserPoolsCommand({
        MaxResults: 60,
      })
    );

    const userPool = listPoolsResponse.UserPools.find(
      (pool) => pool.Name === userPoolName
    );

    if (!userPool) {
      console.error(`User pool with name "${userPoolName}" not found`);
      console.log("Available user pools:");
      listPoolsResponse.UserPools.forEach((pool) => {
        console.log(`- ${pool.Name} (${pool.Id})`);
      });
      return;
    }

    console.log(`Found user pool: ${userPool.Name} (${userPool.Id})`);

    // Get the client for this user pool
    const listClientsResponse = await cognitoClient.send(
      new ListUserPoolClientsCommand({
        UserPoolId: userPool.Id,
        MaxResults: 60,
      })
    );

    if (listClientsResponse.UserPoolClients.length === 0) {
      console.error("No user pool clients found");
      return;
    }

    const client = listClientsResponse.UserPoolClients[0];
    console.log(`Found client: ${client.ClientName} (${client.ClientId})`);

    console.log("\n=== NEW COGNITO CONFIGURATION ===");
    console.log(`VITE_COGNITO_USER_POOL_ID=${userPool.Id}`);
    console.log(`VITE_COGNITO_CLIENT_ID=${client.ClientId}`);
    console.log(`VITE_COGNITO_REGION=eu-central-1`);
    console.log("=====================================\n");

    console.log("Please update your frontend .env file with these values.");
  } catch (error) {
    console.error("Error getting Cognito configuration:", error);
    throw error;
  }
}

getNewCognitoConfig().catch(console.error);
