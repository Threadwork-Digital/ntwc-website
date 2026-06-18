import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Cause } from '../../../payload-types'

export const revalidateCause: CollectionAfterChangeHook<Cause> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/donate/${doc.slug}`

      payload.logger.info(`Revalidating cause at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/donate')
      revalidateTag('causes-sitemap', 'max')
    }

    // If the cause was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/donate/${previousDoc.slug}`

      payload.logger.info(`Revalidating old cause at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/donate')
      revalidateTag('causes-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Cause> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/donate/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/donate')
    revalidateTag('causes-sitemap', 'max')
  }

  return doc
}