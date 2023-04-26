export class ParsingError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
  }

  toString() {
    if (!this.cause) return super.toString()
    return `${super.toString()}\n\nCause:\n${
      this.cause?.toString() ?? '<null>'
    }`
  }
}
