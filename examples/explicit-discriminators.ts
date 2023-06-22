/* eslint-disable */
export type AnimalImplicit = (Dog
  | Cat)
  & {
    weight: number
  }
export type AnimalExplicit = (Dog
  | Cat)
  & {
    weight: number
  }
export type Dog = {
  shedding?: boolean
  'likes-fetch'?: boolean
  name?: string
  species?: 'dog'
}
export type Cat = {
  'likes-scratching-your-face'?: boolean
  name?: string
  species?: 'cat'
}
