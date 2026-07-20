import { evaluateExpectedDamage } from "@project-b/calculator"
import { createRaidenNationalFoundationInput } from "@project-b/content"

const stageLabels = [
  ["01", "面板", "攻击与属性转换"],
  ["02", "倍率", "技能与愿力"],
  ["03", "增伤", "元素与大招"],
  ["04", "暴击", "期望伤害"],
  ["05", "防御", "减防与无视"],
  ["06", "抗性", "最终结算"]
] as const

export default function HomePage() {
  const baselineFixture = createRaidenNationalFoundationInput()
  const candidateFixture = createRaidenNationalFoundationInput({ additionalAttackPercent: 0.05 })
  const baseline = evaluateExpectedDamage(baselineFixture.input)
  const candidate = evaluateExpectedDamage(candidateFixture.input)
  const gain = candidate.expectedDamage / baseline.expectedDamage - 1

  return (
    <main>
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Project B 首页">
          <span className="wordmarkGlyph">β</span>
          <span>PROJECT B</span>
        </a>
        <div className="releaseState">
          <span className="pulse" />
          FOUNDATION BUILD
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">DAMAGE LAB · 伤害观测站</div>
        <h1>
          把每一条属性，
          <em>放回它真正的乘区。</em>
        </h1>
        <p className="heroCopy">
          从雷神国家队开始，以一次大招首刀为基准。每个角色只声明效果，统一流水线负责计算、解释与比较。
        </p>
        <div className="heroMeta">
          <span>网站优先</span>
          <span>Taro 小程序随后</span>
          <span>TypeScript 核心共享</span>
        </div>
      </section>

      <section className="workbench" aria-label="首个伤害分析基准">
        <article className="pipelinePanel">
          <div className="sectionHeading">
            <span>PIPELINE</span>
            <span>6 STAGES</span>
          </div>
          <ol className="stageList">
            {stageLabels.map(([number, title, detail]) => (
              <li key={number}>
                <span className="stageNumber">{number}</span>
                <strong>{title}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="resultPanel">
          <div className="resultTopline">
            <div>
              <span className="resultLabel">CURRENT BENCHMARK</span>
              <h2>雷神国家队 · 大招首刀</h2>
            </div>
            <span className="dataBadge">示意数据</span>
          </div>

          <div className="damageReadout">
            <span>期望伤害</span>
            <strong>{Math.round(baseline.expectedDamage).toLocaleString("zh-CN")}</strong>
            <small>EXPECTED DAMAGE</small>
          </div>

          <div className="intervention">
            <div>
              <span>反事实干预</span>
              <strong>+5.0% 攻击力</strong>
            </div>
            <div className="gain">
              <span>收益</span>
              <strong>+{(gain * 100).toFixed(2)}%</strong>
            </div>
          </div>

          <p className="disclaimer">
            当前数值仅用于验证工程链路，并非已校验的游戏数据。真实角色、武器与圣遗物数据将在内容层单独维护。
          </p>
        </article>
      </section>

      <footer>
        <span>ENGINE / CONTENT / PRESET · foundation-1</span>
        <span>TRACEABLE BY DESIGN</span>
      </footer>
    </main>
  )
}
