import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/collection-store'
import { computeFacets, parseFilters } from '@/lib/collection-query'
import { collectionUnavailable } from '@/lib/api-error'

// Counts for the filters, given the active filters in the query string.
export const GET = async (request: NextRequest) => {
  try {
    const { representations } = await getCollection()
    return NextResponse.json(computeFacets(representations, parseFilters(request.nextUrl.searchParams)))
  } catch (error) {
    return collectionUnavailable(error)
  }
}
