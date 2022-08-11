import type fs from 'fs'

export const IncIndent = Symbol('Increase Indent')
export const DecIndent = Symbol('Decrease Indent')
export const NewLineMode = Symbol('New Line Mode')
export const InlineMode = Symbol('Inline Mode')
export const NewLine = Symbol('New Line')

export type Part =
  | string
  | typeof IncIndent
  | typeof DecIndent
  | typeof NewLineMode
  | typeof InlineMode
  | typeof NewLine
export type AsyncDocumentParts = Generator<Part>

export type WriteOptions = {
  indent?: string
  disableEslint?: boolean
  header?: string
}

interface StringWriter {
  write(value: string): void
  get last(): string
}

export function writeDocumentPartsToStream(
  document: AsyncDocumentParts,
  stream: fs.WriteStream,
  options: WriteOptions = {},
) {
  const writer = {
    _last: '',
    write(val: string) {
      this._last = val
      stream.write(val)
    },
    get last() {
      return this._last
    },
  }
  writeDocumentPartsTo(document, options, writer)
}

export function writeDocumentPartsToString(
  document: AsyncDocumentParts,
  options: WriteOptions = {},
) {
  const writer = {
    result: [] as string[],
    _last: '',
    write(val: string) {
      this._last = val
      this.result.push(val)
    },
    get last() {
      return this._last
    },
    toString() {
      return this.result.join('')
    },
  }
  writeDocumentPartsTo(document, options, writer)
  return writer.toString()
}

function writeDocumentPartsTo(
  document: AsyncDocumentParts,
  { indent = '  ', ...options }: WriteOptions,
  writer: StringWriter,
): void {
  if (options.header) writer.write(`${options.header}\n`)
  if (options.disableEslint) writer.write('/* eslint-disable */\n')

  let newLineMode = true
  let curIndent = ''
  for (const part of document) {
    switch (part) {
      case IncIndent:
        curIndent += indent
        break
      case DecIndent:
        curIndent = curIndent.slice(0, -indent.length)
        break
      case NewLineMode:
        if (writer.last.slice(-1)[0] !== '\n') {
          writer.write('\n')
        }
        newLineMode = true
        break
      case InlineMode:
        newLineMode = false
        break
      case NewLine:
        writer.write('\n')

        break
      default:
        if (writer.last.slice(-1)[0] === '\n') writer.write(curIndent)
        writer.write(part)
        if (newLineMode) writer.write('\n')
        break
    }
  }
}
