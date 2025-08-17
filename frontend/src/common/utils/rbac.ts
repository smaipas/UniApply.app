export function hasAnyRole(userRoles: string[], required: string[]) {
  const set = new Set((userRoles || []).map((role) => role.toUpperCase()))
  return required.some((role) => set.has(role.toUpperCase()))
}
