import { expect, test } from '@playwright/test'

test('fluxo principal: CLT 9000 gera equivalência, colchão, benchmark e tendências', async ({ page }) => {
  await page.goto('/')

  await page.locator('#gross-value').fill('9000')

  // equivalência calculada com os parâmetros de 2026
  await expect(page.locator('.highlight .highlight-value')).toContainText('9.413', { timeout: 5000 })

  // seções principais renderizam
  await expect(page.locator('.cushion')).toBeVisible()
  await expect(page.locator('.benchmark')).toBeVisible()
  await expect(page.locator('.trends')).toBeVisible()
  await expect(page.locator('.sources')).toBeVisible()

  // dropdown customizado abre e seleciona
  await page.locator('#uf').click()
  await page.getByRole('option', { name: 'Minas Gerais' }).click()
  await expect(page.locator('#uf')).toContainText('Minas Gerais')

  // direção PJ→CLT responde
  await page.getByRole('tab', { name: 'Tenho proposta PJ' }).click()
  await page.locator('#gross-value').fill('15000')
  await expect(page.locator('.highlight .highlight-value')).toContainText('R$', { timeout: 5000 })

  // sem erros de console
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  expect(errors).toHaveLength(0)
})
