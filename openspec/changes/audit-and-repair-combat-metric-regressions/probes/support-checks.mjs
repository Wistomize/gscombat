import { db, heal, build, scenario } from './support-runtime.mjs';
import { fileURLToPath,pathToFileURL } from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const {evaluateScenario,evaluateCombatMetric}=await import(pathToFileURL(root+'packages/analyzer/dist/index.js'));
for(const [id,metric,levels] of [
  ['Diona','diona.skill.icy_paws.press.base_absorption',[1,2,5,6]],
  ['Layla','layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption',[0,1]],
  ['Diona','diona.burst.signature_mix.heal_tick',[5,6]],
  ['Sayu','sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick',[5,6]],
]) for(const c of levels){const r=heal(id,metric,c);console.log(JSON.stringify({id,metric,c,value:r.value,scalingValue:r.scalingValue}));}
for(const recipient of ['YumemizukiMizuki','Fischl']) {
  const source=build('YumemizukiMizuki',6),friend=build(recipient,0);
  const r=evaluateCombatMetric({build:source,metricId:'yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal',gameData:db,context:{teammates:recipient==='Fischl'?[friend]:[],recipient:{buildId:friend.buildId,currentHpFraction:0.5,isWithinSourceArea:true}}});
  console.log('MizukiSnack',JSON.stringify({recipient,value:r.value}));
}
for(const c of [0,1,6]) {
  const r=evaluateScenario(scenario('YumemizukiMizuki','yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl',c,['Fischl']),db);
  console.log('MizukiSwirl',JSON.stringify({c,damage:r.actionExpectedDamage,em:r.stats.elementalMastery}));
}
const odette=evaluateScenario(scenario('Odette','odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl',0,[build('YumemizukiMizuki',6)]),db);
console.log('OdetteMizuki',JSON.stringify({damage:odette.actionExpectedDamage,effects:odette.appliedEffects.filter(e=>e.id.includes('yumemizuki'))}));
try {evaluateScenario(scenario('Ineffa','ineffa.normal.auto.first_hit'),db);}catch(error){console.log('Ineffa',error.message);}
db.close();
