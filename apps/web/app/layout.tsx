import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"
import "./workspace.css"
import "./calculation-controls.css"
import "./calculation-report.css"

export const metadata: Metadata = {
  description: "原神角色指标与战斗伤害分析工作台。",
  title: "GSCombat · 原神战斗分析爽"
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
