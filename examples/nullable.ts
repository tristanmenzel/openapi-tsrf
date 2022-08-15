/* eslint-disable */
export type Address = {
  city: string
  country: string
  line1: string
  line2: null | string
  state: string
  zip: string
}
export type User = {
  address: null | Address
}
