import { describe, expect, it } from 'vitest'
import { typeCheckerFor } from '../src/util'

type TypeWithOptionals = {
  a?: number
  b?: string
}

describe('type-checker', () => {
  const checker = typeCheckerFor<TypeWithOptionals>()
  it('returns true when prop has value', () => {
    const x: TypeWithOptionals = {
      a: 1,
      b: 'hello',
    }
    expect(checker.hasProp(x, 'a')).toBe(true)
    expect(checker.hasProp(x, 'b')).toBe(true)
  })
  it('returns false when prop is undefined ', () => {
    const x: TypeWithOptionals = {}
    expect(checker.hasProp(x, 'a')).toBe(false)
    expect(checker.hasProp(x, 'b')).toBe(false)
  })
})
