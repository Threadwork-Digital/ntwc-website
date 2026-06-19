import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access/adminOnly'
import { editorOrAdmin } from '../../access/editorOrAdmin'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateResource } from './hooks/revalidateResource'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Resources: CollectionConfig<'resources'> = {
  slug: 'resources',
  access: {
    create: editorOrAdmin,
    delete: adminOnly,
    read: authenticatedOrPublished,
    update: editorOrAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    resourceType: true,
    category: true,
    file: true,
    externalUrl: true,    
    imagePair: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'resourceType', 'category', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'resources',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'resources',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'imagePair',
              type: 'relationship',
              admin: {
                description: 'Select the image pair to use for this resource\u2019s hero and card thumbnail.',
              },
              relationTo: 'image-pairs',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Short description',
            },
            {
              name: 'resourceType',
              type: 'select',
              options: [
                { label: 'Document (PDF)', value: 'document' },
                { label: 'Webinar', value: 'webinar' },
                { label: 'Video', value: 'video' },
                { label: 'Audio', value: 'audio' },
              ],
              required: true,
            },
            {
              name: 'file',
              type: 'upload',
              admin: {
                condition: (_, siblingData) => siblingData?.resourceType === 'document',
                description: 'Upload the PDF file for this document.',
              },
              relationTo: 'media',
            },
            {
              name: 'externalUrl',
              type: 'text',
              admin: {
                condition: (_, siblingData) =>
                  ['webinar', 'video', 'audio'].includes(siblingData?.resourceType),
                description: 'Link to the webinar, video, or audio file (e.g. YouTube, Vimeo, podcast host).',
              },
              label: 'External link',
            },
            {
              name: 'category',
              type: 'select',
              options: [
                { label: 'Governance', value: 'governance' },
                { label: 'Training', value: 'training' },
                { label: 'Code of Practice', value: 'code-of-practice' },
                { label: 'General', value: 'general' },
              ],
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateResource],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}