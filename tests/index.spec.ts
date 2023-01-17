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
  ) {
    const openApiDoc = loadOpenApi3(
      path.join(__dirname, `../examples/${exampleName}.${ext}`),
    )

    const result = writeDocumentPartsToString(
      generateDocumentParts(openApiDoc),
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
  it('Schema with header param', () => {
    testExample('schema-with-header-param', writeActuals, 'yml')
  })
  it('Additional properties', () => {
    testExample('additional-properties', writeActuals)
  })
})
