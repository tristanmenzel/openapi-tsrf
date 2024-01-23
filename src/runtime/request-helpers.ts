/// <reference lib="dom" />
export const toQuery = (o: { [key: string]: any }): string => {
  const q = Object.keys(o)
    .map(k => ({ k, v: o[k] }))
    .filter(x => x.v !== undefined && x.v !== null)
    .map(x =>
      Array.isArray(x.v)
        ? x.v
            .map(v => `${encodeURIComponent(x.k)}=${encodeURIComponent(v)}`)
            .join('&')
        : `${encodeURIComponent(x.k)}=${encodeURIComponent(x.v)}`,
    )
    .join('&')
  return q ? `?${q}` : ''
}
export const toFormData = (o: Record<string, any>): FormData => {
  const fd = new FormData()
  Object.entries(o).forEach(([key, data]) => fd.append(key, data))
  return fd
}

export const toHeaders = (o: { [key: string]: any }): Headers => {
    const h = new Headers()
    Object.entries(o).forEach(([key, data]) => h.append(key, data))
    return h
}
