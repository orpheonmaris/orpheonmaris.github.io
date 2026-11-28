import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const js=readFileSync(resolve(root,'ideosorter.js'),'utf8');
const g=data.graph,I=data.ideologies;
const paths=new Map();
(function walk(id,path=[]){for(const c of g[id].choices){const p=[...path,`${id}=${c.label}`];if(c.type==='question')walk(c.id,p);else paths.set(c.ideology,p.join(' > '))}})(data.start);

test('R64 edition and counts',()=>{
 assert.equal(data.version,'U1.126');
 assert.deepEqual([data.counts.ideologies,data.counts.routes,data.counts.questions,data.counts.shared],[198,198,182,111]);
 assert.equal(paths.size,198);
});

test('Nilssonianism stays (removal withdrawn after the user identified its source book)',()=>{
 assert.ok(I.Nilssonianism);assert.ok(g.q_separation);
 assert.match(paths.get('Nilssonianism'),/q_covenant=Yes > q_separation=Aggressively$/);
 assert.match(paths.get('Hoppeanism'),/q_covenant=Yes > q_separation=Peacefully$/);
});

test('A4: State capitalism no longer requires choosing one powerful leader',()=>{
 const p=paths.get('State capitalism');
 assert.match(p,/q_stateFunctions=Elected representatives/);
 assert.match(p,/q_creditDividend=No > q_soe=Yes$/);
 assert.match(paths.get('Social democracy'),/q_creditDividend=No > q_soe=No > q_trad=No/);
 assert.match(paths.get('Autocratic capitalism'),/q_authWelf=No > q_klepto=No$/);
});

test('A3/A4: the stateless strategy question no longer forces "Insurrection"',()=>{
 const n=g.q_counterEcon;
 assert.equal(n.question,'Should the state be undermined mainly by withdrawing cooperation from it?');
 assert.deepEqual(n.choices.map(c=>c.label),['Yes','No']);
 for(const r of ['Anarcho-capitalism','Hoppeanism','Geoanarchism','Left-rothbardianism','Anarcho-distributism']) assert.match(paths.get(r),/q_counterEcon=No/);
 for(const r of ['Agorism','Voluntaryism']) assert.match(paths.get(r),/q_counterEcon=Yes/);
 assert.ok(!js.includes('"q_counterEcon:'));
});

test('replaced quotations are sourced and the old attributions are gone',()=>{
 const expect={
  'Divine monarchy':['Jacques-Bénigne Bossuet',/throne of God himself/],
  'Social Autocracy / Social Authoritarianism':['Editorial description',/authoritarian welfare state/],
  'Patronalism':['Editorial description',/chains of actual acquaintance/],
  'Council Communism (Organizational Dualism)':['Herman Gorter',/^Factory organisation or union together with party! The unity of both!$/],
  'Council Communism (Organizational Unitarism)':['Antonie Pannekoek',/lead and control the working class/],
  'Caesaropapism':['Act of Supremacy (1534), under Henry VIII',/only supreme head in earth of the Church of England/],
  'Personal autocracy':['Julius Caesar, quoting Euripides',/for a throne’s sake/],
 };
 for(const [n,[author,re]] of Object.entries(expect)){
  const v=I[n];assert.equal(v.author,author,n);assert.match(v.quote,re,n);
  assert.ok(v.quoteSource&&v.quoteSource.url&&v.quoteSource.citation&&v.quoteSource.note,n);
 }
 for(const n of ['Social Autocracy / Social Authoritarianism','Patronalism']) assert.equal(I[n].quoteKind,'description');
 assert.ok(!/Perón|Putin|Sergieff/.test(JSON.stringify([I['Divine monarchy'].author,I['Patronalism'].author,I['Social Autocracy / Social Authoritarianism'].author])));
});

test('layout: one cell per node, adjacent edges, crossings recorded',()=>{
 const cells=['pro','anti'].flatMap(s=>layout[s].cells.map(c=>c.key));
 assert.equal(new Set(cells).size,379);
 assert.ok(cells.includes('result:Nilssonianism')&&cells.includes('question:q_separation'));
 assert.equal(layout.pro.crossings,14);
});
