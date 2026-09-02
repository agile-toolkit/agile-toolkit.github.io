import { describe, it, expect } from 'vitest'
import { timeAgo, trunc, plural } from './utils'

describe('timeAgo', () => {
  it('reports "just now" for very recent timestamps', () => {
    expect(timeAgo(Date.now())).toBe('just now')
  })
  it('reports minutes ago', () => {
    expect(timeAgo(Date.now() - 5 * 60000)).toBe('5m ago')
  })
  it('reports hours ago', () => {
    expect(timeAgo(Date.now() - 3 * 3600000)).toBe('3h ago')
  })
  it('reports days ago', () => {
    expect(timeAgo(Date.now() - 2 * 86400000)).toBe('2d ago')
  })
  it('reports weeks ago', () => {
    expect(timeAgo(Date.now() - 14 * 86400000)).toBe('2w ago')
  })
  it('reports months ago', () => {
    expect(timeAgo(Date.now() - 90 * 86400000)).toBe('3mo ago')
  })
})

describe('trunc', () => {
  it('leaves short strings untouched', () => {
    expect(trunc('hello', 10)).toBe('hello')
  })
  it('truncates long strings with an ellipsis', () => {
    expect(trunc('hello world', 8)).toBe('hello w…')
    expect(trunc('hello world', 8).length).toBe(8)
  })
})

describe('plural', () => {
  it('uses the singular form for n === 1', () => {
    expect(plural(1, 'item')).toBe('item')
  })
  it('appends "s" by default for other counts', () => {
    expect(plural(0, 'item')).toBe('items')
    expect(plural(5, 'item')).toBe('items')
  })
  it('uses a supplied irregular plural', () => {
    expect(plural(2, 'story', 'stories')).toBe('stories')
    expect(plural(1, 'story', 'stories')).toBe('story')
  })
})
