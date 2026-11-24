import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../data/quiz-data.json',import.meta.url)));
const css=fs.readFileSync(new URL('../ideosorter.css',import.meta.url),'utf8');
const I=data.ideologies;
test('R61 attributions',()=>{
  assert.equal(I['Theocracy'].author,'Flavius Josephus');
  assert.equal(I['Ego-Communism'].quote,'…in short, the society is sacred, the union your own…');
  assert.equal(I['Liberal conservatism'].author,'Margaret Thatcher');
  for(const n of ['Theocracy','Ego-Communism','Liberal conservatism']) assert.ok(I[n].quoteSource?.url);
});
// WCAG 2.1 AA: white answer text on every answer colour must reach 4.5:1
const lum=(r,g,b)=>{const f=c=>(c/=255)<=.03928?c/12.92:((c+.055)/1.055)**2.4;return .2126*f(r)+.7152*f(g)+.0722*f(b)};
function hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return [f(0),f(8),f(4)].map(x=>Math.round(x*255))}
test('answer colours meet 4.5:1 with white text',()=>{
  const cols=[...css.matchAll(/--answer-color: hsl\((\d+) (\d+)% (\d+)%\)/g)];
  assert.equal(cols.length,6);
  for(const [,h,s,l] of cols){const r=1.05/(lum(...hsl(+h,+s,+l))+.05);assert.ok(r>=4.5,`hsl(${h} ${s}% ${l}%) = ${r.toFixed(2)}`);}
});
