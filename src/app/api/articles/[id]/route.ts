import { NextRequest, NextResponse } from 'next/server'
import { getArchive } from '@/lib/archive-store'
import { archiveUnavailable } from '@/lib/api-error'

// Looked up in the public copy held in memory: an id outside it, or a
// record not cleared for publication, is simply not found.
export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  try {
    const { articlesById } = await getArchive()
    const article = articlesById.get(id)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch (error) {
    return archiveUnavailable(error)
  }
}
