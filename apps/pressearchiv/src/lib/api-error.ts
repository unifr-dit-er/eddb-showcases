import { NextResponse } from 'next/server'

// NocoDB error bodies stay in the server log: the client only learns that
// the archive is unavailable.
export const archiveUnavailable = (error: unknown) => {
  console.error('[archive]', error instanceof Error ? error.message : error)
  return NextResponse.json({ error: 'Archive unavailable' }, { status: 502 })
}
