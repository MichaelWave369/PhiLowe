import test from 'node:test';
import assert from 'node:assert/strict';
import {COMEDIANS,GUEST_COMEDIAN} from '../src/comedyClubEngine.js';
import {
 STAGE_PROPS,BADGES,BADGE_STORAGE_KEY,getProp,duelForAct,answerDuel,earnedBadges,readBadges,writeBadges
} from '../src/audienceChaos.js';

test('four stage props have unique IDs, visual style, and original cues',()=>{
 assert.equal(STAGE_PROPS.length,4);
 assert.equal(new Set(STAGE_PROPS.map(p=>p.id)).size,4);
 for(const prop of STAGE_PROPS){assert.ok(prop.label);assert.ok(prop.cue);assert.match(prop.className,/^chaos-/);}
 assert.equal(getProp('banana').id,'banana');
 assert.equal(getProp('unknown'),null);
});
test('every comedian, including guest, gets a safe rotating three-choice duel',()=>{
 for(const comedian of [...COMEDIANS,GUEST_COMEDIAN]){
   for(let round=0;round<3;round++){
     const act={comedian,number:1+round*(comedian.id==='guest'?5:4)};
     const duel=duelForAct(act);
     assert.ok(duel);
     assert.equal(duel.choices.length,3);
     assert.ok(duel.correct>=0&&duel.correct<3);
     assert.equal(answerDuel(duel,duel.correct).points,100);
     const wrong=(duel.correct+1)%3;
     assert.equal(answerDuel(duel,wrong).correct,false);
     assert.equal(answerDuel(duel,wrong).points,0);
   }
 }
 assert.equal(duelForAct(null),null);
 assert.equal(answerDuel(null,0),null);
 assert.equal(answerDuel(duelForAct({comedian:COMEDIANS[0],number:1}),99),null);
});
test('achievement thresholds are deterministic, validated and cumulative',()=>{
 assert.deepEqual(earnedBadges({acts:0,props:[],duelWins:0,laughs:0,openMicPlayed:false}),[]);
 assert.deepEqual(earnedBadges({acts:1,props:['chicken'],duelWins:0,laughs:0,openMicPlayed:false}),['first-show','prop-debut']);
 const full=earnedBadges({acts:10,props:STAGE_PROPS.map(x=>x.id),duelWins:3,laughs:5,openMicPlayed:true});
 assert.deepEqual(full,BADGES.map(x=>x.id));
 assert.equal(earnedBadges({acts:1,props:['chicken','chicken','fake']}).includes('prop-master'),false);
});
test('stored badges reject malformed or unrecognized data',()=>{
 const memory=new Map();
 const store={getItem:(key)=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 assert.deepEqual(readBadges(store),[]);
 const cleaned=writeBadges(store,['prop-debut','prop-debut','not-a-real-badge']);
 assert.deepEqual(cleaned,['prop-debut']);
 assert.deepEqual(readBadges(store),['prop-debut']);
 assert.equal(memory.has(BADGE_STORAGE_KEY),true);
 memory.set(BADGE_STORAGE_KEY,'not-json');
 assert.deepEqual(readBadges(store),[]);
 memory.set(BADGE_STORAGE_KEY,JSON.stringify({evil:true}));
 assert.deepEqual(readBadges(store),[]);
});
