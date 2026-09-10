import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../../../../',import.meta.url));
const content = await import(pathToFileURL(`${root}/packages/content/dist/index.js`));
const { GameDataRepository, DEFAULT_GAME_DATA_PATH } = await import(pathToFileURL(`${root}/packages/game-data/dist/index.js`));
const { evaluateScenario, evaluateCombatMetric } = await import(pathToFileURL(`${root}/packages/analyzer/dist/index.js`));
const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH);
const seed = content.raidenNationalBuiltinScenario;
const metrics = content.listCombatMetrics().filter(m => m.status === 'verified');
const weaponIds = { sword:'DullBlade', claymore:'WasterGreatsword', polearm:'BeginnersProtector', catalyst:'ApprenticesNotes', bow:'HuntersBow' };
const buildFor = (characterId, constellation, action) => {
  const weaponType = db.getCharacter(characterId).weaponType;
  return { ...seed.primary, artifacts:[], buildId:`audit.${characterId}`, label:characterId, characterId, constellation, talents:{normal:10,skill:10,burst:10}, weapon:{...seed.primary.weapon,weaponId:weaponIds[weaponType],refinement:1}, ...(characterId === 'Traveler' ? {variant:{kind:'traveler',gender:'male',element:action?.travelerElement ?? 'anemo'}} : {}) };
};
const rows = [];
for (const metric of metrics) {
  const action = metric.kind === 'damage' ? content.getCombatActionDefinition(metric.actionId) : content.getCombatActionDefinition(metric.sourceActionId);
  for (let constellation=0;constellation<=6;constellation++) {
    const build = buildFor(metric.characterId,constellation,action);
    const row = {metricId:metric.id,characterId:metric.characterId,kind:metric.kind,c:constellation,minimum:metric.minimumSourceConstellation ?? 0};
    try {
      const scenario = {...seed,primary:build,teammates:[],conditions:{activeEffectIds:[],enemyCount:1,equipmentEffectMode:'maximum_reachable'},externalBuffs:[],targetActionId:metric.actionId};
      const result = metric.kind === 'damage'
        ? evaluateScenario(scenario,db)
        : evaluateCombatMetric({build,gameData:db,metricId:metric.id,context:{source:{currentHpFraction:0.5},teammates:[],recipient:{buildId:build.buildId,currentHpFraction:0.5,incomingHealingBonus:0,isMoonsign:true,isWithinSourceArea:true}}});
      row.value = metric.kind === 'damage' ? result.actionExpectedDamage : result.value;
      row.finite = Number.isFinite(row.value);
      row.eventCount = result.rotation?.events.length;
      row.stages = result.rotation?.events[0]?.trace?.map(x=>x.stage);
      if (constellation < row.minimum) row.unexpectedGateSuccess=true;
    } catch(error) { row.error=error.message; row.expectedGate=constellation < row.minimum; }
    rows.push(row);
  }
}
const group = list => [...new Map(list.map(x=>[x.metricId,{...x,stages:undefined}])).values()];
const decreases = [];
for (let i=1;i<rows.length;i++) {
  const a=rows[i-1],b=rows[i];
  if (a.metricId===b.metricId && Number.isFinite(a.value) && Number.isFinite(b.value) && b.value<a.value-1e-8) decreases.push({metricId:b.metricId,from:a.c,to:b.c,before:a.value,after:b.value});
}
const summary = {metrics:metrics.length,characters:new Set(metrics.map(x=>x.characterId)).size,attempts:rows.length,ok:rows.filter(x=>!x.error).length,expectedGateErrors:rows.filter(x=>x.error&&x.expectedGate).length,unexpectedErrors:group(rows.filter(x=>x.error&&!x.expectedGate)),nonfinite:group(rows.filter(x=>x.finite===false)),zeros:group(rows.filter(x=>x.value===0)),gateLeaks:group(rows.filter(x=>x.unexpectedGateSuccess)),decreases};
console.log(JSON.stringify(summary));
db.close();
