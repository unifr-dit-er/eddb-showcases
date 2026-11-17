import { NextResponse } from 'next/server'
import { getArchive } from '@/lib/archive-store'
import { archiveUnavailable } from '@/lib/api-error'
import type { KeywordLabels } from '@/types/archive'

// Labels of the keywords in the four languages of the interface, from the
// thesaurus; the keywords themselves stay in their stored form in the URL.
export const GET = async () => {
  try {
    const { keywordLabels } = await getArchive()
    return NextResponse.json(Object.fromEntries(keywordLabels) as Record<string, KeywordLabels>)
  } catch (error) {
    return archiveUnavailable(error)
  }
}
