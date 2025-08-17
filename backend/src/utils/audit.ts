import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

type Audit = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorUserId: string;
  timestamp: string;
  details: Record<string, any>;
};
const AUDIT_TABLE = process.env.AUDIT_TABLE!;

export async function logAudit(
  a: Omit<Audit, "id" | "timestamp"> & { details: Record<string, any> }
) {
  await db.put(AUDIT_TABLE, {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...a,
  });
}
