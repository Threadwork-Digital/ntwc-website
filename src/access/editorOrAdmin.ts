import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isEditorOrAdmin = (args: AccessArgs<User>) => boolean

export const editorOrAdmin: isEditorOrAdmin = ({ req: { user } }) => {
  return Boolean(user?.role === 'admin' || user?.role === 'editor')
}