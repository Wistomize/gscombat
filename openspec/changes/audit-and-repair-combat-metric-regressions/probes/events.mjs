import assert from 'node:assert/strict';
import {run} from './runtime.mjs';
const tests=[];
function check(name,fn){try{fn();tests.push({name,pass:true})}catch(e){tests.push({name,pass:false,message:e.message})}}
const action='kinich.skill.scalespiker_cannon.single_hit';
const base=run('Kinich',action);
check('Kinich C6 inherits cannon C1 crit bonus',()=>{
 const crit=base.rotation.events.map(e=>e.trace.find(t=>t.kind==='expected_crit').critDamage);
 assert.equal(crit[1],crit[0]);
});
check('Ineligible two-stack parent cannot activate C6 child',()=>{
 const two='kinich.passive.flame_spirit_pact.hunters_experience.two_stacks.attack_additive_damage';
 const attempted=run('Kinich',action,{active:[two]});
 assert.equal(attempted.actionExpectedDamage,base.actionExpectedDamage);
});
check('Ifa C6 normal arrow includes Yun Jin base addition weighted by probability',()=>{
 const a='ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet';
 const without=run('Ifa',a), withYunJin=run('Ifa',a,{team:['YunJin']});
 const mainDelta=withYunJin.rotation.events[0].expectedDamage-without.rotation.events[0].expectedDamage;
 const extraDelta=withYunJin.rotation.events[1].expectedDamage-without.rotation.events[1].expectedDamage;
 assert.ok(Math.abs(extraDelta-mainDelta*.5)<1e-6,`extraDelta=${extraDelta}, expected=${mainDelta*.5}`);
});
console.log(JSON.stringify(tests,null,2));
process.exitCode=tests.some(t=>!t.pass)?1:0;
