import {JOKE_CATEGORIES} from './jokes.js';

export const STORAGE_KEY='philowe.writer-room.v1';
export const BACKUP_FORMAT='philowe.writer-room';
export const SCHEMA_VERSION=1;
export const MAX_JOKES=500;
export const MAX_IMPORT_BYTES=2*1024*1024;
const validCategories=new Set(JOKE_CATEGORIES.map(c=>c.id));

function field(value,name,max,required=true){
  if(typeof value!=='string')throw new Error(name+' must be text.');
  const clean=value.replace(/\r\n?/g,'\n').trim();
  if(required&&!clean)throw new Error(name+' cannot be empty.');
  if(clean.length>max)throw new Error(name+' exceeds '+max+' characters.');
  return clean;
}
export function normalizeDraft(data){
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid joke entry.');
  const category=field(data.category,'Department',30);
  if(!validCategories.has(category))throw new Error('Unknown joke department.');
  const status=data.status;
  if(status!=='draft'&&status!=='stage')throw new Error('Select Draft or On stage.');
  return {
    category,
    setup:field(data.setup,'Setup',240),
    punchline:field(data.punchline,'Punchline',320),
    notes:field(data.notes??'','Notes',800,false),
    status
  };
}
export function createId(){
  const random=typeof globalThis.crypto?.randomUUID==='function'
    ?globalThis.crypto.randomUUID()
    :Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2);
  return 'CW-'+random;
}
function fingerprint(joke){
  return (joke.setup+'\u0000'+joke.punchline).trim().toLocaleLowerCase('en');
}
function saneId(id){
  return typeof id==='string'&&/^CW-[a-zA-Z0-9-]{8,90}$/.test(id);
}
function saneTime(value){
  return typeof value==='string'&&value.length<=35&&!Number.isNaN(Date.parse(value));
}
function validatedRecord(value){
  const clean=normalizeDraft(value);
  if(!saneId(value.id))throw new Error('Invalid joke ID.');
  if(!saneTime(value.createdAt)||!saneTime(value.updatedAt))throw new Error('Invalid date.');
  return {...clean,id:value.id,createdAt:value.createdAt,updatedAt:value.updatedAt};
}
function validatedArray(array){
  if(!Array.isArray(array)||array.length>MAX_JOKES)throw new Error('Joke collection is not valid.');
  const ids=new Set(),fingerprints=new Set();
  return array.map(value=>{
    const record=validatedRecord(value);
    if(ids.has(record.id)||fingerprints.has(fingerprint(record)))throw new Error('Duplicate joke in collection.');
    ids.add(record.id);fingerprints.add(fingerprint(record));
    return record;
  });
}
export function loadWriterRoom(storage){
  try {
    const raw=storage?.getItem(STORAGE_KEY);
    if(!raw)return {jokes:[],warning:''};
    if(raw.length>MAX_IMPORT_BYTES)throw new Error('Saved writers room exceeds the safe size limit.');
    const parsed=JSON.parse(raw);
    if(parsed?.version!==SCHEMA_VERSION)throw new Error('Unsupported saved version.');
    return {jokes:validatedArray(parsed.jokes),warning:''};
  }catch(error){
    return {jokes:[],warning:'Saved joke data could not be loaded: '+error.message+'. Existing browser data was not overwritten.'};
  }
}
export function serializeStorage(jokes){
  return JSON.stringify({version:SCHEMA_VERSION,jokes:validatedArray(jokes)});
}
export function upsertJoke(list,input,editingId=null,makeId=createId,now=new Date().toISOString()){
  const clean=normalizeDraft(input);
  if(!saneTime(now))throw new Error('Invalid edit time.');
  const duplicate=list.find(j=>j.id!==editingId&&fingerprint(j)===fingerprint(clean));
  if(duplicate)throw new Error('That exact setup and punchline already exist in your collection.');
  if(editingId){
    const old=list.find(j=>j.id===editingId);
    if(!old)throw new Error('The joke you were editing is no longer available.');
    return list.map(j=>j.id===editingId?{...clean,id:old.id,createdAt:old.createdAt,updatedAt:now}:j);
  }
  if(list.length>=MAX_JOKES)throw new Error('500 jokes is the current local limit. Back up or remove older jokes first.');
  const id=makeId();
  if(!saneId(id)||list.some(j=>j.id===id))throw new Error('Could not generate a unique joke ID. Please retry.');
  return [{...clean,id,createdAt:now,updatedAt:now},...list];
}
export function removeJoke(list,id){return list.filter(j=>j.id!==id);}
export function onStage(list){return list.filter(j=>j.status==='stage');}
export function exportBackup(list,now=new Date().toISOString()){
  return JSON.stringify({format:BACKUP_FORMAT,version:SCHEMA_VERSION,exportedAt:now,jokes:validatedArray(list)},null,2);
}
export function parseBackup(text){
  if(typeof text!=='string'||text.length>MAX_IMPORT_BYTES)throw new Error('Backup exceeds the 512 KB limit.');
  let data;
  try {data=JSON.parse(text);}catch{throw new Error('This is not valid JSON.');}
  if(data?.format!==BACKUP_FORMAT||data?.version!==SCHEMA_VERSION)throw new Error('This is not a PhiLowe Writer Room v1 backup.');
  return validatedArray(data.jokes);
}
export function mergeBackup(existing,incoming,makeId=createId,now=new Date().toISOString()){
  const imported=validatedArray(incoming);
  let list=validatedArray(existing),added=0,skipped=0;
  const known=new Set(list.map(fingerprint));
  const ids=new Set(list.map(j=>j.id));
  for(const joke of imported){
    if(known.has(fingerprint(joke))){skipped++;continue;}
    if(list.length>=MAX_JOKES)throw new Error('Import would exceed the 500-joke limit. Nothing was imported.');
    let id=makeId(),attempts=0;
    while(ids.has(id)&&attempts++<10)id=makeId();
    if(!saneId(id)||ids.has(id))throw new Error('Could not generate unique IDs. Nothing was imported.');
    const record={...joke,id,createdAt:now,updatedAt:now};
    list=[...list,record];ids.add(id);known.add(fingerprint(joke));added++;
  }
  return {jokes:list,added,skipped};
}
