import { camelCase } from 'change-case'

const replaceInvalidWithUnderscore = (value: string) =>
  value.replace(/[.\\\/ \-[\]]+/g, '_')

export const makeSafeTypeIdentifier = replaceInvalidWithUnderscore
export const makeSafeMethodIdentifier = (value: string) =>
  camelCase(replaceInvalidWithUnderscore(value))
