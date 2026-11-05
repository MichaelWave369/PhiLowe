import test from 'node:test';
import assert from 'node:assert/strict';
import {CASE_KEY,CASE_ROOMS,CASE_CLUES,CASE_WITNESSES,CASE_ENDINGS,newCase,caseActions,caseStep,caseReady,loadCase,saveCase} from '../src/case404.js';
const move=(s,id)=>caseStep(s,'go:'+id).state;
const play=(s,id)=>caseStep(s,id).state;
function investigate(mode='listen'){
 let s=newCase();
 s=play(s,'inspect:tracks');s=move(s,'office');
 s=play(s,'inspect:form');s=play(s,'answer:mabel/'+mode);
 s=move(s,'props');s=play(s,'inspect:hinge');s=play(s,'answer:bix/'+mode);
 s=move(s,'dressing');s=play(s,'inspect:mirror');s=play(s,'answer:vera/'+mode);
 s=move(s,'booth');s=play(s,'inspect:audio');s=play(s,'answer:dj/'+mode);
 s=move(s,'props');s=play(s,'find:door');
 s=play(s,'key:4');s=play(s,'key:0');s=play(s,'key:4');
 s=move(s,'secret');s=play(s,'inspect:letter');
 return s;
}
test('six rooms, six original clues, four witnesses and two resolutions',()=>{
 assert.equal(CASE_ROOMS.length,6);assert.equal(CASE_CLUES.length,6);
 assert.equal(CASE_WITNESSES.length,4);assert.equal(CASE_ENDINGS.length,2);
 assert.equal(new Set(CASE_ROOMS.map(x=>x.id)).size,6);
 assert.equal(new Set(CASE_CLUES.map(x=>x.id)).size,6);
});
test('secret passage is locked; clue collection constrained to location',()=>{
 let s=newCase();
 assert.equal(move(s,'secret').room,'hall');
 assert.equal(play(s,'inspect:form').clues.length,0);
 assert.equal(play(s,'find:door').foundDoor,false);
 assert.equal(play(s,'key:4').digits.length,0);
 s=play(s,'inspect:tracks');
 assert.equal(s.clues.length,1);
 assert.equal(play(s,'inspect:tracks').clues.length,1);
});
test('branches save witness choices; cannot interview same person twice or remotely',()=>{
 let s=move(newCase(),'office');
 const prompt=caseStep(s,'talk:mabel');assert.equal(prompt.witness.id,'mabel');
 s=play(s,'answer:mabel/press');
 assert.equal(s.interviews.mabel,'press');
 assert.equal(play(s,'answer:mabel/listen').interviews.mabel,'press');
 assert.equal(play(s,'answer:bix/listen').interviews.bix,undefined);
 assert.equal(caseActions(s).some(x=>x.id==='talk:mabel'),false);
});
test('keypad resets on incorrect digit and opens using code 404',()=>{
 let s=newCase();s=play(s,'inspect:tracks');s=move(s,'office');
 s=play(s,'inspect:form');s=move(s,'props');s=play(s,'inspect:hinge');s=play(s,'find:door');
 s=play(s,'key:4');s=play(s,'key:8');assert.equal(s.errors,1);assert.deepEqual(s.digits,[]);
 s=play(s,'key:4');s=play(s,'key:0');s=play(s,'key:4');
 assert.equal(s.doorOpen,true);assert.equal(move(s,'secret').room,'secret');
});
test('false accusation can be corrected and two endings depend on player choice',()=>{
 let s=investigate();
 assert.equal(s.clues.length,6);assert.equal(caseReady(s),true);
 s=play(s,'accuse:bix');assert.equal(s.solved,false);assert.equal(s.falseLeads,1);
 s=play(s,'accuse:cabinet');assert.equal(s.solved,true);
 s=play(s,'end:share');assert.equal(s.ending,'share');
 assert.equal(play(s,'end:safekeep').ending,'share');
 let another=investigate('press');another=play(another,'accuse:cabinet');another=play(another,'end:safekeep');
 assert.equal(another.ending,'safekeep');
 assert.match(caseStep(another,'end:share').message,/not earned/);
});
test('local save restores progress and rejects tampering',()=>{
 const storage=new Map(),api={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 const state=investigate();saveCase(api,state);assert.deepEqual(loadCase(api),state);
 storage.set(CASE_KEY,JSON.stringify({...state,version:2}));assert.deepEqual(loadCase(api),newCase());
 storage.set(CASE_KEY,JSON.stringify({...newCase(),room:'secret'}));assert.deepEqual(loadCase(api),newCase());
 storage.set(CASE_KEY,JSON.stringify({...newCase(),solved:true}));assert.deepEqual(loadCase(api),newCase());
});
