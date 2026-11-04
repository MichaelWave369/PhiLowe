import test from 'node:test';
import assert from 'node:assert/strict';
import {JOKES} from '../src/jokes.js';
import {COMEDIANS,GUEST_COMEDIAN,lineupFor,nextClubAct,comebackFor,crowdLabel} from '../src/comedyClubEngine.js';

test('4 distinct original characters, each owns two unique categories',()=>{
  assert.equal(COMEDIANS.length,4);
  assert.equal(new Set(COMEDIANS.map(a=>a.id)).size,4);
  const all=COMEDIANS.flatMap(a=>a.categories);
  assert.equal(new Set(all).size,8);
  for(const comedian of COMEDIANS){
    assert.ok(comedian.intros.length);
    assert.ok(comedian.comebacks.length);
  }
});
test('standup rotates original cast in sequence and picks matching jokes',()=>{
  const bags=new Map();let turn=-1;
  for(let i=0;i<20;i++){
    const act=nextClubAct(JOKES,[],bags,turn,()=>.36);
    assert.ok(act);
    assert.equal(act.number,i+1);
    assert.equal(act.comedian.id,COMEDIANS[i%4].id);
    assert.ok(act.comedian.categories.includes(act.joke.category));
    turn=act.turn;
  }
});
test('no repeat for a performer until its filtered joke deck is spent',()=>{
  const bags=new Map(),seen=new Map();let turn=-1;
  for(let i=0;i<4*28;i++){
    const act=nextClubAct(JOKES,[],bags,turn,()=>.4);
    turn=act.turn;
    const list=seen.get(act.comedian.id)||new Set();
    assert.ok(!list.has(act.joke.id),act.comedian.id+' duplicated '+act.joke.id);
    list.add(act.joke.id);seen.set(act.comedian.id,list);
  }
  for(const comedian of COMEDIANS)assert.equal(seen.get(comedian.id).size,28);
});
test('an author joke takes the guest microphone only when staged',()=>{
  const draft={id:'CW-draft1234',category:'love',setup:'Private setup',punchline:'Never online',status:'draft'};
  const stage={id:'CW-stage1234',category:'vr',setup:'Stage setup',punchline:'Stage ending',status:'stage'};
  const empty=lineupFor([]);
  const expanded=lineupFor([stage]);
  assert.equal(empty.length,4);
  assert.equal(expanded.length,5);
  assert.equal(expanded[4].id,GUEST_COMEDIAN.id);
  let turn=-1;let act;
  const bag=new Map();
  for(let i=0;i<5;i++){act=nextClubAct(JOKES,[stage],bag,turn,()=>.1);turn=act.turn;}
  assert.equal(act.comedian.id,'guest');
  assert.equal(act.joke.id,stage.id);
  assert.notEqual(act.joke.id,draft.id);
});
test('heckler comebacks and crowd ratings stay deterministic',()=>{
  assert.ok(comebackFor(COMEDIANS[0],0));
  assert.notEqual(comebackFor(COMEDIANS[0],0),comebackFor(COMEDIANS[0],1));
  assert.equal(crowdLabel(0,0),'TENTATIVELY HOPEFUL');
  assert.equal(crowdLabel(3,0),'STANDING OVATION');
  assert.equal(crowdLabel(0,3),'CRICKETS AND CONCERN');
});
