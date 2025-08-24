const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Load environment variables with defaults for dev stage
const REGION = process.env.REGION || "us-east-1";
const STAGE = process.env.STAGE || "dev";
const ROLES_TABLE = process.env.ROLES_TABLE || `uniapply-app-roles-${STAGE}`;

const ddb = new DynamoDBClient({ region: REGION });

// Configuration loaded

/**
 * Update role permissions in DynamoDB
 * @param {string} roleName - The role to update
 * @param {Object} permissions - Object with permission keys and boolean values
 */
async function updateRolePermissions(roleName, permissions) {
  try {
    // Get current role
    const getRes = await ddb.send(
      new GetItemCommand({
        TableName: ROLES_TABLE,
        Key: marshall({ roleName }),
      })
    );

    if (!getRes.Item) {
      console.error(`${roleName} role not found!`);
      return false;
    }

    const role = unmarshall(getRes.Item);

    // Initialize access object if it doesn't exist
    if (!role.access) {
      role.access = {};
    }

    // Add the new permissions
    let hasChanges = false;
    for (const [permission, value] of Object.entries(permissions)) {
      if (role.access[permission] !== value) {
        role.access[permission] = value;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return true;
    }

    role.updatedAt = new Date().toISOString();

    // Save the updated role
    await ddb.send(
      new PutItemCommand({
        TableName: ROLES_TABLE,
        Item: marshall(role),
      })
    );

    return true;
  } catch (error) {
    console.error(`Error updating ${roleName} role:`, error);
    return false;
  }
}

// Migration: Add canModifyFormTemplates permission to ADMIN role
async function migrateAdminRole() {
  const success = await updateRolePermissions("ADMIN", {
    canModifyFormTemplates: true,
  });

  if (!success) {
    process.exit(1);
  }
}

// Run the migration
migrateAdminRole();
