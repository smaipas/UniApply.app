# Backend Scripts

This directory contains utility scripts for managing the backend infrastructure and data.

## Scripts

### `update-admin-role.js`

Updates role permissions in DynamoDB. Currently used to add the `canModifyFormTemplates` permission to the ADMIN role.

### `migrate-role-access.js`

Migrates existing roles from the old flat access structure to the new hierarchical structure. This script converts old permissions like `canCreateFormTemplates` to the new format like `formTemplates.create`.

#### Migration Mapping

- `canCreateApplications` → `applications.create`
- `canModifyApplicationSettings` → `applications.update`
- `canApproveForms` → `applications.approve`
- `canViewAllApplications` → `applications.readAll`
- `canViewApplications` → `applications.readOwn`
- `canCreateFormTemplates` → `formTemplates.create`
- `canModifyFormTemplates` → `formTemplates.update`
- `canViewAllFormTemplates` → `formTemplates.readAll`
- `canViewAllUsers` → `users.readAll`
- `canModifyUserData` → `users.update`
- `canModifyUserRoleAccess` → `roles.update`

#### Usage

```bash
# Set environment variables
export ROLES_TABLE=your-roles-table-name
export REGION=your-aws-region

# Run the script
node scripts/migrate-role-access.js
```

#### What it does

1. Scans all roles in the DynamoDB table
2. Converts old flat permissions to new hierarchical structure
3. Updates each role with the new access format
4. Provides detailed logging and migration summary
5. Handles errors gracefully and skips already migrated roles

#### When to run

- After updating the role access schema to use hierarchical structure
- When setting up new environments with the new permission format
- When migrating existing production data to the new structure

#### Usage

```bash
# Set environment variables
export ROLES_TABLE=your-roles-table-name
export REGION=your-aws-region

# Run the script
node scripts/update-admin-role.js
```

#### What it does

1. Fetches the current ADMIN role from DynamoDB
2. Adds the `canModifyFormTemplates: true` permission
3. Updates the role with the new permissions
4. Provides detailed logging of the process

#### When to run

- After deploying backend changes that add new permissions
- When setting up new environments
- When you need to grant new permissions to existing roles

#### Safety features

- **Idempotent**: Can be run multiple times safely
- **Change detection**: Only updates if permissions actually changed
- **Error handling**: Provides clear error messages and exits on failure
- **Logging**: Shows exactly what changes were made

## Future Scripts

This directory can be used for other database migrations and utility scripts such as:

- User data migrations
- Schema updates
- Data cleanup
- Environment setup
- Backup and restore operations

## Best Practices

1. **Always test** scripts in a development environment first
2. **Backup data** before running migration scripts
3. **Document changes** in commit messages
4. **Use environment variables** for configuration
5. **Provide clear logging** and error messages
