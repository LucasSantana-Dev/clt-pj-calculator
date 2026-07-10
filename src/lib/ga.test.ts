import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initGa, trackEvent } from './ga'

type FakeWindow = {
  gtag?: (...args: unknown[]) => void
  dataLayer?: unknown[]
}

// Node test env has no DOM: stub the four APIs ga.ts touches
// (window.gtag/dataLayer, document.createElement, document.head.appendChild).
const fakeWindow: FakeWindow = {}
const appendChild = vi.fn()
const createElement = vi.fn(() => ({ async: false, src: '' }))

beforeEach(() => {
  delete fakeWindow.gtag
  delete fakeWindow.dataLayer
  appendChild.mockClear()
  createElement.mockClear()
  vi.stubGlobal('window', fakeWindow)
  vi.stubGlobal('document', { createElement, head: { appendChild } })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('initGa', () => {
  it('does nothing when VITE_GA_ID is unset', () => {
    vi.stubEnv('VITE_GA_ID', '')
    initGa()
    expect(fakeWindow.gtag).toBeUndefined()
    expect(appendChild).not.toHaveBeenCalled()
  })

  it('injects gtag script and queues js+config when VITE_GA_ID is set', () => {
    vi.stubEnv('VITE_GA_ID', 'G-TEST123')
    initGa()
    expect(createElement).toHaveBeenCalledWith('script')
    const el = createElement.mock.results[0]?.value as { src: string; async: boolean }
    expect(el.src).toContain('gtag/js?id=G-TEST123')
    expect(el.async).toBe(true)
    expect(appendChild).toHaveBeenCalledWith(el)
    expect(typeof fakeWindow.gtag).toBe('function')
    // official snippet semantics: Arguments objects pushed into dataLayer
    expect(fakeWindow.dataLayer).toHaveLength(2)
    const configCall = fakeWindow.dataLayer?.[1] as IArguments
    expect(Array.from(configCall)).toEqual(['config', 'G-TEST123'])
  })
})

describe('trackEvent', () => {
  it('no-ops when gtag is absent', () => {
    expect(() => trackEvent('test_event', { tool: 'calculadora' })).not.toThrow()
  })

  it('sends event with beacon transport', () => {
    const gtagSpy = vi.fn()
    fakeWindow.gtag = gtagSpy
    trackEvent('test_event', { tool: 'calculadora' })
    expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', {
      tool: 'calculadora',
      transport_type: 'beacon',
    })
  })

  it('drops params not in whitelist (salary/regime unsendable)', () => {
    const gtagSpy = vi.fn()
    fakeWindow.gtag = gtagSpy
    trackEvent('test_event', {
      tool: 'calculadora',
      salary: '10000',
      regime: 'clt',
    })
    expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', {
      tool: 'calculadora',
      transport_type: 'beacon',
    })
  })

  it('truncates string params to 50 chars', () => {
    const gtagSpy = vi.fn()
    fakeWindow.gtag = gtagSpy
    trackEvent('test_event', { page_path: 'a'.repeat(100) })
    const call = gtagSpy.mock.calls[0]?.[2] as Record<string, unknown>
    expect(call?.page_path).toBe('a'.repeat(50))
  })

  it('only keeps whitelisted params (tool, tier, reason, link_url, page_path)', () => {
    const gtagSpy = vi.fn()
    fakeWindow.gtag = gtagSpy
    trackEvent('test_event', {
      tool: 'calculadora',
      tier: 'pleno',
      reason: 'comparison',
      link_url: 'https://example.com',
      page_path: '/path',
      malicious_param: 'drop me',
      another_bad: '12345',
    })
    const call = gtagSpy.mock.calls[0]?.[2] as Record<string, unknown>
    expect(call).toEqual({
      tool: 'calculadora',
      tier: 'pleno',
      reason: 'comparison',
      link_url: 'https://example.com',
      page_path: '/path',
      transport_type: 'beacon',
    })
  })

  it('drops non-string values (numbers/booleans unsendable)', () => {
    const gtagSpy = vi.fn()
    fakeWindow.gtag = gtagSpy
    trackEvent('test_event', {
      tool: 'calculadora',
      tier: 42 as unknown as string,
      reason: true as unknown as string,
    })
    const call = gtagSpy.mock.calls[0]?.[2] as Record<string, unknown>
    expect(call).toEqual({ tool: 'calculadora', transport_type: 'beacon' })
  })
})
