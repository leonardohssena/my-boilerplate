import removeSpaces from '@shared/helpers/string-remove-spaces.helper'

describe('removeSpaces function', () => {
  it('should return empty string when input is empty', () => {
    expect(removeSpaces('')).toBe('')
  })

  it('should return original string when no spaces are present', () => {
    expect(removeSpaces('hello')).toBe('hello')
  })

  it('should replace single space with underscore', () => {
    expect(removeSpaces('hello world')).toBe('hello_world')
  })

  it('should replace multiple spaces with underscores', () => {
    expect(removeSpaces('hello   world')).toBe('hello___world')
  })

  it('should remove leading and trailing spaces', () => {
    expect(removeSpaces('   hello world   ')).toBe('___hello_world___')
  })

  it('should throw error when input is null', () => {
    expect(() => removeSpaces(null)).toThrow()
  })

  it('should throw error when input is undefined', () => {
    expect(() => removeSpaces(undefined)).toThrow()
  })
})
