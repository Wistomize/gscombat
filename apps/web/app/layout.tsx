import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"
import "./workspace.css"
import "./calculation-controls.css"
import "./calculation-report.css"

export const metadata: Metadata = {
  description: "原神角色指标与战斗伤害分析工作台。",
  title: "角色数据分析"
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <footer className="siteFooter">
          <a href="https://beian.miit.gov.cn/" rel="noreferrer" target="_blank">
            沪ICP备2026040570号
          </a>
        </footer>
      </body>
    </html>
  )
}
