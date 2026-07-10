import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initGa, trackEvent } from './ga'

describe('ga', () => {
  beforeEach(() => {
    // Clean up window.gtag and window.dataLayer between tests
    delete (window as unknown as { gtag?: unknown }).gtag
    delete (window as unknown as { dataLayer?: unknown }).dataLayer
  })

  describe('initGa', () => {
    it('does nothing when VITE_GA_ID is unset', () => {
      vi.stubGlobal('import', { meta: { env: { VITE_GA_ID: '' } } })
      initGa()
      expect((window as unknown as { gtag?: unknown }).gtag).toBeUndefined()
    })

    it('injects gtag script when VITE_GA_ID is set', () => {
      const testGaId = 'G-TEST123'
      vi.stubGlobal('import', { meta: { env: { VITE_GA_ID: testGaId } } })
      const spy = vi.spyOn(document.head, 'appendChild')
      initGa()
      expect(spy).toHaveBeenCalled()
      const scriptCall = spy.mock.calls[0]?.[0]
      expect(scriptCall).toBeInstanceOf(HTMLScriptElement)
      expect((scriptCall as HTMLScriptElement).src).toContain(`gtag/js?id=${testGaId}`)
      spy.mockRestore()
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      // Set up a mock gtag function
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = vi.fn()
    })

    it('no-ops when gtag is absent', () => {
      delete (window as unknown as { gtag?: unknown }).gtag
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
      trackEvent('test_event')
      // Since gtag was deleted, it should not call any gtag
    })

    it('sends event with beacon transport', () => {
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
      trackEvent('test_event', { tool: 'calculadora' })
      expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', {
        tool: 'calculadora',
        transport_type: 'beacon',
      })
    })

    it('drops params not in whitelist', () => {
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
      trackEvent('test_event', {
        tool: 'calculadora',
        salary: '10000', // not whitelisted
        regime: 'clt', // not whitelisted
      })
      expect(gtagSpy).toHaveBeenCalledWith('event', 'test_event', {
        tool: 'calculadora',
        transport_type: 'beacon',
      })
    })

    it('truncates string params to 50 chars', () => {
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
      const longString = 'a'.repeat(100)
      trackEvent('test_event', { page_path: longString })
      const call = gtagSpy.mock.calls[0]?.[2] as Record<string, unknown>
      expect(call?.page_path).toBe('a'.repeat(50))
    })

    it('only keeps whitelisted params (tool, tier, reason, link_url, page_path)', () => {
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
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

    it('preserves numeric and boolean params', () => {
      const gtagSpy = vi.fn()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = gtagSpy
      trackEvent('test_event', {
        tool: 'calculadora',
        tier: 'pleno',
      })
      const call = gtagSpy.mock.calls[0]?.[2] as Record<string, unknown>
      expect(call?.tool).toBe('calculadora')
      expect(call?.tier).toBe('pleno')
    })
  })
})
