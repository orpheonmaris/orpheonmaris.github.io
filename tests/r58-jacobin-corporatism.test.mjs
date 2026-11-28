import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const d=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const routes=new Map(),questions=new Set(),incoming=new Map();
function visit(id,path=[],ancestry=new Set()){
 assert.ok(d.graph[id],`Missing ${id}`);assert.ok(!ancestry.has(id),`Cycle ${id}`);
 ancestry.add(id);questions.add(id);
 for(const choice of d.graph[id].choices){
  const np=[...path,[id,choice.label]];
  const edge=choice.type==='question'?`q:${choice.id}`:`r:${choice.ideology}`;
  incoming.set(edge,(incoming.get(edge)||0)+1);
  if(choice.type==='question')visit(choice.id,np,ancestry);
  else {assert.equal(choice.type,'result');assert.ok(!routes.has(choice.ideology));routes.set(choice.ideology,np);}
 }
 ancestry.delete(id);
}
visit(d.start);
const answer=(name,id)=>routes.get(name)?.find(([q])=>q===id)?.[1];
test('201 original outcomes, 185 fixed questions, 385 single-parent edges',()=>{
 assert.equal(d.version,'U1.124');assert.equal(d.counts.ideologies,201);assert.equal(d.counts.routes,201);assert.equal(d.counts.questions,185);
 assert.equal(routes.size,201);assert.equal(questions.size,185);assert.equal(incoming.size,385);assert.ok([...incoming.values()].every(n=>n===1));
 assert.deepEqual([...routes.keys()].sort(),Object.keys(d.ideologies).sort());
 assert.deepEqual([...questions].sort(),Object.keys(d.graph).sort());
});
test('three adjacent results have distinct and correctly sourced descriptions',()=>{
 for(const name of ['Jacobinism','Social democracy','Social corporatism']){
  const card=d.ideologies[name];assert.equal(card.quoteKind,'description');assert.equal(card.author,'Editorial description');
  assert.ok(card.quoteSource?.url?.startsWith('https://'));assert.ok(card.quoteSource?.citation?.length>150);
 }
 assert.ok(!d.ideologies.Jacobinism.quote.includes('Pity is treason'));
 assert.equal(answer('Jacobinism','q_organizedInterests'),'No');
 assert.equal(answer('Social democracy','q_organizedInterests'),'Yes');
 assert.equal(answer('Social corporatism','q_organizedInterests'),'Yes');
 assert.equal(answer('Social democracy','q_socCorp'),'No');
 assert.equal(answer('Social corporatism','q_socCorp'),'Yes');
});
test('two optional explanations added without new prompts, answer choices or routing',()=>{
 assert.equal(d.graph.q_organizedInterests.question,'Should independent trade unions have a political role?');
 assert.equal(d.graph.q_socCorp.question,'Should the state formally coordinate bargaining between labor and employers?');
 assert.deepEqual(d.graph.q_organizedInterests.choices.map(c=>c.label),['Yes','No']);
 assert.deepEqual(d.graph.q_socCorp.choices.map(c=>c.label),['Yes','No']);
 assert.match(d.graph.q_organizedInterests.explanation,/1791 Le Chapelier/);
 assert.match(d.graph.q_socCorp.explanation,/overlap/);
});
test('renamed author outcome, Immortalist Communism, q_weed, and R57 improvements remain',()=>{
 assert.ok(routes.has('Dialectical Prometheanism'));
 assert.ok(routes.has('Immortalist Communism'));
 assert.equal(d.graph.q_weed.question,'Should all conflict be avoided when attempting change?');
 assert.equal(d.graph.q_electMon.question,'What should qualify someone for political authority?');
 assert.equal(d.graph.q_stateFunctions.question,'Who should ultimately govern the state?');
});
test('tree visual still contains one cell per non-root node',()=>{
 const keys=Object.values(layout).flatMap(v=>v.cells.map(c=>c.key));assert.equal(new Set(keys).size,385);
 for(const id of questions)if(id!==d.start)assert.ok(keys.includes('question:'+id));
 for(const name of routes.keys())assert.ok(keys.includes('result:'+name));
});
