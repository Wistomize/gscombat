import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const { chromium } = createRequire(new URL('../../../apps/web/package.json', import.meta.url))('playwright-core')
const scenario = JSON.parse(readFileSync(new URL('./benchmark-before.json', import.meta.url))).snapshots.ice.scenario
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' })
  await context.addInitScript(({ primary, teammates }) => {
    const builds = [primary, ...teammates]
    localStorage.setItem('project-b.build-library.v1', JSON.stringify({ schemaVersion: 1, builds }))
    localStorage.setItem('project-b.party.v1', JSON.stringify({ memberBuildIds: builds.map(build => build.buildId) }))
  }, scenario)
  const page = await context.newPage()
  const requests = []
  const errors = []
  page.on('request', request => { if (request.method() === 'POST' && request.url().includes('/v1/analysis')) requests.push(request.url()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:4310/calculate')
  await page.locator('.calculationParty button').filter({ hasText: '梦见月瑞希' }).click()
  await page.getByRole('button', { name: '秋沙歌枕巡礼 / 梦浮·反应星扩散·冰（风旋单次爆炸）', exact: true }).click()
  const fullResponse = page.waitForResponse(response => response.url().endsWith('/v1/analysis'), { timeout: 60000 })
  await page.getByRole('button', { name: '开始计算', exact: true }).click()
  const full = await fullResponse
  assert.equal(full.status(), 200)
  await page.locator('.weaponRows').waitFor()
  const stableReport = await page.locator('.orderedReport > article').evaluateAll(nodes => nodes.slice(0, -1).map(node => node.textContent))
  const rows = (await full.json()).analysis.weapons
  for (const [id, refinement] of [['AThousandFloatingDreams', 2], ['TheWidsith', 4]]) {
    const weapon = rows.find(row => row.weaponId === id)
    const response = page.waitForResponse(response => response.url().endsWith('/weapon-comparison'))
    await page.getByLabel(`${weapon.label}精炼等级`, { exact: true }).selectOption(String(refinement))
    const result = await response
    assert.equal(result.status(), 200)
    assert.equal((await result.json()).weapon.refinement, refinement)
    await page.locator('.weaponRow[aria-busy="true"]').waitFor({ state: 'detached' })
  }
  const label = rows.find(row => row.weaponId === 'AThousandFloatingDreams').label
  await page.route('**/v1/analysis/weapon-comparison', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: '验证临时网络失败' }) }), { times: 1 })
  await page.getByLabel(`${label}精炼等级`, { exact: true }).selectOption('3')
  const failedRow = page.locator('.weaponRow').filter({ hasText: label })
  await failedRow.getByRole('alert').waitFor()
  assert.equal(await page.getByLabel(`${label}精炼等级`, { exact: true }).inputValue(), '2')
  const retried = page.waitForResponse(response => response.url().endsWith('/weapon-comparison'))
  await failedRow.getByRole('button', { name: '重试' }).click()
  assert.equal((await retried).status(), 200)
  await page.locator('.weaponRow[aria-busy="true"]').waitFor({ state: 'detached' })
  assert.equal(await page.getByLabel(`${label}精炼等级`, { exact: true }).inputValue(), '3')
  assert.deepEqual(await page.locator('.orderedReport > article').evaluateAll(nodes => nodes.slice(0, -1).map(node => node.textContent)), stableReport)
  assert.equal(requests.filter(url => url.endsWith('/v1/analysis')).length, 1)
  assert.deepEqual(errors, [])
  const screenshot = join(mkdtempSync(join(tmpdir(), 'gscombat-incremental-')), 'weapon-comparison.png')
  await failedRow.scrollIntoViewIfNeeded()
  await page.screenshot({ path: screenshot })
  console.log(JSON.stringify({ fullRequests: 1, partialRequests: requests.length - 1, stableReport: true, retry: 'passed', errors, screenshot }, null, 2))
} finally { await browser.close() }
