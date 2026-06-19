import type { CollectionConfig } from 'payload'

import { adminOnly } from '../../access/adminOnly'
import { adminOnlyField } from '../../access/adminOnlyField'
import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Only admins can access the admin panel user management
    admin: authenticated,
    // Only admins can create new users
    create: adminOnly,
    // Only admins can delete users
    delete: adminOnly,
    // Logged-in users can read their own record; admins can read all
    read: authenticated,
    // Admins can update any user; editors can only update themselves
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Editors can update their own record only
      return {
        id: {
          equals: user.id,
        },
      }
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      access: {
        // Only admins can change a user's role
        update: adminOnlyField,
      },
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      required: true,
    },
  ],
  timestamps: true,
}