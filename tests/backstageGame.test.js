import test from 'node:test';
import assert from 'node:assert/strict';
import {BACKSTAGE_KEY,ROOMS,NOTES,freshBackstage,tasks,inventory,availableActions,playBackstage,readBackstage,saveBackstage} from '../src/backstageGame.js';
const go=(s,room)=>playBackstage(s,'go:'+room).state;
const act=(s,a)=>playBackstage(s,a).state;
test('six unique rooms with six collectible jokes',()=>{
 assert.equal(ROOMS.length,6);assert.equal(NOTES.length,6);
 assert.equal(new Set(ROOMS.map(r=>r.id)).size,6);assert.equal(new Set(NOTES.map(r=>r.id)).size,6);
 assert.ok(NOTES.every(n=>ROOMS.some(r=>r.id===n.room)));
});
test('locked stage and guarded quests',()=>{
 let s=freshBackstage();assert.equal(go(s,'stage').room,'hall');
 s=go(s,'office');s=act(s,'sign:waiver');assert.equal(s.waiver,false);
 s=act(s,'talk:mabel');s=act(s,'sign:waiver');assert.equal(s.waiver,true);
 s=act(s,'request:pass');assert.equal(s.pass,false);
});
test('vending coin, battery, mic repair, and optional chicken detour',()=>{
 let s=go(freshBackstage(),'props');
 s=act(s,'take:battery');assert.equal(s.battery,false);
 s=go(s,'hall');s=act(s,'take:coin');s=go(s,'props');
 s=act(s,'take:battery');s=act(s,'repair:mic');assert.equal(s.mic,true);assert.equal(s.battery,false);
 s=act(s,'take:chicken');s=go(s,'dressing');s=act(s,'gift:chicken');
 assert.equal(s.chickenGift,true);assert.equal(inventory(s).includes('Working Microphone'),true);
});
test('lighting cue resets on wrong order and correctly unlocks',()=>{
 let s=go(freshBackstage(),'booth');s=act(s,'press:pink');assert.deepEqual(s.lights,[]);
 s=act(s,'press:gold');s=act(s,'press:pink');s=act(s,'press:cyan');
 assert.equal(s.cue,true);assert.equal(availableActions(s).some(x=>x.id.startsWith('press:')),false);
});
test('full quest can complete and collect six notes',()=>{
 let s=freshBackstage();s=act(s,'collect:poster');s=act(s,'collect:poster');assert.equal(s.notes.length,1);
 s=go(s,'office');s=act(s,'collect:memo');s=act(s,'talk:mabel');s=act(s,'sign:waiver');
 s=go(s,'hall');s=act(s,'take:coin');s=go(s,'props');s=act(s,'collect:crate');s=act(s,'take:battery');s=act(s,'repair:mic');
 s=go(s,'dressing');s=act(s,'collect:mirror');s=go(s,'booth');s=act(s,'collect:mix');s=act(s,'press:gold');s=act(s,'press:pink');s=act(s,'press:cyan');
 s=go(s,'office');s=act(s,'request:pass');assert.equal(s.pass,true);assert.ok(tasks(s).every(x=>x.done));
 s=go(s,'stage');s=act(s,'collect:encore');s=act(s,'perform:encore');
 assert.equal(s.completed,true);assert.equal(s.notes.length,6);
});
test('local saves roundtrip and reject malformed or impossible saves',()=>{
 let s=act(freshBackstage(),'take:coin');
 const data=new Map();const store={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 saveBackstage(store,s);assert.equal(readBackstage(store).coin,true);
 data.set(BACKSTAGE_KEY,'{');assert.deepEqual(readBackstage(store),freshBackstage());
 data.set(BACKSTAGE_KEY,JSON.stringify({...freshBackstage(),room:'stage'}));
 assert.equal(readBackstage(store).room,'hall');
});
