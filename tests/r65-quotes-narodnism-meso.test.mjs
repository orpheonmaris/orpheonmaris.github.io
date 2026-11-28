import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const js=readFileSync(resolve(root,'ideosorter.js'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const g=data.graph,I=data.ideologies;
const paths=new Map();
(function walk(id,path=[]){for(const c of g[id].choices){const p=[...path,`${id}=${c.label}`];if(c.type==='question')walk(c.id,p);else paths.set(c.ideology,p.join(' > '))}})(data.start);

test('R65 edition and counts',()=>{
 assert.equal(data.version,'U1.127');
 assert.deepEqual([data.counts.ideologies,data.counts.routes,data.counts.questions,data.counts.shared,data.counts.leftOnly],[197,197,182,111,40]);
 assert.equal(Object.keys(I).length,197);assert.equal(paths.size,197);assert.equal(Object.keys(g).length,182);
 assert.match(html,/197 ideologies\. 182 questions\./);assert.ok(!/\b198\b/.test(html));
});

test('B5/C1: Mesoconservatism and its one-answer question are gone; Neoconservatism stays reachable',()=>{
 assert.ok(!I.Mesoconservatism);assert.ok(!g.q_conIntervention);
 assert.ok(!JSON.stringify(g).includes('Mesoconservatism')&&!JSON.stringify(g).includes('q_conIntervention'));
 assert.deepEqual(g.q_safetyNet.choices.map(c=>[c.label,c.id]),[['Yes','q_deuxCentQuaranteSixFromages'],['No','q_con']]);
 assert.match(paths.get('Classical conservatism'),/q_safetyNet=No > q_con=Institutions$/);
 assert.ok(paths.get('Neoconservatism'));
});

test('A3/B3: Narodnism is the village-commune branch of agrarian socialism, not the answer "Terror"',()=>{
 assert.deepEqual(g.q_transition.choices.map(c=>c.label),['Election','Coup','Revolution']);
 assert.ok(!/Terror/.test(JSON.stringify(g)));assert.ok(!js.includes('"q_transition:terror"'));
 assert.equal(g.q_peasantCommune.question,'Should socialism be built on the peasant village commune?');
 assert.ok(g.q_peasantCommune.explanation&&/obshchina/.test(g.q_peasantCommune.explanation));
 assert.match(paths.get('Narodnism'),/q_transition=Revolution > q_authSoc=No > q_agrSoc=Yes > q_peasantCommune=Yes$/);
 assert.match(paths.get('Agrarian socialism'),/q_agrSoc=Yes > q_peasantCommune=No$/);
 assert.match(paths.get('Blanquism'),/q_transition=Coup$/);
});

test('C1: replaced quotations are sourced and the old attributions are gone',()=>{
 const expect={
  'Narodnism':['Land and Liberty (Zemlya i Volya), programme of 1878',/transfer of all the land into the hands of the rural working class and its equal distribution/],
  'Hereditary Monarchy':['Walter Bagehot',/^The best reason why Monarchy is a strong government is, that it is an intelligible government\.$/],
  'Individualist Anarchism':['Oscar Wilde',/^All authority is quite degrading\. It degrades those who exercise it, and degrades those over whom it is exercised\.$/],
  'National distributism':['Gilbert Keith Chesterton',/^If you don’t see the use of it, I certainly won’t let you clear it away\. Go away and think\./],
  'Paternalistic conservatism':['Benjamin Disraeli',/Two nations; between whom there is no intercourse and no sympathy/],
  'Cameralism':['Editorial description',/“how the welfare of the state might be secured”/],
  'Dirigism':['Editorial description',/“the control of economic activity by the state”/],
  'Stratocracy':['Editorial description',/“military rule”.*“government by the military”/],
  'Platformism':['Nestor Ivanovych Makhno',/^There is no such thing as harmless power\.$/],
 };
 for(const [n,[author,re]] of Object.entries(expect)){
  const v=I[n];assert.equal(v.author,author,n);assert.match(v.quote,re,n);
  assert.ok(v.quoteSource&&v.quoteSource.url&&v.quoteSource.citation&&v.quoteSource.note,n);
  assert.match(v.quoteSource.url,/^https:\/\//,n);
 }
 for(const n of ['Cameralism','Dirigism','Stratocracy']) assert.equal(I[n].quoteKind,'description',n);
 for(const n of ['Narodnism','Hereditary Monarchy','Individualist Anarchism','National distributism','Paternalistic conservatism','Platformism']) assert.ok(!I[n].quoteKind,n);
 const all=JSON.stringify(Object.values(I).map(v=>[v.quote,v.author]));
 for(const gone of ['two hundred rats','A man who does not think for himself','Don’t ever take a fence down','greatest good you can do for another','My people and I have come to an agreement','orders to give','shining bauble','Socialist-Revolutionary Party pamphlet','Dennis Prager']) assert.ok(!all.includes(gone),gone);
 // the old wording survives only inside each replacement note, which names it as the replaced text
 assert.match(I['Hereditary Monarchy'].quoteSource.note,/^Replaces “I would rather obey a fine lion/);
});

test('every quotation source has a label and a web link; every description card says so',()=>{
 for(const [n,v] of Object.entries(I)){
  if(v.quoteSource){assert.ok(v.quoteSource.label&&/^https?:\/\//.test(v.quoteSource.url),n)}
  if(v.quoteKind==='description') assert.equal(v.author,'Editorial description',n);
 }
});

test('layout: one cell per node, adjacent edges, crossings recorded',()=>{
 const key=c=>c.type==='question'?'question:'+c.id:'result:'+c.ideology;
 const children={};for(const [q,n] of Object.entries(g)) children['question:'+q]=n.choices.map(key);
 const all=[];
 for(const side of ['pro','anti']){
  const pos=new Map(layout[side].cells.map(c=>[c.key,[c.column,c.row]]));
  assert.equal(pos.size,layout[side].cells.length);
  assert.equal(new Set([...pos.values()].map(p=>p.join(','))).size,pos.size);
  all.push(...pos.keys());
  const diag=new Map();
  for(const [k,p] of pos) for(const c of children[k]||[]) if(pos.has(c)){
   const q=pos.get(c),d=Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]));
   if(side==='pro'&&k==='question:q_racism'&&c==='question:q_total'){assert.equal(d,2);continue}
   assert.equal(d,1,`${side} ${k} -> ${c}`);
   if(p[0]!==q[0]&&p[1]!==q[1]){const b=Math.min(p[0],q[0])+','+Math.min(p[1],q[1]);diag.set(b,(diag.get(b)||0)+1)}
  }
  const cr=[...diag.values()].filter(n=>n>1).length;
  assert.equal(layout[side].crossings,cr+(side==='pro'?1:0),side);
 }
 assert.equal(new Set(all).size,378);assert.equal(all.length,378);
 const nodes=new Set([...Object.keys(g).map(q=>'question:'+q),...Object.keys(I).map(n=>'result:'+n)]);nodes.delete('question:'+data.start);
 assert.deepEqual([...nodes].sort(),[...new Set(all)].sort());
 const at=k=>['pro','anti'].flatMap(s=>layout[s].cells).find(c=>c.key===k);
 assert.deepEqual([at('result:Narodnism').column,at('result:Narodnism').row],[5,2]);
 assert.deepEqual([at('question:q_peasantCommune').column,at('question:q_peasantCommune').row],[5,3]);
});
