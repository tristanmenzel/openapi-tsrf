import { iterateDictionary, yieldMap } from './iteration-helpers'
import type { Swagger } from './swagger'
import type { AsyncDocumentParts } from './output'
import { DecIndent, IncIndent } from './output'
import { makeSafeTypeIdentifier } from './sanitization'

export function* generateSchema(
  name: string,
  schema: Swagger.Schema3,
): AsyncDocumentParts {
  const safeName = makeSafeTypeIdentifier(name)
  if (schema.oneOf) {
    yield `export type ${safeName} =`
    yield IncIndent
    yield* yieldMap(schema.oneOf, subSchema => `| ${getTypeName(subSchema)}`)
    yield DecIndent
    return
  }
  if (schema.allOf) {
    yield `export type ${safeName} =`
    yield IncIndent
    yield* yieldMap(schema.allOf, subSchema => `& ${getTypeName(subSchema)}`)
    yield DecIndent
    return
  }
  if (schema.anyOf) {
    yield `export type ${safeName} =`
    yield IncIndent
    yield* yieldMap(
      schema.anyOf,
      subSchema => `& Partial<${getTypeName(subSchema)}>`,
    )
    yield DecIndent
    return
  }

  switch (schema.type) {
    case 'object':
      yield `export interface ${safeName} {`
      yield IncIndent
      for (const [propName, propDef] of iterateDictionary(schema.properties)) {
        yield `${propName}${
          schema.required?.includes(propName) ? '' : '?'
        }: ${getTypeName(propDef)}`
      }
      yield DecIndent
      yield '}'
      break
    case 'array':
    case 'number':
    case 'integer':
    case 'boolean':
    case 'string':
      yield `export type ${safeName} = ${getTypeName(schema)}`
      break
    default:
      throw new Error(
        `Unsupported schema: ${name} \n${JSON.stringify(schema, undefined, 2)}`,
      )
  }
}

export function getTypeName(
  schema: Swagger.Schema3 | Swagger.BaseSchema | undefined,
): string {
  if (schema === undefined) return 'unknown'
  if (schema.$ref) {
    const schemaPath = '#/components/schemas/'
    if (!schema.$ref.startsWith(schemaPath))
      throw new Error(`Unsupported: $refs must start with ${schemaPath}`)
    return makeSafeTypeIdentifier(schema.$ref.substring(schemaPath.length))
  }
  switch (schema.type) {
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'string':
      if (schema.enum) {
        return schema.enum
          .map(x => (typeof x === 'string' ? `'${x}'` : x))
          .join(' | ')
      }
      return 'string'
    case 'array':
      return `Array<${getTypeName(schema.items)}>`
    case 'object':
      const objSchema = schema as Swagger.Schema3
      return `{${iterateDictionary(objSchema.properties)
        .map(
          ([propName, propDef]) =>
            `${propName}${
              objSchema.required?.includes(propName) ? '' : '?'
            }: ${getTypeName(propDef)}`,
        )
        .join(', ')}}`
    default:
      throw new Error(
        `Unsupported schema: ${JSON.stringify(schema, undefined, 2)}`,
      )
  }
}
