import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../data/quiz-data.json',import.meta.url)));
const I=data.ideologies;
test('R60 attributions',()=>{
  assert.equal(I['Absolute monarchy'].author,'Jean Bodin');
  assert.match(I['Absolute monarchy'].quoteSource.label,/Bodin/);
  assert.equal(I['Noocracy'].quote,'But the chief penalty is to be governed by someone worse if a man will not himself hold office and rule.');
  assert.equal(I['Mesoconservatism'].author,'Dennis Prager');
});
