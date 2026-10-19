import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/decisions-store'
import { computeFacets, parseFilters, parseLang } from '@/lib/decisions-query'
import { baseUnavailable } from '@/lib/api-error'

// Counts for the filters, given the active filters in the query string.
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams
  try {
    return NextResponse.json(computeFacets(await getStore(), parseFilters(params), parseLang(params)))
  } catch (error) {
    return baseUnavailable(error)
  }
}
