const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${basePath}${path}`, init)

// A link to the showcase's own routes (href of a download, for instance).
export const withBasePath = (path: string) => `${basePath}${path}`
