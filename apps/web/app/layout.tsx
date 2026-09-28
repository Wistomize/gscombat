import type { Metadata } from "next"
import type { ReactNode } from "react"
import gameDataSource from "../../../packages/game-data/sources/current.json"

import "./globals.css"
import "./workspace.css"
import "./calculation-controls.css"
import "./calculation-report.css"

export const metadata: Metadata = {
  description: "原神角色指标与战斗伤害分析工作台。",
  title: "角色数据分析"
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const githubUrl = process.env.SITE_FOOTER_GITHUB_URL
  const contactText = process.env.SITE_FOOTER_CONTACT
  const icpRecord = process.env.SITE_ICP_RECORD
  const icpRecordUrl = process.env.SITE_ICP_RECORD_URL
  const publicSecurityRecord = process.env.SITE_PUBLIC_SECURITY_RECORD
  const publicSecurityRecordUrl = process.env.SITE_PUBLIC_SECURITY_RECORD_URL

  return (
    <html lang="zh-CN">
      <body>
        {children}
          <footer aria-label="站点信息" className="siteFooter">
            <div className="siteFooterLinks">
              <span>GSCombat</span>
              <span>游戏数据版本：{gameDataSource.gameVersion}</span>
              {githubUrl ? (
                <a href={githubUrl} rel="noreferrer" target="_blank">
                  GitHub
                </a>
              ) : null}
              {contactText ? <span>{contactText}</span> : null}
              {icpRecord ? (
                icpRecordUrl ? (
                  <a href={icpRecordUrl} rel="noreferrer" target="_blank">
                    {icpRecord}
                  </a>
                ) : (
                  <span>{icpRecord}</span>
                )
              ) : null}
              {publicSecurityRecord ? (
                publicSecurityRecordUrl ? (
                  <a href={publicSecurityRecordUrl} rel="noreferrer" target="_blank">
                    {publicSecurityRecord}
                  </a>
                ) : (
                  <span>{publicSecurityRecord}</span>
                )
              ) : null}
            </div>
          </footer>
      </body>
    </html>
  )
}
