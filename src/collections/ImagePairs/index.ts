import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { adminOnly } from '../../access/adminOnly'
import { authenticated } from '../../access/authenticated'
import { editorOrAdmin } from '../../access/editorOrAdmin'

export const ImagePairs: CollectionConfig<'image-pairs'> = {
  slug: 'image-pairs',
  access: {
    create: editorOrAdmin,
    delete: adminOnly,
    read: authenticated,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['title', 'baseName', 'heroImage', 'squareImage'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Human-readable description shown when selecting an image pair elsewhere, e.g. "Possum in nest box".',
      },
      required: true,
    },
    {
      name: 'baseName',
      type: 'text',
      admin: {
        description:
          'The shared filename base, without the hdr_/sqr_ prefix or file extension. E.g. for hdr_possum01.png and sqr_possum01.png, enter "possum01".',
      },
      required: true,
      unique: true,
    },
    {
      name: 'heroImage',
      type: 'relationship',
      admin: {
        description: 'Automatically matched to hdr_{baseName}.png on save. Read-only.',
        readOnly: true,
      },
      relationTo: 'media',
    },
    {
      name: 'squareImage',
      type: 'relationship',
      admin: {
        description: 'Automatically matched to sqr_{baseName}.png on save. Read-only.',
        readOnly: true,
      },
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Nothing to do yet if baseName hasn't been entered
        if (!data?.baseName) {
          return data
        }

        const heroFilename = `hdr_${data.baseName}.png`
        const squareFilename = `sqr_${data.baseName}.png`

        const heroResult = await req.payload.find({
          collection: 'media',
          where: {
            filename: {
              equals: heroFilename,
            },
          },
          limit: 1,
        })

        const squareResult = await req.payload.find({
          collection: 'media',
          where: {
            filename: {
              equals: squareFilename,
            },
          },
          limit: 1,
        })

        const missing: string[] = []
        if (heroResult.docs.length === 0) {
          missing.push(heroFilename)
        }
        if (squareResult.docs.length === 0) {
          missing.push(squareFilename)
        }

        // Fail loudly and specifically if either image is missing
        if (missing.length > 0) {
          throw new APIError(
            `Could not find the following image(s) in the Media library: ${missing.join(', ')}. Check they have been uploaded with the exact filename before saving this image pair.`,
            400,
          )
        }

        return {
          ...data,
          heroImage: heroResult.docs[0].id,
          squareImage: squareResult.docs[0].id,
        }
      },
    ],
  },
}