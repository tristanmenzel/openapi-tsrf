import type { AsyncDocumentParts } from './index'
import { DecIndent, IncIndent } from './index'

export function* generateImportRequestTypes(): AsyncDocumentParts {
  yield "import type { GetRequest, PostRequest, PutRequest, PatchRequest, OptionsRequest, DeleteRequest } from 'openapi-tsrf'"
}

export function* generateQueryHelper(): AsyncDocumentParts {
  yield 'export const toQuery = (o: {[key: string]: any}): string => {'
  yield IncIndent
  yield 'const q = Object.keys(o)'
  yield IncIndent
  yield '.map(k => ({k, v: o[k]}))'
  yield '.filter(x => x.v !== undefined && x.v !== null)'
  yield '.map(x => Array.isArray(x.v)'
  yield IncIndent
  yield "? x.v.map(v => `${encodeURIComponent(x.k)}=${encodeURIComponent(v)}`).join('&')"
  yield ': `${encodeURIComponent(x.k)}=${encodeURIComponent(x.v)}`)'
  yield DecIndent
  yield ".join('&')"
  yield DecIndent
  yield "return q ? `?${q}` : ''"
  yield DecIndent
  yield '}'
}

export function* generateFormDataHelper(): AsyncDocumentParts {
  yield 'export const toFormData = (o: Record<string, any>): FormData => {'
  yield IncIndent
  yield 'const fd = new FormData()'
  yield 'Object.entries(o).forEach(([key, data]) => fd.append(key, data))'
  yield 'return fd'
  yield DecIndent
  yield '}'
}
