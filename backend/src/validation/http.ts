import { ZodError, ZodSchema, infer as zInfer } from "zod";

export function jsonParse<T = unknown>(body: string | null | undefined): T {
  if (!body) return {} as T;
  try {
    return JSON.parse(body) as T;
  } catch {
    throw badRequest("Invalid JSON body");
  }
}

export function validate<S extends ZodSchema>(
  schema: S,
  data: unknown
): zInfer<S> {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      const details = e.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      }));
      throw badRequest("Validation failed", details);
    }
    throw e;
  }
}

export function badRequest(message = "Bad Request", details?: unknown) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    details?: unknown;
  };
  err.statusCode = 400;
  if (details) err.details = details;
  return err;
}

export function response(statusCode: number, payload: unknown) {
  return {
    statusCode,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      // TODO: this must be restricted to the origin of the request
      "Access-Control-Allow-Origin": "*",
    },
  };
}
