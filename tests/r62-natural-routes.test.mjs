import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layout=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const g=data.graph;
const paths=new Map();
function walk(id,path=[]){
 for(const c of g[id].choices){const p=[...path,[id,c.label]];if(c.type==='question')walk(c.id,p);else{assert.ok(!paths.has(c.ideology),c.ideology);paths.set(c.ideology,p)}}
}
walk(data.start);
const route=(name)=>paths.get(name).map(([q,a])=>`${q}=${a}`).join(' > ');

test('R62 edition and counts',()=>{
 assert.equal(data.version,'U1.124');
 assert.equal(data.counts.questions,185);
 assert.equal(Object.keys(g).length,185);
 assert.equal(paths.size,201);
});

test('JONS result carries its correct name and no wrong alias',()=>{
 const v=data.ideologies['National syndicalism (JONS)'];
 assert.ok(v);
 assert.equal(data.ideologies['Falangism (De Jons)'],undefined);
 assert.ok(!(v.aliases||[]).some(a=>/de jons/i.test(a)));
 assert.match(route('National syndicalism (JONS)'),/q_syndicateAuthority=Yes$/);
});

test('national-revolutionary currents that keep market exchange sit on the market side, cluster intact',()=>{
 const base='q_privateProperty=No > q_markets=Yes > q_authMarkSoc=Yes > q_natMarket=Yes';
 assert.equal(route("Ba'athism"),`${base} > q_natSynd=No > q_nazbol=Vanguard`);
 assert.equal(route('Tridemism'),`${base} > q_natSynd=No > q_nazbol=Parliament`);
 assert.equal(route('Fiumanism'),`${base} > q_natSynd=Yes > q_fumivFascfu=Aesthetic myth and ritual`);
 assert.equal(route('Political Futurism'),`${base} > q_natSynd=Yes > q_fumivFascfu=A radical break from the past`);
 assert.match(route('Market socialism'),/q_natMarket=No > q_guilds=Through market competition$/);
 assert.deepEqual(g.q_nazbol.choices.map(c=>c.label),['Vanguard','Parliament']);
});

test('Third International Theory leaves the centralized-state branch',()=>{
 assert.match(route('Third international theory'),/q_markets=No > .*q_authSoc=No > .*q_unions=No > q_natSocLib=Yes$/);
 assert.match(route('Libertarian socialism'),/q_unions=No > q_natSocLib=No$/);
 assert.equal(g.q_classStruggleTool,undefined);
 assert.match(route('National Bolshevism (Paetel)'),/q_natSocAuth=Yes > q_nationalCouncils=Yes$/);
});

test('no new question wording: the two new nodes repeat the site’s own question',()=>{
 const q=g.q_natSocAuth.question;
 assert.equal(q,'Should national interests come before all other commitments?');
 assert.equal(g.q_natMarket.question,q);
 assert.equal(g.q_natSocLib.question,q);
 assert.equal(g.q_demCent.question,'Should a centralized vanguard party direct the proletarian revolution?');
});

test('Spartacism moves to the council side; parliament question separates it from KAPD-style dualism',()=>{
 assert.match(route('Spartacism (Luxemburgism)'),/q_demCent=No > q_councilNationalWar=No > q_partyElites=Yes > q_parliamentaryAgitation=Yes$/);
 assert.match(route('Council Communism (Organizational Dualism)'),/q_partyElites=Yes > q_parliamentaryAgitation=No$/);
 assert.match(route('Italian Left-Communism (Battaglia)'),/q_demCent=Yes > .*q_organic=No$/);
});

test('Stakeholder capitalism leaves the strongman branch for the elected market-liberal chain',()=>{
 assert.match(route('Stakeholder capitalism'),/q_stateFunctions=Elected representatives > .*q_mobility=No > q_zeBugz=Yes$/);
 assert.match(route('Third way'),/q_mobility=Yes$/);
 assert.match(route('Neoliberalism'),/q_zeBugz=No > q_hegemony=Economic leverage$/);
 assert.match(route('Autocratic capitalism'),/q_soe=No > q_klepto=No$/);
});

test('both diagrams hold one cell per node with adjacent edges',()=>{
 const key=c=>c.type==='question'?`question:${c.id}`:`result:${c.ideology}`;
 const cells=new Map();
 for(const side of ['pro','anti'])for(const c of layout[side].cells)cells.set(c.key,[side,c.column,c.row]);
 assert.equal(cells.size,385);
 assert.ok(!cells.has('question:q_classStruggleTool'));
 for(const [q,n] of Object.entries(g))for(const c of n.choices){
  const a=cells.get(`question:${q}`),b=cells.get(key(c));
  if(q===data.start)continue;
  assert.ok(a&&b,`${q} -> ${key(c)}`);
  const d=Math.max(Math.abs(a[1]-b[1]),Math.abs(a[2]-b[2]));
  if(q==='q_racism'&&c.id==='q_total')assert.equal(d,2);else assert.equal(d,1,`${q} -> ${key(c)}`);
 }
});
