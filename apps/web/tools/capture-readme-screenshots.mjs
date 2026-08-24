import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright-core"

const toolDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(toolDirectory, "../../..")
const outputDirectory = resolve(projectRoot, "docs/images")
const temporaryDirectory = mkdtempSync(join(tmpdir(), "gscombat-readme-screenshots-"))
const baseUrl = process.env.README_SCREENSHOT_BASE_URL ?? "https://gscombat.online"
const cwebpBinary = process.env.CWEBP_BIN ?? "cwebp"

mkdirSync(outputDirectory, { recursive: true })

function convertToWebp(sourcePath, outputName, crop = null) {
  const outputPath = join(outputDirectory, outputName)
  const cropArguments = crop === null
    ? []
    : [
        "-crop",
        String(Math.floor(crop.x ?? 0)),
        String(Math.floor(crop.y ?? 0)),
        String(Math.floor(crop.width)),
        String(Math.floor(crop.height))
      ]
  execFileSync(cwebpBinary, ["-quiet", ...cropArguments, "-q", "86", sourcePath, "-o", outputPath], {
    stdio: "inherit"
  })
  console.log(`Generated ${outputPath}`)
}

async function captureElement(page, selector, outputName, maximumHeight = null) {
  const locator = page.locator(selector)
  await locator.waitFor({ state: "visible" })
  await locator.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  const sourcePath = join(temporaryDirectory, `${outputName}.png`)
  const box = await locator.boundingBox()
  if (!box) throw new Error(`Unable to resolve screenshot bounds for ${selector}`)
  await locator.screenshot({
    animations: "disabled",
    path: sourcePath,
    type: "png"
  })
  const crop = maximumHeight !== null && box.height > maximumHeight
    ? { height: maximumHeight, width: box.width }
    : null
  convertToWebp(sourcePath, outputName, crop)
}

async function captureElementRange(page, containerSelector, startSelector, endSelector, outputName, maximumHeight = null) {
  const container = page.locator(containerSelector)
  const start = page.locator(startSelector)
  const end = page.locator(endSelector)
  await container.waitFor({ state: "visible" })
  await start.waitFor({ state: "visible" })
  await end.waitFor({ state: "visible" })
  await start.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)

  const sourcePath = join(temporaryDirectory, `${outputName}.png`)
  await container.screenshot({ animations: "disabled", path: sourcePath, type: "png" })

  const [containerBox, startBox, endBox] = await Promise.all([
    container.boundingBox(),
    start.boundingBox(),
    end.boundingBox()
  ])
  if (!containerBox || !startBox || !endBox) {
    throw new Error(`Unable to resolve screenshot range for ${startSelector} through ${endSelector}`)
  }

  const y = Math.max(0, startBox.y - containerBox.y)
  const measuredHeight = endBox.y + endBox.height - startBox.y
  const height = maximumHeight === null ? measuredHeight : Math.min(measuredHeight, maximumHeight)
  convertToWebp(sourcePath, outputName, { height, width: containerBox.width, x: 0, y })
}

async function selectOptionalEffect(page, label) {
  const option = page.locator("label.toggleRow").filter({ hasText: label })
  await option.first().waitFor({ state: "visible" })
  const checkbox = option.first().locator('input[type="checkbox"]')
  await checkbox.check()
  if (!await checkbox.isChecked()) throw new Error(`Unable to enable ${label}`)
}

async function captureScreenshots() {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  try {
    const context = await browser.newContext({
      colorScheme: "light",
      deviceScaleFactor: 1,
      locale: "zh-CN",
      viewport: { height: 1100, width: 1440 }
    })
    const page = await context.newPage()
    await page.goto(baseUrl, { timeout: 60_000, waitUntil: "domcontentloaded" })
    await page.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
    await page.reload({ timeout: 60_000, waitUntil: "domcontentloaded" })
    await page.addStyleTag({
      content: "* { caret-color: transparent !important; } ::-webkit-scrollbar { display: none; }"
    })
    await page.getByRole("heading", { name: "已配置角色" }).waitFor({ timeout: 60_000 })

    for (const characterName of ["雷电将军", "行秋", "香菱", "班尼特"]) {
      const character = page.locator(".buildGroup").filter({ hasText: characterName })
      await character.getByRole("button", { exact: true, name: "加入队伍" }).click()
    }
    await page.getByText("4/4", { exact: true }).waitFor()

    await page.getByRole("button", { name: /确认队伍并选择指标/ }).click()
    await page.waitForURL(/\/calculate$/)
    await page.getByRole("heading", { name: "选择计算对象" }).waitFor()
    await page.getByRole("button", { name: /雷电将军/ }).first().click()
    await page.getByRole("button", { exact: true, name: "奥义 · 梦想真说 / 初始一刀" }).click()
    const calculateButton = page.getByRole("button", { exact: true, name: "开始计算" })
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent === "开始计算")
      return button instanceof HTMLButtonElement && !button.disabled
    })
    await selectOptionalEffect(page, "雷罚恶曜之眼")
    await selectOptionalEffect(page, "班尼特领域")

    await calculateButton.click()
    await page.locator(".damageHero").waitFor({ state: "visible", timeout: 60_000 })
    await captureElement(page, "#results", "calculation-report.webp", 1250)
    await captureElementRange(
      page,
      ".orderedReport",
      ".substatReport",
      ".weaponReport",
      "upgrade-comparison.webp",
      1400
    )
    await context.close()
  } finally {
    await browser.close()
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }
}

await captureScreenshots()
