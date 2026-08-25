import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright-core"

const toolDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(toolDirectory, "../../..")
const imageDirectory = resolve(projectRoot, "docs/images")
const outputPath = resolve(imageDirectory, "github-social-preview.png")

function dataUrl(filename, mimeType) {
  const contents = readFileSync(resolve(imageDirectory, filename)).toString("base64")
  return `data:${mimeType};base64,${contents}`
}

const background = dataUrl("github-social-preview-background.webp", "image/webp")
const calculationReport = dataUrl("calculation-report.webp", "image/webp")
const upgradeComparison = dataUrl("upgrade-comparison.webp", "image/webp")

const browser = await chromium.launch({ channel: "chrome", headless: true })

try {
  const page = await browser.newPage({
    colorScheme: "light",
    deviceScaleFactor: 2,
    viewport: { height: 640, width: 1280 }
  })

  await page.setContent(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1280px; height: 640px; overflow: hidden; }
          body {
            color: #121316;
            font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .canvas {
            position: relative;
            width: 1280px;
            height: 640px;
            overflow: hidden;
            background: #fbfaf7 url("${background}") center / cover no-repeat;
          }
          .canvas::before {
            position: absolute;
            inset: 0;
            content: "";
            background: linear-gradient(90deg, rgba(255,255,255,.78) 0%, rgba(255,255,255,.58) 44%, rgba(255,255,255,.08) 72%);
          }
          .copy {
            position: absolute;
            z-index: 2;
            top: 58px;
            left: 66px;
            width: 570px;
          }
          .eyebrow {
            display: inline-flex;
            align-items: center;
            height: 34px;
            padding: 0 15px;
            border: 1px solid rgba(18,19,22,.12);
            border-radius: 999px;
            background: rgba(255,255,255,.72);
            box-shadow: 0 6px 18px rgba(48,52,68,.06);
            font-size: 15px;
            font-weight: 650;
            letter-spacing: .08em;
          }
          .eyebrow::before {
            width: 8px;
            height: 8px;
            margin-right: 9px;
            border-radius: 50%;
            background: #111214;
            content: "";
          }
          h1 {
            margin: 25px 0 0;
            font-family: Inter, "SF Pro Display", "Helvetica Neue", sans-serif;
            font-size: 84px;
            font-weight: 820;
            letter-spacing: -.065em;
            line-height: .96;
          }
          .subtitle {
            margin: 18px 0 0;
            font-size: 31px;
            font-weight: 700;
            letter-spacing: -.035em;
          }
          .promise {
            margin: 16px 0 0;
            color: #4c5058;
            font-size: 25px;
            font-weight: 520;
            letter-spacing: .02em;
          }
          .features {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 34px;
            width: 500px;
          }
          .feature {
            padding: 11px 15px;
            border: 1px solid rgba(25,27,31,.11);
            border-radius: 10px;
            background: rgba(255,255,255,.76);
            box-shadow: 0 8px 24px rgba(44,49,61,.055);
            font-size: 16px;
            font-weight: 620;
          }
          .links {
            display: flex;
            gap: 20px;
            margin-top: 42px;
            color: #555963;
            font-family: Inter, "SF Pro Text", sans-serif;
            font-size: 15px;
            font-weight: 620;
          }
          .links span + span::before {
            margin-right: 20px;
            color: #aaadb4;
            content: "•";
          }
          .product-card {
            position: absolute;
            z-index: 1;
            top: 32px;
            right: 38px;
            width: 568px;
            height: 338px;
            overflow: hidden;
            border: 1px solid rgba(17,18,20,.12);
            border-radius: 18px;
            background: #fff;
            box-shadow: 0 28px 70px rgba(48,57,82,.18), 0 4px 16px rgba(48,57,82,.10);
            transform: rotate(.7deg);
          }
          .product-card::before {
            position: absolute;
            z-index: 2;
            top: 0;
            left: 0;
            width: 100%;
            height: 28px;
            border-bottom: 1px solid rgba(20,22,26,.08);
            background: rgba(250,250,250,.94);
            content: "";
          }
          .window-dots {
            position: absolute;
            z-index: 3;
            top: 10px;
            left: 14px;
            display: flex;
            gap: 6px;
          }
          .window-dots i { width: 8px; height: 8px; border-radius: 50%; background: #d8d9dc; }
          .summary-clip,
          .trace-clip {
            position: absolute;
            left: 0;
            width: 100%;
            overflow: hidden;
          }
          .summary-clip {
            top: 28px;
            height: 168px;
          }
          .trace-clip {
            top: 196px;
            height: 142px;
            border-top: 1px solid rgba(20,22,26,.09);
          }
          .summary-clip img,
          .trace-clip img {
            display: block;
            width: 568px;
          }
          .trace-clip img {
            transform: translateY(-397px);
          }
          .detail-card {
            position: absolute;
            overflow: hidden;
            border: 1px solid rgba(17,18,20,.13);
            border-radius: 14px;
            background: #fff;
            box-shadow: 0 24px 55px rgba(43,50,72,.22), 0 3px 12px rgba(43,50,72,.10);
          }
          .marginal-card {
            z-index: 3;
            right: 103px;
            bottom: 151px;
            width: 520px;
            height: 115px;
            transform: rotate(-.8deg);
          }
          .weapon-card {
            z-index: 4;
            right: 28px;
            bottom: 22px;
            width: 530px;
            height: 146px;
            transform: rotate(1.1deg);
          }
          .detail-card img { display: block; width: 530px; }
          .marginal-card img { width: 520px; }
          .weapon-card img { transform: translateY(-243px); }
        </style>
      </head>
      <body>
        <main class="canvas">
          <section class="copy">
            <div class="eyebrow">OPEN SOURCE · 原神战斗分析</div>
            <h1>GSCombat</h1>
            <div class="subtitle">原神角色数据与战斗分析</div>
            <div class="promise">能打多少 · 提升多少 · 为什么</div>
            <div class="features">
              <span class="feature">期望伤害</span>
              <span class="feature">乘区公式</span>
              <span class="feature">词条边际收益</span>
              <span class="feature">武器对比</span>
            </div>
            <div class="links">
              <span>gscombat.online</span>
              <span>github.com/Wistomize/gscombat</span>
            </div>
          </section>
          <section class="product-card">
            <div class="window-dots"><i></i><i></i><i></i></div>
            <div class="summary-clip"><img src="${calculationReport}" alt="" /></div>
            <div class="trace-clip"><img src="${calculationReport}" alt="" /></div>
          </section>
          <section class="detail-card marginal-card">
            <img src="${upgradeComparison}" alt="" />
          </section>
          <section class="detail-card weapon-card">
            <img src="${upgradeComparison}" alt="" />
          </section>
        </main>
      </body>
    </html>
  `)

  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ animations: "disabled", path: outputPath, type: "png" })
  console.log(`Generated ${outputPath}`)
} finally {
  await browser.close()
}
