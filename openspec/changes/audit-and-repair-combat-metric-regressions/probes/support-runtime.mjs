import { fileURLToPath, pathToFileURL } from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const content=await import(pathToFileURL(root+'packages/content/dist/index.js'));
const {evaluateScenario,evaluateCombatMetric}=await import(pathToFileURL(root+'packages/analyzer/dist/index.js'));
const {GameDataRepository,DEFAULT_GAME_DATA_PATH}=await import(pathToFileURL(root+'packages/game-data/dist/index.js'));
export const db=new GameDataRepository(DEFAULT_GAME_DATA_PATH);
const weapons={sword:'DullBlade',claymore:'WasterGreatsword',polearm:'BeginnersProtector',catalyst:'ApprenticesNotes',bow:'HuntersBow'};
export function build(id,c=6){return {...content.raidenNationalBuiltinBuild,buildId:'audit.'+id,characterId:id,level:90,ascension:6,constellation:c,artifacts:[],talents:{normal:10,skill:10,burst:10},weapon:{weaponId:weapons[db.getCharacter(id).weaponType],level:90,ascension:6,refinement:1}}}
export function scenario(id,action,c=6,team=[]){return {...content.raidenNationalBuiltinScenario,primary:build(id,c),targetActionId:action,teammates:team.map(x=>typeof x==='string'?build(x,0):x),enemy:{defenseReduction:0,level:100,name:'audit',resistance:0.1},externalBuffs:[],conditions:{activeEffectIds:[],enemyCount:1,equipmentEffectMode:'maximum_reachable'}}}
export function heal(id,metric,c=6,opts={}){const primary={...build(id,c),...opts.build};return evaluateCombatMetric({build:primary,metricId:metric,gameData:db,context:{recipient:{buildId:primary.buildId,currentHpFraction:0.5,isWithinSourceArea:true},...opts.context}})}
if(process.argv[2]==='mizuki')for(const c of [0,1,2,6]){const r=evaluateScenario(scenario('YumemizukiMizuki','yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl',c,['Fischl']),db);console.log(JSON.stringify({c,damage:r.actionExpectedDamage,em:r.stats.elementalMastery,events:r.rotation.events.map(x=>({id:x.id,damage:x.expectedDamage}))}));}
if(process.argv[2]==='support')for(const [id,metric] of [['Diona','diona.burst.signature_mix.heal_tick'],['Sayu','sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick'],['YumemizukiMizuki','yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal']])for(const c of [5,6])console.log(id,c,JSON.stringify(heal(id,metric,c)));
