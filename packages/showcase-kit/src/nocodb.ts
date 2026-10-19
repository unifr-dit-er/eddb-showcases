/**
 * NocoDB API client.
 * À utiliser UNIQUEMENT dans les route handlers (src/app/api/).
 * Ne jamais importer ce fichier dans des composants ou des hooks.
 */
export const fetchNocoDB = async (
  path: string,
  params?: Record<string, string>
): Promise<unknown> => {
  const baseUrl = process.env.NEXT_PUBLIC_NOCODB_API_URL
  const token = process.env.NOCODB_API_TOKEN

  const url = new URL(`${baseUrl?.replace(/\/$/, '')}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    headers: {
      'xc-token': token ?? '',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`NocoDB error: ${response.status} — ${body}`)
  }

  return response.json()
}

const NOCODB_PAGE = 1000

/**
 * Every record of a table, page after page, limited to the whitelisted
 * `fields`. Server-side only, like fetchNocoDB.
 */
export const fetchAllRecords = async (
  tableId: string,
  fields: readonly string[],
  where?: string
): Promise<Record<string, unknown>[]> => {
  const records: Record<string, unknown>[] = []
  for (let offset = 0; ; offset += NOCODB_PAGE) {
    const params: Record<string, string> = {
      fields: fields.join(','),
      limit: String(NOCODB_PAGE),
      offset: String(offset),
    }
    if (where) params.where = where
    const data = (await fetchNocoDB(`/api/v2/tables/${tableId}/records`, params)) as {
      list?: Record<string, unknown>[]
      pageInfo?: { isLastPage?: boolean }
    }
    const list = data.list ?? []
    records.push(...list)
    if (data.pageInfo?.isLastPage !== false || list.length === 0) return records
  }
}
