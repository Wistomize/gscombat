import { db, build } from './runtime.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const {evaluateScenario}=await import(pathToFileURL(root+'packages/analyzer/dist/index.js'));
const {raidenNationalBuiltinScenario}=await import(pathToFileURL(root+'packages/content/dist/index.js'));
function evaluate(id,actionId,deltas={}) {
  return evaluateScenario({...raidenNationalBuiltinScenario,primary:build(id),teammates:[],targetActionId:actionId,externalBuffs:[],conditions:{activeEffectIds:[],enemyCount:1,equipmentEffectMode:'maximum_reachable'}},db,{artifactStatDeltas:deltas});
}
const lyney=evaluate('Lyney','lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised');
const lyneyWrong=db.getCharacterSkillParameter('Lyney','auto',12,13);
const lyneyCorrect=db.getCharacterSkillParameter('Lyney','auto',14,13);
console.log('Lyney',JSON.stringify({actual:lyney.actionExpectedDamage,formerWrongParameter:lyneyWrong,correctParameter:lyneyCorrect,scaling:lyney.rotation.events[0].trace.filter(x=>x.kind==='scaling'||x.kind==='scaling_terms')}));
const laylaId='layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit';
const layla=evaluate('Layla',laylaId);
console.log('Layla',JSON.stringify({actual:layla.actionExpectedDamage,plusAttack:evaluate('Layla',laylaId,{atk:100}).actionExpectedDamage,plusHp:evaluate('Layla',laylaId,{hp:1000}).actionExpectedDamage,scaling:layla.rotation.events[0].trace.filter(x=>x.kind==='scaling'||x.kind==='scaling_terms')}));
const xiao=evaluate('Xiao','xiao.burst.bane_of_all_evil.high_plunge');
console.log('XiaoPlunge',JSON.stringify({actual:xiao.actionExpectedDamage,correctParameter:db.getCharacterSkillParameter('Xiao','auto',12,10),scaling:xiao.rotation.events[0].trace.filter(x=>x.kind==='scaling'||x.kind==='scaling_terms')}));
const xiaoSkill=evaluate('Xiao','xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling');
console.log('XiaoSkill',JSON.stringify({actual:xiaoSkill.actionExpectedDamage,damageBonus:xiaoSkill.stats.damageBonus,effects:xiaoSkill.appliedEffects.filter(x=>x.id.startsWith('xiao.'))}));
db.close();
