import test from 'node:test';
import assert from 'node:assert/strict';
import {LANES,MAX_THROWS_PER_ACT,MAX_REPORTS,MANAGER,REPORT_KEY,nextTomato,resolveTomato,incidentReport,trimReports,readReports,writeReports,serializeReportArchive} from '../src/tomatoNight.js';
const comedian={name:'BIX BINARY'};
const date='2026-11-04T22:00:00.000Z';
test('one of three visible lanes is selected predictably, at most 3 throws per act',()=>{
 const lanes=Array.from({length:MAX_THROWS_PER_ACT},(_,i)=>nextTomato(1,i)?.lane);
 assert.deepEqual(lanes,LANES);
 assert.equal(nextTomato(1,3),null);
 assert.equal(nextTomato(0,0),null);
 assert.equal(nextTomato(1,-1),null);
 assert.deepEqual(nextTomato(2,0),{actNumber:2,attempt:1,lane:'CENTER'});
});
test('players can dodge into a different lane and get splatted if they remain on target',()=>{
 const incoming=nextTomato(1,0);
 const escape=resolveTomato(incoming,'RIGHT');
 assert.equal(escape.dodged,true);assert.equal(escape.outcome,'DODGED');
 const hit=resolveTomato(incoming,'LEFT');
 assert.equal(hit.dodged,false);assert.equal(hit.outcome,'SPLAT');
 assert.equal(resolveTomato(incoming,'NOT A LANE'),null);
 assert.equal(resolveTomato(null,'LEFT'),null);
});
test('manager incident reports are bounded, validated and exportable',()=>{
 const incoming=nextTomato(1,0);
 const record=incidentReport(incoming,resolveTomato(incoming,'CENTER'),comedian,date);
 assert.equal(record.performer,'BIX BINARY');
 assert.equal(record.outcome,'DODGED');
 assert.equal(trimReports([record,record,{evil:'yes'}]).length,1);
 const archive=JSON.parse(serializeReportArchive([record]));
 assert.equal(archive.manager,MANAGER.name);
 assert.equal(archive.reports.length,1);
 assert.equal(archive.format,'philowe-tomato-incidents');
 assert.ok(archive.reports[0].note.length>10);
});
test('reports persist locally, reject garbage and trim to 30',()=>{
 const incoming=nextTomato(1,0),res=resolveTomato(incoming,'LEFT');
 const many=Array.from({length:40},(_,i)=>({...incidentReport(incoming,res,comedian,date),id:'INC-'+i}));
 const data=new Map(),storage={getItem:key=>data.get(key),setItem:(key,val)=>data.set(key,val)};
 assert.equal(writeReports(storage,many).length,MAX_REPORTS);
 assert.equal(readReports(storage).length,MAX_REPORTS);
 assert.equal(data.has(REPORT_KEY),true);
 data.set(REPORT_KEY,'{');
 assert.deepEqual(readReports(storage),[]);
 data.set(REPORT_KEY,JSON.stringify([{id:'INVALID',at:date}]));
 assert.deepEqual(readReports(storage),[]);
});
