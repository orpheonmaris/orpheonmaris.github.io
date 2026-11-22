import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const source=readFileSync(resolve(root,'ideosorter.js'),'utf8');
const expected=[
  ['Elected representatives','/assets/quark/buttons/elected officials.svg'],
  ['One powerful leader','/assets/quark/buttons/strongman.svg'],
  ['Monarchs or ruling elites','/assets/quark/buttons/sovereign.svg'],
];
test('version and three answer labels are stable',()=>{
  assert.equal(data.version,'U1.117');
  assert.deepEqual(data.graph.q_stateFunctions.choices.map(choice=>choice.label),expected.map(([label])=>label));
});
test('all state-authority answers have unique, existing, original-style pictograms',()=>{
  assert.equal(new Set(expected.map(([,path])=>path)).size,3);
  for(const [label,path] of expected){
    const key='q_stateFunctions:'+label.toLowerCase();
    assert.ok(source.includes(JSON.stringify(key)+': '+JSON.stringify(path)),key);
    const svg=readFileSync(resolve(root,'.'+path),'utf8');
    assert.match(svg,/<svg\s/);
    assert.match(svg,/fill(?::|=)("|')?#fff/i);
  }
});
