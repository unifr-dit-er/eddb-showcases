import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/collection-store'
import { parseFilters, queryRepresentations } from '@/lib/collection-query'
import { collectionUnavailable } from '@/lib/api-error'

export const GET = async (request: NextRequest) => {
  try {
    const { representations } = await getCollection()
    return NextResponse.json(queryRepresentations(representations, parseFilters(request.nextUrl.searchParams)))
  } catch (error) {
    return collectionUnavailable(error)
  }
}
