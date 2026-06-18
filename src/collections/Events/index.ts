import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateEvent } from './hooks/revalidateEvent'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    eventType: true,
    date: true,
    location: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'eventType', 'date', 'eventStatus', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'events',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'events',
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
                description: 'Select from the hero image library (1440×480px).',
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
              label: 'Event details',
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'eventType',
              type: 'select',
              options: [
                { label: 'Training', value: 'training' },
                { label: 'Quarterly Meeting', value: 'meeting' },
                { label: 'Guest Speaker', value: 'speaker' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
            },
            {
              name: 'eventStatus',
              type: 'select',
              defaultValue: 'upcoming',
              label: 'Event status',
              options: [
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Past', value: 'past' },
                { label: 'Cancelled', value: 'cancelled' },
              ],
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '50%',
                  },
                  label: 'Start date & time',
                  required: true,
                },
                {
                  name: 'endDate',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    width: '50%',
                  },
                  label: 'End date & time',
                },
              ],
            },
            {
              name: 'location',
              type: 'text',
              admin: {
                description: 'Venue name and/or address, e.g. "Armidale Showground"',
              },
              required: true,
            },
            {
              name: 'registrationUrl',
              type: 'text',
              admin: {
                description: 'Optional external link for RSVP or registration.',
              },
              label: 'Registration link',
            },
            {
              name: 'cateringProvided',
              type: 'checkbox',
              defaultValue: false,
              label: 'Catering provided',
            },
            {
              name: 'dietaryContactEmail',
              type: 'email',
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.cateringProvided),
                description:
                  'Attendees will be asked to contact this address with dietary requirements.',
              },
              label: 'Dietary requirements contact email',
            },
          ],
          label: 'Event Details',
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
    afterChange: [revalidateEvent],
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