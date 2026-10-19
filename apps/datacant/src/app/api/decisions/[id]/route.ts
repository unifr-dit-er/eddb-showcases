import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/decisions-store'
import { localize, parseLang } from '@/lib/decisions-query'
import { baseUnavailable } from '@/lib/api-error'

// Looked up in the copy held in memory: an unknown id is simply not found.
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  try {
    const store = await getStore()
    const decision = store.decisionsById.get(id)
    if (!decision) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(localize(decision, store, parseLang(request.nextUrl.searchParams)))
  } catch (error) {
    return baseUnavailable(error)
  }
}
