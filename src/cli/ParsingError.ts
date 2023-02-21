export class ParsingError extends Error {
  constructor(message: string, cause: unknown) {
    super(message)
    this.cause = cause
  }

  toString() {
    return `${super.toString()}\n\nCause:\n${
      this.cause?.toString() ?? '<null>'
    }`
  }
}
