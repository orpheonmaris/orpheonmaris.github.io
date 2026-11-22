import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const historic=JSON.parse(readFileSync(resolve(root,'editorial/E1-R42-gateway-adversarial-profile-audit-20261118.json'),'utf8'));
const paths=new Map(),reached=new Set();
function walk(id,path=[],active=new Set()){
 assert.ok(data.graph[id]); assert.ok(!active.has(id)); active.add(id); reached.add(id);
 for(const c of data.graph[id].choices){const p=[...path,[id,c.label]];if(c.type==='question')walk(c.id,p,active);else{assert.ok(!paths.has(c.ideology));paths.set(c.ideology,p)}}active.delete(id);
}
walk(data.start);
const answer=(name,id)=>paths.get(name)?.find(([q])=>q===id)?.[1];
const members=(id)=>[...paths.keys()].filter(n=>answer(n,id)!==undefined);
test('the current graph has 201 unique results and 184 questions',()=>{
 assert.equal(data.version,'U1.114');assert.equal(paths.size,201);assert.equal(reached.size,184);
 assert.deepEqual([...reached].sort(),Object.keys(data.graph).sort());
 assert.deepEqual([...paths.keys()].sort(),Object.keys(data.ideologies).sort());
});
test('the yes/no state gateway now reaches all 99 pro-property state and stateless outcomes',()=>{
 assert.equal(members('q_constitution').length,99);
 assert.equal(members('q_constitution').filter(n=>answer(n,'q_constitution')==='Yes').length,89);
 assert.equal(members('q_constitution').filter(n=>answer(n,'q_constitution')==='No').length,10);
});
test('the elected, leader and sovereign branches preserve distinct outcomes',()=>{
 const counts=Object.fromEntries(['Elected representatives','A dominant leader','A sovereign office or order'].map(label=>[label,members('q_stateFunctions').filter(n=>answer(n,'q_stateFunctions')===label).length]));
 assert.deepEqual(counts,{'Elected representatives':33,'A dominant leader':30,'A sovereign office or order':26});
});
test('R42 minarchy evidence remains available as an historical audit',()=>{
 assert.equal(historic.classification_status,'OPEN — not independently certified');
 const p=historic.minarchy_profiles.find(x=>x.name==='Right-libertarianism');
 assert.equal(p.classification,'contradiction');assert.equal(p.source_based_answer,'Yes');
 assert.equal(answer('Right-libertarianism','q_minarchy'),'No');
 assert.equal(answer('Minarchism','q_minarchy'),'Yes');
});
test('R42 identified state authority counterexamples and R44 does not erase them',()=>{
 for(const name of ['Stakeholder capitalism','State capitalism']){
  assert.ok(historic.adjacent_counterexamples.some(x=>x.name===name));
  assert.equal(answer(name,'q_stateFunctions'),'A dominant leader');
 }
});
