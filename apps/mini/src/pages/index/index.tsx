import { evaluateExpectedDamage } from "@project-b/calculator"
import { createRaidenNationalFoundationInput } from "@project-b/content"
import { Text, View } from "@tarojs/components"

import "./index.css"

const stageLabels = [
  ["01", "面板"],
  ["02", "倍率"],
  ["03", "增伤"],
  ["04", "暴击"],
  ["05", "防御"],
  ["06", "抗性"]
] as const

export default function IndexPage() {
  const baseline = evaluateExpectedDamage(createRaidenNationalFoundationInput().input)
  const candidate = evaluateExpectedDamage(
    createRaidenNationalFoundationInput({ additionalAttackPercent: 0.05 }).input
  )
  const gain = candidate.expectedDamage / baseline.expectedDamage - 1

  return (
    <View className="page">
      <View className="topline">
        <Text className="brand">PROJECT B</Text>
        <Text className="state">FOUNDATION</Text>
      </View>

      <View className="hero">
        <Text className="eyebrow">DAMAGE LAB · 伤害观测站</Text>
        <Text className="title">把属性放回它真正的乘区。</Text>
        <Text className="summary">从雷神国家队开始，计算、解释并比较每一条属性。</Text>
      </View>

      <View className="card">
        <View className="cardHeader">
          <View>
            <Text className="caption">CURRENT BENCHMARK</Text>
            <Text className="cardTitle">雷神国家队 · 大招首刀</Text>
          </View>
          <Text className="badge">示意数据</Text>
        </View>

        <View className="readout">
          <Text className="readoutLabel">期望伤害</Text>
          <Text className="damage">{Math.round(baseline.expectedDamage).toLocaleString("zh-CN")}</Text>
        </View>

        <View className="comparison">
          <View>
            <Text className="comparisonLabel">反事实干预</Text>
            <Text className="comparisonValue">+5.0% 攻击力</Text>
          </View>
          <View className="gain">
            <Text className="comparisonLabel">收益</Text>
            <Text className="gainValue">+{(gain * 100).toFixed(2)}%</Text>
          </View>
        </View>

        <Text className="notice">当前仅验证共享计算链路，并非已校验的游戏数据。</Text>
      </View>

      <View className="stages">
        {stageLabels.map(([number, label]) => (
          <View className="stage" key={number}>
            <Text>{number}</Text>
            <Text>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
