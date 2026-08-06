import { Text, View } from "@tarojs/components"

import "./index.css"

export default function IndexPage() {
  return (
    <View className="page">
      <View className="topline">
        <Text className="brand">GSCOMBAT</Text>
        <Text className="state">WEBSITE FIRST</Text>
      </View>

      <View className="hero">
        <Text className="eyebrow">原神战斗分析爽</Text>
        <Text className="title">小程序正在接入正式分析服务。</Text>
        <Text className="summary">当前请使用 GSCombat 网站。小程序恢复时将与网站共用同一套配置、API 和计算链路。</Text>
      </View>

      <View className="card">
        <Text className="caption">CURRENT STATUS</Text>
        <Text className="cardTitle">暂停独立计算功能</Text>
        <Text className="notice">这里不再运行早期示意公式，避免产生与正式网站不一致的分析结果。</Text>
      </View>
    </View>
  )
}
