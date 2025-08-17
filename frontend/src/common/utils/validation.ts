import { unref } from 'vue'

export function errorMessageHandler(
  field?: { $errors?: Array<{ $message?: unknown }> } | null,
): string | undefined {
  const errors = field?.$errors
  if (!errors || errors.length === 0) return undefined
  const msg = errors[0]?.$message
  if (msg == null) return undefined
  return typeof msg === 'string' ? msg : (unref(msg) as string)
}
