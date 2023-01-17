/* eslint-disable */
export type StringDict = {
  [key: string]: string
}
export type NumberDict = {
  [key: string]: number
}
export type RefDict = {
  [key: string]: StringDict
}
export type MergedWithDict = {
  FixedProp: number
} & {
  [key: string]: string
}
