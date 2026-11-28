import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const html=readFileSync(resolve(root,'index.html'),'utf8');
const g=data.graph,I=data.ideologies;
const paths=new Map();
(function walk(id,path=[]){for(const c of g[id].choices){const p=[...path,`${id}=${c.label}`];if(c.type==='question')walk(c.id,p);else paths.set(c.ideology,p.join(' > '))}})(data.start);

test('R63 edition and counts (updated for R64)',()=>{
 assert.equal(data.version,'U1.127');
 assert.deepEqual([data.counts.ideologies,data.counts.routes,data.counts.questions],[197,197,182]);
 assert.equal(Object.keys(I).length,197);assert.equal(paths.size,197);assert.equal(Object.keys(g).length,182);
 const cells=['pro','anti'].flatMap(s=>layout[s].cells.map(c=>c.key));assert.equal(new Set(cells).size,378);
});

test('B5: joke results and their single-answer questions are gone',()=>{
 for(const n of ['Left Marxism-Leninism','Avaritionism','Combatocracy']){assert.equal(I[n],undefined);assert.ok(!paths.has(n));}
 for(const q of ['q_leninism','q_redMarket','q_weak'])assert.equal(g[q],undefined);
 assert.match(paths.get('Kraterocracy'),/q_sovereignType=Strength$/);
 assert.match(paths.get('Agorism'),/q_withdrawalStrategy=Counter-economic trade$/);
 assert.match(paths.get('Leninism'),/q_unionAdministration=No > q_natLib=Yes > q_peasantPower=Yes$/);
});

test('rewritten cards carry sources',()=>{
 for(const n of ['Kraterocracy','Integralism','Clerical Fascism']){const s=I[n].quoteSource;assert.ok(s&&s.url&&s.citation,n);}
 assert.equal(I['Clerical Fascism'].quoteKind,'description');
 assert.equal(I.Integralism.author,'The Josias');
 assert.ok(!/Maurras/.test(I.Integralism.author));
 assert.ok(!/Redbeard/.test(I.Kraterocracy.author));
});

test('replacement banners exist and are referenced with a new cache key',()=>{
 for(const n of ['Schmittianism','Integralism']){
  const v=I[n];assert.match(v.flag,/^\/assets\/editorial\/flags\//);
  for(const k of ['flag','thumbnail','image'])assert.ok(existsSync(resolve(root,v[k].split('?')[0].slice(1))),`${n} ${k}`);
  assert.match(v.thumbnail,/\?v=U1\.125$/);assert.match(v.image,/\?v=U1\.125$/);
 }
 assert.ok(!/swastika/i.test(readFileSync(resolve(root,'assets/editorial/flags/schmittianism.svg'),'utf8')));
});

test('D5: byline in footer and author metadata',()=>{
 assert.match(html,/<meta name="author" content="Orphéon Maris">/);
 assert.match(html,/Ideology Sorter · by Orphéon Maris · GPL-3\.0 · 2026/);
 assert.match(html,/197 ideologies\. 182 questions\./);
});
