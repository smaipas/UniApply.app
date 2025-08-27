import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../utils/db";
import { logAudit } from "../utils/audit";
import { isValidCountryCode } from "../utils/countries";
import { UserUpdateSchema, type User } from "@uniapply/shared";
import { validate } from "../validation/http";

const USERS_TABLE = process.env.USERS_TABLE!;
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await db.scan<User>(USERS_TABLE))
);
router.get("/:id", async (req, res) => {
  const item = await db.get<User>(USERS_TABLE, { id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});
router.post("/", async (req, res) => {
  const d = req.body as Partial<User>;
  if (!d.firstName || d.firstName.length < 2 || d.firstName.length > 64)
    return res.status(400).json({ error: "Invalid firstName" });
  if (!d.lastName || d.lastName.length < 2 || d.lastName.length > 64)
    return res.status(400).json({ error: "Invalid lastName" });
  const now = new Date().toISOString();
  const item: User = {
    id: d.id || uuid(),
    role: d.role,
    firstName: d.firstName,
    lastName: d.lastName,
    fathersName: d.fathersName,
    mothersName: d.mothersName,
    studentId: d.studentId,
    userOfficialId: d.userOfficialId,
    userOfficialIdIssuedDate: d.userOfficialIdIssuedDate,
    userOfficialIdIssuedAuthority: d.userOfficialIdIssuedAuthority,
    userOfficialType: d.userOfficialType,
    mobilePhoneNumber: d.mobilePhoneNumber,
    phoneNumber: d.phoneNumber,
    email: d.email,
    currentAddress: d.currentAddress,
    permanentResidenceAddress: d.permanentResidenceAddress,
    dateOfBirth: d.dateOfBirth,
    placeOfBirth: d.placeOfBirth,
    nationality: d.nationality,
    gender: d.gender,
    maleRegistryNumber: d.maleRegistryNumber,
    maleRegistryIssuedPlace: d.maleRegistryIssuedPlace,
    militaryObligations: d.militaryObligations,
    maritalStatus: d.maritalStatus,
    numberOfChildren: d.numberOfChildren,
    municipalRegisterNumber: d.municipalRegisterNumber,
    municipalRegisterPrefecture: d.municipalRegisterPrefecture,
    ssn: d.ssn,
    academicEnrollmentYear: d.academicEnrollmentYear,
    department: d.department,
    active: d.active ?? true,
    verified: d.verified ?? false,
    settings: d.settings || {
      dark: false,
      language: "en",
      notificationsEnabled: true,
    },
    createdAt: now,
    updatedAt: now,
  } as User;
  await db.put(USERS_TABLE, item);
  await logAudit({
    entityType: "User",
    entityId: item.id,
    action: "CREATE",
    actorUserId: (req as any).user?.sub || "system",
    details: item,
  });
  res.status(201).json(item);
});
router.put("/:id", async (req, res) => {
  try {
    const before = await db.get<User>(USERS_TABLE, { id: req.params.id });
    if (!before) return res.status(404).json({ error: "Not found" });

    // Validate using Zod schema
    const updates = validate(UserUpdateSchema, req.body);

    // Additional validation for country codes
    if (
      updates.currentAddress?.country &&
      !isValidCountryCode(updates.currentAddress.country)
    ) {
      return res.status(400).json({ error: "Invalid country code" });
    }

    if (updates.nationality && !isValidCountryCode(updates.nationality)) {
      return res
        .status(400)
        .json({ error: "Invalid nationality country code" });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const after = await db.update<User>(
      USERS_TABLE,
      { id: req.params.id },
      updateData
    );
    const changed: any = {};
    Object.keys(updateData).forEach((k) => {
      if ((updateData as any)[k] !== (before as any)[k])
        changed[k] = (updateData as any)[k];
    });
    await logAudit({
      entityType: "User",
      entityId: req.params.id,
      action: "UPDATE",
      actorUserId: (req as any).user?.sub || "system",
      details: changed,
    });
    res.json(after);
  } catch (error: any) {
    console.error("Failed to update user:", error);
    if (error.details) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details,
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/:id", async (req, res) => {
  await db.delete(USERS_TABLE, { id: req.params.id });
  await logAudit({
    entityType: "User",
    entityId: req.params.id,
    action: "DELETE",
    actorUserId: (req as any).user?.sub || "system",
    details: {},
  });
  res.json({ ok: true });
});
export default router;
