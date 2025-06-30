import sanitizeData from '@shared/helpers/sanitezed-data.helper'

describe('sanitizeData', () => {
  it('should sanitize a simple object with restricted keys', () => {
    const data = { password: 'secret', token: 'token123', name: 'John Doe' }
    const expected = { password: '******', token: '******', name: 'John Doe' }
    expect(sanitizeData(data)).toEqual(expected)
  })

  it('should sanitize a nested object with restricted keys', () => {
    const data = { user: { password: 'secret', token: 'token123', name: 'John Doe' } }
    const expected = { user: { password: '******', token: '******', name: 'John Doe' } }
    expect(sanitizeData(data)).toEqual(expected)
  })

  it('should not sanitize an object with non-restricted keys', () => {
    const data = { name: 'John Doe', email: 'john.doe@example.com' }
    const expected = { name: 'John Doe', email: 'john.doe@example.com' }
    expect(sanitizeData(data)).toEqual(expected)
  })

  it('should handle an object with null values', () => {
    const data = { password: null, token: 'token123', name: 'John Doe' }
    const expected = { password: '******', token: '******', name: 'John Doe' }
    expect(sanitizeData(data)).toEqual(expected)
  })

  it('should handle an object with undefined values', () => {
    const data = { password: undefined, token: 'token123', name: 'John Doe' }
    const expected = { password: '******', token: '******', name: 'John Doe' }
    expect(sanitizeData(data)).toEqual(expected)
  })
})
