import { NextRequest, NextResponse } from 'next/server'
import { fetchNocoDB } from '@eddb/showcase-kit/nocodb'
import { getStore } from '@/lib/decisions-store'
import { NOCODB_TABLES } from '@/lib/decisions-config'
import { attachmentPath } from '@/lib/decisions-mappers'
import { baseUnavailable } from '@/lib/api-error'

// The PDF of a decision. NocoDB signs attachment links for a couple of
// hours only: the link is asked afresh on each download, then followed.
export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  try {
    const decision = (await getStore()).decisionsById.get(id)
    if (!decision?.hasPdf) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const record = (await fetchNocoDB(`/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records/${decision.id}`, {
      fields: 'Attachment',
    })) as Record<string, unknown>
    const path = attachmentPath(record)
    if (!path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const base = process.env.NEXT_PUBLIC_NOCODB_API_URL?.replace(/\/$/, '') ?? ''
    const target = /^https?:\/\//.test(path) ? path : `${base}/${path.replace(/^\//, '')}`
    const response = NextResponse.redirect(target, 302)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    return baseUnavailable(error)
  }
}
