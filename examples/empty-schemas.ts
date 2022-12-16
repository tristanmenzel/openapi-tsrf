/* eslint-disable */
export type EmptyType = { /* empty object */ [key in never]: never }
export type Director = {
  directorAddress?: (address
    & { /* empty object */ [key in never]: never })
}
export type address = {
  unitNumber?: string
  streetNumber: string
  streetName: string
  streetType: string
  city: string
  state: string
  postcode: string
}
