import { generateDocumentParts, writeDocumentPartsToString } from '../src/cli'
import { loadOpenApi3 } from '../src/cli/util'
import * as path from 'path'
import * as fs from 'fs'

const writeActuals = process.env.TEST_ENV !== 'ci'

describe('Test examples', () => {
  function testExample(
    exampleName: string,
    writeActual: boolean,
    ext: string = 'json',
    includeHeaders: string[] = [],
  ) {
    const openApiDoc = loadOpenApi3(
      path.join(__dirname, `../examples/${exampleName}.${ext}`),
    )

    const result = writeDocumentPartsToString(
      generateDocumentParts(openApiDoc, includeHeaders),
      {
        disableEslint: true,
      },
    )
    if (writeActual)
      fs.writeFileSync(
        path.join(__dirname, `../examples/${exampleName}.actual.ts`),
        result,
      )

    const approvalDoc = fs.readFileSync(
      path.join(__dirname, `../examples/${exampleName}.ts`),
      'utf-8',
    )

    expect(result).toBe(approvalDoc)
  }

  it('Pet Store', () => {
    testExample('pet-store', writeActuals)
  })
  it('Pet Store Extended', () => {
    testExample('pet-store-expanded', writeActuals)
  })
  it('Uspto', () => {
    testExample('uspto', writeActuals)
  })
  it('Users form data', () => {
    testExample('users-form-data', writeActuals)
  })
  it('nullable', () => {
    testExample('nullable', writeActuals)
  })
  it('nested-any-of-all-of', () => {
    testExample('nested-any-of-all-of', writeActuals)
  })
  it('enums', () => {
    testExample('enums', writeActuals)
  })
  it('yaml file', () => {
    testExample('uspto-yaml', writeActuals, 'yaml')
  })
  it('empty-schemas', () => {
    testExample('empty-schemas', writeActuals)
  })
  it('empty-responses', () => {
    testExample('empty-responses', writeActuals)
  })
  it('Schema with header param', () => {
    testExample('schema-with-header-param', writeActuals, 'yml')
  })
  it('Additional properties', () => {
    testExample('additional-properties', writeActuals)
  })
  it('Special characters in identifiers', () => {
    testExample('special-chars-in-identifiers', writeActuals)
  })
  it('request and response body refs', () => {
    testExample('pet-store-refs', writeActuals)
  })
  it('explicit discriminators', () => {
    testExample('explicit-discriminators', writeActuals)
  })
  it('Schema with all headers', () => {
    testExample('schema-with-all-headers', writeActuals, 'json', ['*'])
  })
  it('Schema with some headers', () => {
    testExample('schema-with-some-headers', writeActuals, 'json', [
      'x-rocks-are-pets',
    ])
  })
})
