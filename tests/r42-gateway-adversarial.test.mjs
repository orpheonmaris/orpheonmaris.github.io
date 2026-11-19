import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(readFileSync(resolve(here,'../data/quiz-data.json'),'utf8'));
const audit=JSON.parse(readFileSync(resolve(here,'../editorial/E1-R42-gateway-adversarial-profile-audit-20261118.json'),'utf8'));
const routes=new Map(),reached=new Set(),active=new Set();
let choiceCount=0;
function dfs(id,path=[]){
  assert.ok(data.graph[id],`missing question ${id}`);
  assert.ok(!active.has(id),`cycle at ${id}`);
  active.add(id);reached.add(id);
  for(const c of data.graph[id].choices){
    choiceCount++;
    const next=[...path,{id,answer:c.label}];
    if(c.type==='question')dfs(c.id,next);
    else {assert.equal(c.type,'result');assert.ok(!routes.has(c.ideology),`duplicate ${c.ideology}`);routes.set(c.ideology,next);}
  }
  active.delete(id);
}
dfs(data.start);
function answer(name,q){return routes.get(name)?.find(x=>x.id===q)?.answer;}
function members(q){return [...routes.keys()].filter(name=>answer(name,q)!==undefined);}
test('graph and routes are structurally complete',()=>{
  assert.equal(data.version,'U1.108');
  assert.equal(reached.size,183);assert.equal(choiceCount,383);
  assert.equal(routes.size,201);assert.equal(Object.keys(data.ideologies).length,201);
  assert.deepEqual([...reached].sort(),Object.keys(data.graph).sort());
  assert.deepEqual([...routes.keys()].sort(),Object.keys(data.ideologies).sort());
});
test('96 gate results: 78 / 8 / 10, no unintended route change',()=>{
  assert.equal(members('q_constitution').length,96);
  for(const [choice,total] of Object.entries(audit.scope.gate_options))
    assert.equal(members('q_constitution').filter(n=>answer(n,'q_constitution')===choice).length,total);
  assert.equal(audit.full_96_descendant_inventory.length,96);
});
test('state-functions and minarchy branch inventory is reproduced',()=>{
  for(const [choice,total] of Object.entries(audit.scope.state_functions_options))
    assert.equal(members('q_stateFunctions').filter(n=>answer(n,'q_stateFunctions')===choice).length,total);
  for(const [choice,total] of Object.entries(audit.scope.minarchy_options))
    assert.equal(members('q_minarchy').filter(n=>answer(n,'q_minarchy')===choice).length,total);
});
test('five source-backed minarchy profile answers agree with their path',()=>{
  const a=audit.minarchy_profiles.filter(x=>x.classification==='supported');
  assert.equal(a.length,5);
  for(const p of a)assert.equal(answer(p.name,'q_minarchy'),p.source_based_answer,`profile ${p.name}`);
});
test('known LP-2016 counterexample is recorded, not marked as certified',()=>{
  const p=audit.minarchy_profiles.find(x=>x.name==='Right-libertarianism');
  assert.equal(p.classification,'contradiction');
  assert.equal(p.site_answer,'No');
  assert.equal(p.source_based_answer,'Yes');
  assert.equal(answer(p.name,'q_minarchy'),'No');
  assert.notEqual(p.site_answer,p.source_based_answer);
  assert.equal(audit.classification_status,'OPEN — not independently certified');
});
test('the two undefined profile answers remain unresolved',()=>{
  const a=audit.minarchy_profiles.filter(x=>x.classification==='uncertain');
  assert.deepEqual(a.map(x=>x.name).sort(),['Geolibertarianism','Paleolibertarianism']);
  for(const p of a)assert.equal(p.source_based_answer,'Undetermined');
});
test('two source-backed state-authority counterexamples remain explicit',()=>{
  for(const n of ['Stakeholder capitalism','State capitalism']){
    assert.equal(answer(n,'q_stateFunctions'),'Strongman');
    assert.ok(audit.adjacent_counterexamples.some(x=>x.name===n));
  }
});
test.todo('FIX ME: a Yes answer from the LP 2016 platform must reach its intended Right-libertarianism result without violating an ancestor fork');
