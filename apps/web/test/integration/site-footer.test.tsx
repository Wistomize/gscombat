import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, it } from "vitest"
import RootLayout from "../../app/layout"
import gameDataSource from "../../../../packages/game-data/sources/current.json"

it("shows the pinned game-data version in the footer", () => {
  const html = renderToStaticMarkup(createElement(RootLayout, { children: "content" }))
  expect(html).toContain(`游戏数据版本：${gameDataSource.gameVersion}`)
  expect(html).toContain('aria-label="站点信息"')
})
