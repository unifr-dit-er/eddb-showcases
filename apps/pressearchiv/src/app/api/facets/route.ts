import { NextRequest, NextResponse } from 'next/server'
import { getArchive } from '@/lib/archive-store'
import { computeFacets, parseFilters } from '@/lib/archive-query'
import { archiveUnavailable } from '@/lib/api-error'

// Counts for the filters, given the active filters in the query string.
export const GET = async (request: NextRequest) => {
  try {
    const { articles, series } = await getArchive()
    return NextResponse.json(computeFacets(articles, series, parseFilters(request.nextUrl.searchParams)))
  } catch (error) {
    return archiveUnavailable(error)
  }
}
