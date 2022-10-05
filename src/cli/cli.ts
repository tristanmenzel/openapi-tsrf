import { Command } from 'commander'
import * as fs from 'fs'
import { generateDocumentParts, writeDocumentPartsToStream } from './index'

const program = new Command()

program
  .command('generate')
  .description(
    'Generates a request factory document from the specified openapi doc',
  )
  .option('-o --openapi <file>', 'The path to the openapi doc')
  .option(
    '-rf --request-factory <file>',
    'The path where the request factory should be written',
  )
  .option(
    '--disable-eslint',
    'Add /* eslint-disable */ to the top of the output file',
  )
  .action(
    (options: {
      openapi: string
      requestFactory: string
      disableEslint: boolean
    }) => {
      console.debug(options)
      if (!options.openapi || !fs.existsSync(options.openapi)) {
        console.error(
          '"--openapi" must be present and point to a valid openapi file.',
        )
        return
      }

      const openapiDoc = JSON.parse(fs.readFileSync(options.openapi, 'utf-8'))
      const output = generateDocumentParts(openapiDoc)

      const file = fs.createWriteStream(options.requestFactory, {
        flags: 'w',
      })

      writeDocumentPartsToStream(output, file, {
        disableEslint: options.disableEslint,
      })
      file.end()
    },
  )

export function cli(args: string[]) {
  program.parse(args)
}
