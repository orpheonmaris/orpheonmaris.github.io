import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const paths=new Map(),reached=new Set();
function dfs(id,path=[],active=new Set()){
 assert.ok(data.graph[id],`Missing question ${id}`);assert.ok(!active.has(id),`Cycle ${id}`);active.add(id);reached.add(id);
 for(const c of data.graph[id].choices){const next=[...path,[id,c.label]];if(c.type==='question')dfs(c.id,next,active);else {assert.equal(c.type,'result');assert.ok(!paths.has(c.ideology));paths.set(c.ideology,next)}}active.delete(id);
}
dfs(data.start);
const answer=(name,id)=>paths.get(name)?.find(([q])=>q===id)?.[1];
test('R44 graph has 201 endpoints and 184 reachable questions',()=>{
 assert.equal(data.version,'U1.119');assert.equal(paths.size,201);assert.equal(reached.size,184);
 assert.deepEqual([...paths.keys()].sort(),Object.keys(data.ideologies).sort());
 assert.deepEqual([...reached].sort(),Object.keys(data.graph).sort());
 assert.equal(data.graph.q_statePriority,undefined);
});
test('all eight libertarian outcomes survive consistent public-programme answers',()=>{
 for(const n of ['Social libertarianism','Geolibertarianism','Libertarian distributism']){
  assert.equal(answer(n,'q_stateFunctions'),'Elected representatives');assert.equal(answer(n,'q_domesticScope'),'Yes');
 }
 for(const n of ['Objectivism','Minarchism','Neolibertarianism','Paleolibertarianism','Right-libertarianism']){
  assert.equal(answer(n,'q_stateFunctions'),'Elected representatives');assert.equal(answer(n,'q_domesticScope'),'No');
 }
 assert.equal(answer('Geolibertarianism','q_geolibertarianBasis'),'Yes');
 assert.equal(answer('Social libertarianism','q_socialLibertarianBasis'),'Yes');
 assert.equal(answer('Libertarian distributism','q_distributistMeans'),'Yes');
 assert.equal(answer('Right-libertarianism','q_minarchy'),'No');
 assert.equal(answer('Minarchism','q_minarchy'),'Yes');
});
test('all graph edges appear in visual layouts and no nodes overlap',()=>{
 const all=new Set(),extended=[];
 for(const [side,l] of Object.entries(layout)){
  const occupied=new Set(),byKey=new Map();
  for(const c of l.cells){
   const k=c.column+':'+c.row;assert.ok(!occupied.has(k),`Overlap ${side} ${k}`);occupied.add(k);
   assert.ok(c.column>=0&&c.row>=0&&c.column<l.width&&c.row<l.height);
   assert.ok(!all.has(c.key));all.add(c.key);byKey.set(c.key,c);
  }
  for(const c of l.cells.filter(c=>c.type==='question'))for(const ans of data.graph[c.id].choices){
   const target=ans.type==='question'?'question:'+ans.id:'result:'+ans.ideology;
   const next=byKey.get(target);assert.ok(next,`Missing diagram link: ${c.key}->${target}`);
   const dist=Math.max(Math.abs(next.column-c.column),Math.abs(next.row-c.row));if(dist!==1)extended.push([side,c.key,target,dist]);
  }
 }
 assert.equal(all.size,384);
 assert.deepEqual(extended,[['pro','question:q_racism','question:q_total',2]]);
});
