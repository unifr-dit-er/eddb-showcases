import { NextResponse } from 'next/server'

// NocoDB error bodies stay in the server log: the client only learns that
// the collection is unavailable.
export const collectionUnavailable = (error: unknown) => {
  console.error('[collection]', error instanceof Error ? error.message : error)
  return NextResponse.json({ error: 'Collection unavailable' }, { status: 502 })
}
