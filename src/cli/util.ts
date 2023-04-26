import * as fs from 'fs'
import type { Swagger } from './swagger'
import * as yaml from 'js-yaml'

export function loadOpenApi3(path: string): Swagger.Spec3 {
  if (!fs.existsSync(path)) throw new Error(`No file exists at '${path}'`)
  const fileContents = fs.readFileSync(path, 'utf-8')
  if (/\.ya?ml$/i.test(path)) return yaml.load(fileContents) as Swagger.Spec3
  return JSON.parse(fileContents)
}

export function typeCheckerFor<TTarget>() {
  return {
    hasProp<TSource, TProp extends keyof TTarget>(
      source: TSource,
      prop: TProp,
    ): source is TSource & {
      [key in TProp]-?: Exclude<TTarget[key], undefined>
    } {
      return (
        Object.prototype.hasOwnProperty.call(source, prop) &&
        (source as any)[prop] !== undefined
      )
    },
  }
}

export const notFalsy = <T>(
  value: T,
): value is Exclude<T, 0 | '' | false | null | undefined> => {
  return Boolean(value)
}

export const throwError = (error: Error): never => {
  throw error
}
