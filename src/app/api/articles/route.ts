import { NextRequest, NextResponse } from 'next/server'
import { getArchive } from '@/lib/archive-store'
import { parseFilters, queryArticles } from '@/lib/archive-query'
import { archiveUnavailable } from '@/lib/api-error'

export const GET = async (request: NextRequest) => {
  try {
    const { articles } = await getArchive()
    return NextResponse.json(queryArticles(articles, parseFilters(request.nextUrl.searchParams)))
  } catch (error) {
    return archiveUnavailable(error)
  }
}
