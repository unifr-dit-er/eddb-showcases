import { NextResponse } from 'next/server'

// NocoDB error bodies stay in the server log: the client only learns that
// the base is unavailable.
export const baseUnavailable = (error: unknown) => {
  console.error('[datacant]', error instanceof Error ? error.message : error)
  return NextResponse.json({ error: 'Base unavailable' }, { status: 502 })
}
