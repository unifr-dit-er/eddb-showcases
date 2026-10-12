import { NextResponse } from 'next/server'
import { getArchive } from '@/lib/archive-store'
import { computeFacets } from '@/lib/archive-query'
import { archiveUnavailable } from '@/lib/api-error'

export const GET = async () => {
  try {
    const { articles, series } = await getArchive()
    return NextResponse.json(computeFacets(articles, series))
  } catch (error) {
    return archiveUnavailable(error)
  }
}
