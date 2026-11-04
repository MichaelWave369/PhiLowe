import test from 'node:test';
import assert from 'node:assert/strict';
import {JOKE_CATEGORIES} from '../src/jokes.js';
import {
  STORAGE_KEY,MAX_JOKES,loadWriterRoom,serializeStorage,upsertJoke,removeJoke,
  onStage,exportBackup,parseBackup,mergeBackup,normalizeDraft
} from '../src/writerRoomStore.js';
const stamp='2026-11-04T22:00:00.000Z';
let n=0;
const uid=()=> 'CW-testid-'+String(++n).padStart(8,'0');
const draft=(overrides={})=>({category:'retro',setup:'How many floppy disks?',punchline:'At least one.',notes:'',status:'draft',...overrides});

test('creates, edits and removes jokes while preserving original creation time',()=>{
  const one=upsertJoke([],draft(),null,uid,stamp);
  assert.equal(one.length,1);
  assert.equal(one[0].status,'draft');
  assert.equal(one[0].createdAt,stamp);
  const next=upsertJoke(one,draft({punchline:'Three, plus emotional support.',status:'stage'}),one[0].id,uid,'2026-11-05T00:00:00Z');
  assert.equal(next[0].id,one[0].id);
  assert.equal(next[0].createdAt,stamp);
  assert.equal(onStage(one).length,0);
  assert.equal(onStage(next).length,1);
  assert.deepEqual(removeJoke(next,next[0].id),[]);
});
test('validates categories, lengths, duplicate setups and empty text',()=>{
  assert.throws(()=>normalizeDraft(draft({category:'unknown'})),/department/i);
  assert.throws(()=>normalizeDraft(draft({setup:' '})),/empty/i);
  assert.throws(()=>normalizeDraft(draft({punchline:'x'.repeat(321)})),/320/);
  assert.throws(()=>normalizeDraft(draft({status:'live'})),/Draft or On stage/);
  const one=upsertJoke([],draft(),null,uid,stamp);
  assert.throws(()=>upsertJoke(one,draft(),null,uid,stamp),/already exist/i);
});
test('all known departments are accepted',()=>{
  for(const c of JOKE_CATEGORIES)assert.equal(normalizeDraft(draft({category:c.id})).category,c.id);
});
test('save/load and backup roundtrip',()=>{
  const jokes=upsertJoke([],draft(),null,uid,stamp);
  const stored=serializeStorage(jokes);
  const storage={getItem:key=>key===STORAGE_KEY?stored:null};
  assert.deepEqual(loadWriterRoom(storage),{jokes,warning:''});
  const backup=exportBackup(jokes,stamp);
  assert.deepEqual(parseBackup(backup),jokes);
});
test('malformed browser storage warns rather than throwing or returning junk',()=>{
  const bad={getItem:()=>'{'};
  const out=loadWriterRoom(bad);
  assert.deepEqual(out.jokes,[]);
  assert.match(out.warning,/not overwritten/);
});
test('malformed or incompatible backups are rejected',()=>{
  assert.throws(()=>parseBackup('oops'),/valid JSON/);
  assert.throws(()=>parseBackup('{}'),/not a PhiLowe/);
  assert.throws(()=>parseBackup('x'.repeat(2*1024*1024+1)),/2 MB/);
});
test('merge skips duplicate joke text, remints IDs and keeps unpublished as drafts',()=>{
  const one=upsertJoke([],draft(),null,uid,stamp);
  const newJoke=upsertJoke([],draft({setup:'Why code?',punchline:'Because.'}),null,uid,stamp);
  const {jokes,added,skipped}=mergeBackup(one,[one[0],newJoke[0]],uid,stamp);
  assert.equal(added,1);assert.equal(skipped,1);
  assert.equal(jokes.length,2);
  assert.notEqual(jokes[1].id,newJoke[0].id);
  assert.equal(onStage(jokes).length,0);
});
test('capacity enforced and imports are atomic',()=>{
  const now=stamp;
  const all=Array.from({length:MAX_JOKES},(_,i)=>({id:'CW-valid-'+String(i).padStart(8,'0'),category:'retro',setup:'Setup '+i,punchline:'Punch '+i,notes:'',status:'draft',createdAt:now,updatedAt:now}));
  assert.throws(()=>upsertJoke(all,draft(),null,uid,now),/500 jokes/);
  const incoming=upsertJoke([],draft({setup:'Unique import setup'}),null,uid,stamp);
  assert.throws(()=>mergeBackup(all,incoming,uid,now),/limit/);
  assert.equal(all.length,MAX_JOKES);
});
