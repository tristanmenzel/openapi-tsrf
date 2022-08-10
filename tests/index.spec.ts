import { generateDocumentParts, writeDocumentPartsToString } from '../src'
import { loadOpenApi3 } from '../src/util'
import * as path from 'path'
import * as fs from 'fs'

const writeActuals = process.env.TEST_ENV !== 'ci'

describe('Test examples', () => {
  function testExample(exampleName: string, writeActual: boolean) {
    const openApiDoc = loadOpenApi3(
      path.join(__dirname, `../examples/${exampleName}.json`),
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
})
