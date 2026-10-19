export interface Keyword {
  id: string
  label: string
  category: string
}

// A keyword in the sidebar, with the number of decisions it would leave.
export interface KeywordFacet extends Keyword {
  count: number
}
