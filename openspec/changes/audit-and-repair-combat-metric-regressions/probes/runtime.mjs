import { fileURLToPath, pathToFileURL } from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const content=await import(pathToFileURL(root+'packages/content/dist/index.js'));
const {evaluateScenario,evaluateCombatMetric}=await import(pathToFileURL(root+'packages/analyzer/dist/index.js'));
const {GameDataRepository,DEFAULT_GAME_DATA_PATH}=await import(pathToFileURL(root+'packages/game-data/dist/index.js'));
export const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH);
export const weapons={sword:'DullBlade',claymore:'WasterGreatsword',polearm:'BeginnersProtector',catalyst:'ApprenticesNotes',bow:'HuntersBow'};
export function build(id,c=6){return {...content.raidenNationalBuiltinBuild,buildId:'audit.'+id,characterId:id,level:90,ascension:6,constellation:c,artifacts:[],talents:{normal:10,skill:10,burst:10},weapon:{weaponId:weapons[db.getCharacter(id).weaponType],level:90,ascension:6,refinement:1}}}
export function run(id,action,opts={}){return evaluateScenario({...content.raidenNationalBuiltinScenario,primary:build(id,opts.c??6),targetActionId:action,teammates:(opts.team??[]).map(x=>build(x,0)),enemy:{defenseReduction:0,level:100,name:'audit',resistance:0.1},externalBuffs:opts.buffs??[],conditions:{activeEffectIds:opts.active??[],enemyCount:1,equipmentEffectMode:'maximum_reachable',...opts.conditions}},db)}
export function brief(result){return {total:result.actionExpectedDamage,stats:result.stats,events:result.rotation.events.map(x=>({id:x.id,damage:x.expectedDamage,trace:x.trace,applied:x.appliedEffectIds}))}}
if(process.argv[2]==='kinich'){for(const active of [[],['kinich.passive.flame_spirit_pact.hunters_experience.two_stacks.attack_additive_damage']])console.log(JSON.stringify(brief(run('Kinich','kinich.skill.scalespiker_cannon.single_hit',{active})),null,2));}
if(process.argv[2]==='catalog') {console.log(content.listCombatActionEffects().filter(x=>x.target==='additionalDamageEvent'&&x.source.kind==='character').map(x=>({id:x.id,filter:x.targetFilter,value:x.value})));}
