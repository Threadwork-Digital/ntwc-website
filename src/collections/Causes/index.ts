import type { CollectionConfig } from 'payload'
import { adminOnly } from '../../access/adminOnly'
import { editorOrAdmin } from '../../access/editorOrAdmin'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateCause, revalidateDelete } from './hooks/revalidateCause'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Causes: CollectionConfig<'causes'> = {
  slug: 'causes',
  access: {
    create: editorOrAdmin,
    delete: adminOnly,
    read: authenticatedOrPublished,
    update: editorOrAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    category: true,
    donationAmount: true,
    paypalUrl: true,
    heroImage: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'category', 'donationAmount', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'causes',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'causes',
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
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Select from the square image library (800×800px) for the donate index card.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'category',
              type: 'select',
              options: [
                { label: 'Possums', value: 'possums' },
                { label: 'Bats', value: 'bats' },
                { label: 'Macropods', value: 'macropods' },
                { label: 'Birds', value: 'birds' },
                { label: 'Reptiles', value: 'reptiles' },
                { label: 'Monotremes', value: 'monotremes' },
                { label: 'General', value: 'general' },
              ],
              required: true,
            },
            {
              name: 'donationAmount',
              type: 'text',
              admin: {
                description:
                  'Free text to allow for flexible display, e.g. "$25 per box", "$150 per bat, or $100 / $50 / any amount", "Any amount".',
              },
              label: 'Donation amount display',
              required: true,
            },
            {
              name: 'paypalUrl',
              type: 'text',
              admin: {
                description: 'This cause\u2019s dedicated PayPal campaign link.',
              },
              label: 'PayPal campaign URL',
              required: true,
            },
          ],
          label: 'Donation Details',
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
    afterChange: [revalidateCause],
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