const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Load environment variables
require("dotenv").config();

const REGION = process.env.REGION || "us-east-1";
const STAGE = process.env.STAGE || "dev";
const ROLES_TABLE = process.env.ROLES_TABLE || `uniapply-app-roles-${STAGE}`;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

// Migration function to convert old access structure to new structure
function migrateAccessStructure(oldAccess) {
  if (!oldAccess) return null;

  // If already in new format, return as is
  if (oldAccess.applications || oldAccess.formTemplates) {
    return oldAccess;
  }

  // Ensure oldAccess is an object with expected properties
  if (typeof oldAccess !== "object") {
    return null;
  }

  // Convert from old flat structure to new hierarchical structure
  return {
    applications: {
      create: oldAccess.canCreateApplications || false,
      update: oldAccess.canModifyApplicationSettings || false,
      delete: false, // New permission
      approve: oldAccess.canApproveForms || false,
      reject: false, // New permission
      readAll: oldAccess.canViewAllApplications || false,
      readOwn: oldAccess.canViewApplications || true,
    },
    formTemplates: {
      create: oldAccess.canCreateFormTemplates || false,
      readAll: oldAccess.canViewAllFormTemplates || false,
      readActive: true, // Default to true for existing users
      update: oldAccess.canModifyFormTemplates || false,
      delete: false, // New permission
    },
    users: {
      create: false, // New permission
      readAll: oldAccess.canViewAllUsers || false,
      update: oldAccess.canModifyUserData || false,
      delete: false, // New permission
    },
    auditLogs: {
      read: false, // New permission
    },
    systemSettings: {
      read: false, // New permission
      update: false, // New permission
    },
    roles: {
      readAll: false, // New permission
      create: false, // New permission
      update: oldAccess.canModifyUserRoleAccess || false,
      delete: false, // New permission
    },
  };
}

async function migrateRoles() {
  try {
    // Scan all roles
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: ROLES_TABLE,
      })
    );

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const item of scanResult.Items) {
      let role;
      try {
        role = unmarshall(item);
      } catch (error) {
        continue;
      }
      const oldAccess = role.access;
      const newAccess = migrateAccessStructure(oldAccess);

      if (!newAccess) {
        skippedCount++;
        continue;
      }

      // Check if migration is needed
      if (oldAccess.applications || oldAccess.formTemplates) {
        skippedCount++;
        continue;
      }

      // Update the role with new access structure
      const updatedRole = {
        ...role,
        access: newAccess,
        updatedAt: new Date().toISOString(),
      };

      await ddb.send(
        new PutItemCommand({
          TableName: ROLES_TABLE,
          Item: marshall(updatedRole, { removeUndefinedValues: true }),
        })
      );

      migratedCount++;
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateRoles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
