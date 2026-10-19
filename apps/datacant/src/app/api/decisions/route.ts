import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/decisions-store'
import { parseFilters, parseLang, queryDecisions } from '@/lib/decisions-query'
import { baseUnavailable } from '@/lib/api-error'

export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams
  try {
    return NextResponse.json(queryDecisions(await getStore(), parseFilters(params), parseLang(params)))
  } catch (error) {
    return baseUnavailable(error)
  }
}
