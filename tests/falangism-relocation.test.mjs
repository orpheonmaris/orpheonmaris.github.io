import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(resolve(root,'data/quiz-data.json'),'utf8'));
const layouts=JSON.parse(readFileSync(resolve(root,'data/tree-layout.json'),'utf8'));
const paths=new Map(),questions=new Set();
function walk(id,path=[],active=new Set()){
  assert.ok(data.graph[id],`Missing question: ${id}`);
  assert.ok(!active.has(id),`Cycle: ${id}`);
  active.add(id);questions.add(id);
  for(const choice of data.graph[id].choices){
    const next=[...path,[id,choice.label]];
    if(choice.type==='question')walk(choice.id,next,active);
    else{
      assert.equal(choice.type,'result');
      assert.ok(!paths.has(choice.ideology),`Duplicate ideology: ${choice.ideology}`);
      paths.set(choice.ideology,next);
    }
  }
  active.delete(id);
}
walk(data.start);
const answer=(name,id)=>paths.get(name)?.find(([node])=>node===id)?.[1];
test('the entire sorter remains complete',()=>{
  assert.equal(questions.size,185); // R62: +1 (q_natMarket)
  assert.equal(paths.size,201);
  assert.deepEqual([...questions].sort(),Object.keys(data.graph).sort());
  assert.deepEqual([...paths.keys()].sort(),Object.keys(data.ideologies).sort());
});
test('Catholic Falangism follows the nationalist-syndicalist pro-property path',()=>{
  for(const name of ['Falangism','National syndicalism (JONS)','National syndicalism']){
    assert.equal(data.ideologies[name].branch,'Pro-private property');
    assert.equal(answer(name,'q_privateProperty'),'Yes');
    assert.equal(answer(name,'q_verticalSyndicates'),'Yes');
    assert.equal(answer(name,'q_fashClergy'),'No');
  }
  assert.equal(answer('Falangism','q_traditionalValues'),'Yes');
  assert.equal(answer('National syndicalism (JONS)','q_traditionalValues'),'No');
  assert.equal(answer('National syndicalism (JONS)','q_syndicateAuthority'),'Yes');
  assert.equal(answer('National syndicalism','q_syndicateAuthority'),'No');
});
test('adjacent fascist and futurist outcomes remain distinct',()=>{
  assert.equal(answer('Clerical Fascism','q_fashClergy'),'Yes');
  assert.equal(answer('Strasserism','q_feudalRebirth'),'Yes');
  assert.equal(answer('Fascism','q_fascistInstitution'),'A restored mythical past');
  assert.equal(answer('Fascist Futurism','q_fascistInstitution'),'A radical technological future');
  assert.equal(answer('Fiumanism','q_fumivFascfu'),'Aesthetic myth and ritual');
  assert.equal(answer('Political Futurism','q_fumivFascfu'),'A radical break from the past');
  assert.equal(data.graph.q_natvfu,undefined);
});
test('both diagrams are complete and extended arrows are explicitly supported',()=>{
  const occupied=new Set(),positions=new Set();
  for(const [side,l] of Object.entries(layouts)){
    const byKey=new Map();
    for(const cell of l.cells){
      assert.ok(cell.row>=0&&cell.row<l.height&&cell.column>=0&&cell.column<l.width,`Bounds ${cell.key}`);
      const point=`${side}:${cell.row}:${cell.column}`;
      assert.ok(!positions.has(point),`Overlapping cells at ${point}`);
      positions.add(point);
      assert.ok(!occupied.has(cell.key),`Duplicated cell ${cell.key}`);
      occupied.add(cell.key);byKey.set(cell.key,cell);
      if(cell.type==='result')assert.equal(data.ideologies[cell.ideology].branch,side==='pro'?'Pro-private property':'Anti-private property');
    }
    for(const cell of l.cells.filter(c=>c.type==='question')){
      for(const choice of data.graph[cell.id].choices){
        const key=choice.type==='question'?`question:${choice.id}`:`result:${choice.ideology}`;
        const to=byKey.get(key);
        assert.ok(to,`Missing visual edge ${cell.key} -> ${key}`);
        const distance=Math.max(Math.abs(to.column-cell.column),Math.abs(to.row-cell.row));
        assert.ok(distance===1 || (side==='pro' && cell.id==='q_racism' && key==='question:q_total' && distance===2),`Unsupported visual edge ${cell.key} -> ${key}`);
      }
    }
  }
  assert.equal(occupied.size,385);
  assert.deepEqual([...occupied].sort(),[...questions].filter(x=>x!==data.start).map(x=>'question:'+x).concat([...paths.keys()].map(x=>'result:'+x)).sort());
});
