// Copy into tests/ of a U1.116 checkout after applying the private R57 patch.
// Runs independently of the preview and uses native production data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const js=readFileSync(resolve(root,'ideosorter.js'),'utf8');
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const names=['Aristocracy','Aristotelian timocracy','Platonic timocracy','Neocameralism','Landian Accelerationism'];
const routes=new Map(),qs=new Set();
function visit(id,path=[],anc=new Set()){
 assert.ok(data.graph[id]);assert.ok(!anc.has(id));anc.add(id);qs.add(id);
 for(const c of data.graph[id].choices){const np=[...path,[id,c.label]];if(c.type==='question')visit(c.id,np,anc);else {assert.equal(c.type,'result');assert.ok(!routes.has(c.ideology));routes.set(c.ideology,np)}}anc.delete(id);
}
visit(data.start);
const ans=(n,q)=>routes.get(n)?.find(([node])=>node===q)?.[1];
test('stable fixed-tree format and advertised totals',()=>{
 assert.equal(data.version,'U1.123');assert.equal(qs.size,184);assert.equal(routes.size,201);
 assert.deepEqual([...routes.keys()].sort(),Object.keys(data.ideologies).sort());
 assert.deepEqual([...qs].sort(),Object.keys(data.graph).sort());
 assert.ok(data.ideologies['Dialectical Prometheanism']);
 assert.ok(data.ideologies['Immortalist Communism']);
 assert.equal(data.graph.q_weed.question,'Should all conflict be avoided when attempting change?');
});
test('classical governing distinctions',()=>{
 assert.equal(data.graph.q_electMon.question,'What should qualify someone for political authority?');
 assert.deepEqual(data.graph.q_electMon.choices.map(c=>c.label),['Virtue and merit','Share ownership','Property qualifications','Military honor']);
 assert.equal(ans('Aristocracy','q_electMon'),'Virtue and merit');
 assert.equal(ans('Aristotelian timocracy','q_electMon'),'Property qualifications');
 assert.equal(ans('Platonic timocracy','q_electMon'),'Military honor');
 assert.equal(ans('Neocameralism','q_electMon'),'Share ownership');
 assert.equal(ans('Landian Accelerationism','q_electMon'),'Share ownership');
});
test('four result cards distinguish sourced descriptions from quotations',()=>{
 for(const n of names.filter(n=>n!=='Landian Accelerationism')){
  const c=data.ideologies[n];assert.equal(c.author,'Editorial description');assert.equal(c.quoteKind,'description');assert.ok(c.quoteSource?.url);assert.ok(c.quoteSource?.citation);}
});
test('four semantically unique white pictograms using existing site assets',()=>{
 const targets=[
  ['virtue and merit','/assets/quark/buttons/wisdom.svg'],
  ['share ownership','/assets/quark/buttons/share holding.svg'],
  ['property qualifications','/assets/quark/buttons/business.svg'],
  ['military honor','/assets/quark/buttons/military honors.svg'],
 ];
 for(const [label,icon] of targets){
  const key='q_electMon:'+label;assert.ok(js.includes(JSON.stringify(key)+': '+JSON.stringify(icon)));
  const svg=readFileSync(resolve(root,'.'+icon),'utf8');assert.match(svg,/<svg\s/);
 }
 assert.equal(new Set(targets.map(x=>x[1])).size,4);
});
test('all five outcomes have cells in unchanged original layout',()=>{
 const keys=new Set(Object.values(layout).flatMap(l=>l.cells.map(c=>c.key)));
 assert.equal(keys.size,384);
 assert.ok(keys.has('question:q_electMon'));
 for(const name of names)assert.ok(keys.has('result:'+name));
});
