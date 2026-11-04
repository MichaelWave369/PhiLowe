import test from 'node:test';
import assert from 'node:assert/strict';
import {JOKES,JOKE_CATEGORIES} from '../src/jokes.js';
import {drawJoke,shuffle} from '../src/jokeEngine.js';

test('ships a substantial original collection with unique IDs and complete text',()=>{
  assert.equal(JOKES.length,112);
  assert.equal(new Set(JOKES.map(j=>j.id)).size,JOKES.length);
  const allowed=new Set(JOKE_CATEGORIES.map(c=>c.id));
  assert.equal(new Set(JOKE_CATEGORIES.map(c=>c.id)).size,8);
  for(const j of JOKES){assert.ok(allowed.has(j.category));assert.ok(j.setup.trim());assert.ok(j.punchline.trim());}
  for(const c of JOKE_CATEGORIES)assert.equal(JOKES.filter(j=>j.category===c.id).length,14);
});
test('shuffle returns permutation and does not mutate original',()=>{
 const input=[1,2,3,4]; const out=shuffle(input,()=>0);
 assert.deepEqual([...out].sort(),input); assert.deepEqual(input,[1,2,3,4]);
});
test('a full deck has no repeats until exhausted',()=>{
 const bags=new Map(), seen=new Set();
 for(let i=0;i<JOKES.length;i++){
   const joke=drawJoke(JOKES,'all',bags,()=>.31);
   assert.ok(joke); assert.equal(seen.has(joke.id),false); seen.add(joke.id);
 }
 assert.equal(seen.size,JOKES.length);
 const last=bags.get('all').last; const next=drawJoke(JOKES,'all',bags,()=>.31);
 assert.notEqual(next.id,last);
});
test('category changes are isolated and empty categories return null',()=>{
 const bags=new Map(); const a=drawJoke(JOKES,'retro',bags,()=>.5);
 const b=drawJoke(JOKES,'vr',bags,()=>.5);
 assert.equal(a.category,'retro');assert.equal(b.category,'vr');
 assert.equal(drawJoke(JOKES,'nope',bags),null);
 assert.notEqual(drawJoke(JOKES,'retro',bags,()=>.5).id,a.id);
});
test('favorite pools handle deletion of IDs from a partially used bag',()=>{
 const bags=new Map(); const chosen=drawJoke(JOKES.slice(0,5),'all',bags,()=>.75);
 const remaining=JOKES.slice(0,5).filter(j=>j.id!==chosen.id);
 const joke=drawJoke(remaining,'all',bags,()=>.75);
 assert.ok(remaining.some(j=>j.id===joke.id));
});
