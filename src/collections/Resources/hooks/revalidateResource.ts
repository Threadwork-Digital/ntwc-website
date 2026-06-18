import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Resource } from '../../../payload-types'

export const revalidateResource: CollectionAfterChangeHook<Resource> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/resources/${doc.slug}`

      payload.logger.info(`Revalidating resource at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/resources')
      revalidateTag('resources-sitemap', 'max')
    }

    // If the resource was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/resources/${previousDoc.slug}`

      payload.logger.info(`Revalidating old resource at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/resources')
      revalidateTag('resources-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Resource> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/resources/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/resources')
    revalidateTag('resources-sitemap', 'max')
  }

  return doc
}