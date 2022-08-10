import * as fs from 'fs'
import type { Swagger } from './swagger'

export function loadOpenApi3(path: string): Swagger.Spec3 {
  if (!fs.existsSync(path)) throw new Error(`No file exists at '${path}'`)
  // TODO: consider validation
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}
