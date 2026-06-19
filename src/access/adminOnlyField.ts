import type { FieldAccess } from 'payload'

export const adminOnlyField: FieldAccess = ({ req: { user } }) => {
  return Boolean(user?.role === 'admin')
}