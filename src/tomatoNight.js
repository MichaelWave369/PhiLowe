// Original PhiLowe slapstick engine. Every throw and response is explicit
// player interaction; nothing is thrown automatically or over a network.
export const LANES=Object.freeze(['LEFT','CENTER','RIGHT']);
export const MAX_THROWS_PER_ACT=3;
export const MAX_REPORTS=30;
export const REPORT_KEY='philowe.tomato-night.reports.v1';
export const MANAGER=Object.freeze({
  name:'MABEL CARBON-COPY',
  title:'Senior Director of Preventable Incidents',
  motto:'If it was funny, there had better be paperwork.'
});
const COMMENTARY=Object.freeze({
  dodge: [
    'Mabel files the event under "successful evasive comedy." Nobody is impressed with the paperwork.',
    'The tomato missed. Mabel has already scheduled a safety meeting about the near miss.',
    'The performer escapes. Mabel issues a citation to gravity for insufficient effort.'
  ],
  splat: [
    'Direct hit. Mabel invoices the tomato for costume cleaning.',
    'The comedian has been sauced. Mabel requires an incident report in triplicate.',
    'A spectacular splat. Mabel informs the audience that tomatoes are not tax deductible.'
  ]
});
export function nextTomato(actNumber,attempt) {
  if(!Number.isInteger(actNumber)||actNumber<1||!Number.isInteger(attempt)||attempt<0||attempt>=MAX_THROWS_PER_ACT)return null;
  const lane=LANES[(actNumber+attempt-1)%LANES.length];
  return {actNumber,attempt:attempt+1,lane};
}
export function resolveTomato(throwState,dodgeLane) {
  if(!throwState||!LANES.includes(throwState.lane)||!LANES.includes(dodgeLane))return null;
  const dodged=throwState.lane!==dodgeLane;
  const lines=COMMENTARY[dodged?'dodge':'splat'];
  return {
    dodged,dodgeLane,impact:throwState.lane,
    text:lines[(throwState.actNumber+throwState.attempt-2)%lines.length],
    outcome:dodged?'DODGED':'SPLAT'
  };
}
export function incidentReport(throwState,resolution,comedian,when=new Date().toISOString()) {
  if(!throwState||!resolution||!comedian?.name)return null;
  return {
    id:'INC-'+throwState.actNumber+'-'+throwState.attempt+'-'+when.replace(/[^0-9]/g,'').slice(-9),
    at:when,performer:comedian.name.slice(0,80),act:throwState.actNumber,
    incoming:throwState.lane,dodge:resolution.dodgeLane,outcome:resolution.outcome,
    note:resolution.text
  };
}
function validReport(value) {
  return value&&typeof value==='object'&&!Array.isArray(value)
    &&typeof value.id==='string'&&value.id.length<=50&&/^INC-[A-Za-z0-9-]+$/.test(value.id)
    &&typeof value.at==='string'&&value.at.length<=35&&!Number.isNaN(Date.parse(value.at))
    &&typeof value.performer==='string'&&value.performer.length<=80
    &&Number.isInteger(value.act)&&value.act>0
    &&LANES.includes(value.incoming)&&LANES.includes(value.dodge)
    &&['DODGED','SPLAT'].includes(value.outcome)
    &&typeof value.note==='string'&&value.note.length<=350;
}
export function trimReports(list) {
  if(!Array.isArray(list))return [];
  const seen=new Set();
  return list.filter(record=>{
    if(!validReport(record)||seen.has(record.id))return false;
    seen.add(record.id);
    return true;
  }).slice(0,MAX_REPORTS);
}
export function readReports(storage){
  try {
    const raw=storage?.getItem(REPORT_KEY);
    if(!raw||raw.length>40000)return [];
    return trimReports(JSON.parse(raw));
  }catch {return [];}
}
export function writeReports(storage,list){
  const clean=trimReports(list);
  storage?.setItem(REPORT_KEY,JSON.stringify(clean));
  return clean;
}
export function serializeReportArchive(list) {
  const clean=trimReports(list);
  return JSON.stringify({
    format:'philowe-tomato-incidents',version:1,manager:MANAGER.name,
    reports:clean
  },null,2);
}
