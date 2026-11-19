import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/collection-store'
import { collectionUnavailable } from '@/lib/api-error'
import { toDetail } from '@/lib/collection-query'

// Looked up among the published records held in memory: an unpublished or
// unknown id is simply not found.
export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  try {
    const { representationsById } = await getCollection()
    const representation = representationsById.get(id)
    if (!representation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(toDetail(representation))
  } catch (error) {
    return collectionUnavailable(error)
  }
}
