import test from 'node:test';
import assert from 'node:assert/strict';
import {CUT_KEY,SCENES,cutEmpty,earnedCutFlags,mergeCutFlags,sceneUnlocked,availableScenes,markSceneViewed,readCut,saveCut} from '../src/directorsCut.js';

test('original nine reels contain unique IDs and two distinct choices',()=>{
 assert.equal(SCENES.length,9);
 assert.equal(new Set(SCENES.map(s=>s.id)).size,SCENES.length);
 for(const scene of SCENES){
  assert.equal(scene.options.length,2);
  assert.equal(new Set(scene.options.map(c=>c.id)).size,2);
  assert.ok(scene.lines.length&&scene.setting&&scene.title);
 }
});
test('gallery starts with a playable cold open only',()=>{
 const state=cutEmpty();
 assert.deepEqual(availableScenes(state).map(x=>x.id),['cold-open']);
 assert.equal(sceneUnlocked(SCENES[2],state),false);
 assert.throws(()=>markSceneViewed(state,'encore','bow'),/locked/);
});
test('backstage and Case404 unlock their own reels without wiping history',()=>{
 const initial=cutEmpty();
 const first=mergeCutFlags(initial,{completed:true,chickenGift:true},{ending:null});
 assert.deepEqual(first.flags,['chicken','encore']);
 let state=markSceneViewed(first,'encore','dance');
 const updated=mergeCutFlags(state,{completed:false,chickenGift:false},{solved:true,falseLeads:1,ending:'share',interviews:{mabel:'listen',vera:'listen',bix:'listen'}});
 assert.equal(updated.watched.includes('encore'),true);
 assert.equal(updated.choices.encore,'dance');
 assert.ok(availableScenes(updated).some(x=>x.id==='double-feature'));
 assert.ok(availableScenes(updated).some(x=>x.id==='gallery'));
 assert.ok(availableScenes(updated).some(x=>x.id==='listening'));
 assert.equal(availableScenes(updated).some(x=>x.id==='archive'),false);
 assert.equal(mergeCutFlags(updated,null,null),updated);
});
test('archive ending unlocks private archive reel instead of gallery reel',()=>{
 const state=mergeCutFlags(cutEmpty(),null,{ending:'safekeep',solved:true,interviews:{},falseLeads:0});
 assert.equal(availableScenes(state).some(x=>x.id==='archive'),true);
 assert.equal(availableScenes(state).some(x=>x.id==='gallery'),false);
});
test('watching scenes is repeatable and the alternate cut changes on replay',()=>{
 let state=markSceneViewed(cutEmpty(),'cold-open','laugh');
 assert.deepEqual(state.watched,['cold-open']);
 assert.equal(state.choices['cold-open'],'laugh');
 state=markSceneViewed(state,'cold-open','serious');
 assert.deepEqual(state.watched,['cold-open']);
 assert.equal(state.choices['cold-open'],'serious');
 assert.throws(()=>markSceneViewed(state,'cold-open','nonexistent'),/Unknown/);
});
test('gallery saves safely, discards malformed data and unearned views',()=>{
 let state=markSceneViewed(cutEmpty(),'cold-open','laugh');
 const data=new Map();
 const store={getItem:key=>data.get(key),setItem:(key,val)=>data.set(key,val)};
 saveCut(store,state);
 assert.equal(data.has(CUT_KEY),true);
 assert.deepEqual(readCut(store),state);
 data.set(CUT_KEY,'{');assert.deepEqual(readCut(store),cutEmpty());
 data.set(CUT_KEY,JSON.stringify({...state,watched:['double-feature']}));
 assert.deepEqual(readCut(store),cutEmpty());
});
