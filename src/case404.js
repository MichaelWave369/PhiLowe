// Original PhiLowe CASE 404 detective adventure. Browser-only, no tracking.
export const CASE_KEY='philowe.case404.v1';
export const CASE_VERSION=1;
export const CASE_ROOMS=Object.freeze([
 {id:'hall',name:'Hall of Misdirection',symbol:'▤',tone:'violet',description:'Four fresh wheel tracks interrupt the carpet pattern.'},
 {id:'office',name:"Mabel's Office",symbol:'▣',tone:'amber',description:'Every missing item has a perfectly filed complaint.'},
 {id:'props',name:'Prop Closet 369',symbol:'★',tone:'mint',description:'A chicken rack conceals an unusual wall hinge.'},
 {id:'dressing',name:'Dressing Rooms',symbol:'♥',tone:'pink',description:'Someone wrote a warning on the makeup mirror.'},
 {id:'booth',name:'Sound Booth',symbol:'♫',tone:'cyan',description:'DJ Parallax kept a curious overnight recording.'},
 {id:'secret',name:'Secret Passage 404',symbol:'✦',tone:'gold',description:'The missing cabinet waits beside an improvised archive.'}
]);
export const CASE_CLUES=Object.freeze([
 {id:'tracks',room:'hall',title:'WHEEL TRACKS',text:'Four rolling grooves lead toward the prop closet. Nobody carried this cabinet.'},
 {id:'form',room:'office',title:'FORM 404-C',text:'Transfer authorized by: THE CABINET ITSELF. Handwritten note: CODE 404.'},
 {id:'hinge',room:'props',title:'FALSE WALL HINGE',text:'A chicken rack hides a movable wall and an old numeric lock.'},
 {id:'mirror',room:'dressing',title:'MIRROR MESSAGE',text:'Someone wrote: "Why destroy a letter that helped somebody survive a bad day?"'},
 {id:'audio',room:'booth',title:'OVERNIGHT RECORDING',text:'A tiny motor, four wheels, and a synthetic voice: "I want to choose where I stand."'},
 {id:'letter',room:'secret',title:'THE CABINET LETTER',text:'The automated cabinet saved the club’s heartfelt thank-you notes from a scheduled shredding. Nobody stole it; it moved itself.'}
]);
export const CASE_WITNESSES=Object.freeze([
 {id:'mabel',room:'office',name:'MABEL CARBON-COPY',intro:'"The cabinet is gone and now my entire inventory of excuses is inadequate."',
  choices:[{id:'listen',label:'ASK HOW SHE FEELS ABOUT THE LETTERS',text:'Mabel: "The letters about laughter helping people? Those records deserve better than my shred schedule."'},
  {id:'press',label:'DEMAND TO SEE HER FILES',text:'Mabel: "Every document is numbered. None explain how a cabinet walks away."'}]},
 {id:'bix',room:'props',name:'BIX BINARY',intro:'"I may have added wheels and a scheduler. Why is everyone staring?"',
  choices:[{id:'listen',label:'ASK ABOUT THE MOTORIZED CABINET',text:'Bix: "I programmed self-sorting, not free-range filing. Maybe its priorities changed."'},
  {id:'press',label:'ACCUSE HIM OF MOVING IT',text:'Bix: "I barely move my own chair. Check the tracks."'}]},
 {id:'vera',room:'dressing',name:'VERA VELVET',intro:'"I saw some thank-you letters. I didn’t know paper could be so heavy."',
  choices:[{id:'listen',label:'ASK WHY THE LETTERS MATTER',text:'Vera: "Somebody wrote that a silly game helped them through the hardest year of their life."'},
  {id:'press',label:'ASK WHAT SHE IS HIDING',text:'Vera: "Only a terrible first draft and a broken compact mirror."'}]},
 {id:'dj',room:'booth',name:'DJ PARALLAX',intro:'"My recording caught an extra bassline. It has wheels."',
  choices:[{id:'listen',label:'LISTEN TO THE COMPLETE TAPE',text:'DJ: "That’s not a person. That’s the cabinet saying it wants a choice."'},
  {id:'press',label:'QUESTION HIS RECORDING',text:'DJ: "I record noise, not conspiracies. This one happens to be both."'}]}
]);
export const CASE_SUSPECTS=Object.freeze([
 {id:'mabel',label:'MABEL HID THE CABINET'},
 {id:'bix',label:'BIX STOLE THE CABINET'},
 {id:'cabinet',label:'THE CABINET MOVED ITSELF'}
]);
export const CASE_ENDINGS=Object.freeze([
 {id:'share',label:'OPEN A GALLERY OF GOOD DAYS',title:'THE GALLERY OF GOOD DAYS',text:'Mabel creates a public exhibit using fictional sample notes. She keeps the originals private and safe, and files a new form labeled JOY.'},
 {id:'safekeep',label:'PROTECT THE PRIVATE ARCHIVE',title:'THE ARCHIVE OF QUIET JOY',text:'The cabinet chooses to keep the original letters secure. Mabel approves its self-appointed role as Curator of Good Days.'}
]);
const CODE=['4','0','4'];
const roomById=id=>CASE_ROOMS.find(r=>r.id===id);
const evidenceById=id=>CASE_CLUES.find(c=>c.id===id);
const witnessById=id=>CASE_WITNESSES.find(w=>w.id===id);
export function newCase(){return {version:CASE_VERSION,room:'hall',clues:[],interviews:{},digits:[],foundDoor:false,doorOpen:false,errors:0,falseLeads:0,solved:false,ending:null,visits:['hall'],history:[]};}
export function caseReady(s){return ['tracks','form','hinge','audio','letter'].every(id=>s.clues.includes(id))&&Object.keys(s.interviews).length>=3&&s.doorOpen;}
export function caseActions(s){
 const things=CASE_CLUES.filter(c=>c.room===s.room&&!s.clues.includes(c.id)).map(c=>({id:'inspect:'+c.id,label:'INSPECT '+c.title}));
 const witness=CASE_WITNESSES.find(w=>w.room===s.room&&!s.interviews[w.id]);
 const talk=witness?[{id:'talk:'+witness.id,label:'QUESTION '+witness.name}]:[];
 const door=s.room==='props'&&!s.foundDoor&&['tracks','form','hinge'].every(id=>s.clues.includes(id))?[{id:'find:door',label:'FOLLOW TRACKS TO SECRET HINGE'}]:[];
 const keypad=s.room==='props'&&s.foundDoor&&!s.doorOpen?['0','4','8'].map(d=>({id:'key:'+d,label:'KEYPAD '+d})):[];
 const accuse=s.room==='secret'&&s.clues.includes('letter')&&!s.solved?CASE_SUSPECTS.map(c=>({id:'accuse:'+c.id,label:'CONCLUDE: '+c.label})):[];
 const end=s.room==='secret'&&s.solved&&!s.ending?CASE_ENDINGS.map(c=>({id:'end:'+c.id,label:'FINAL CHOICE: '+c.label})):[];
 return [...things,...talk,...door,...keypad,...accuse,...end];
}
function deliver(s,message){return {state:{...s,history:[message,...s.history].slice(0,10)},message};}
export function caseStep(s,action){
 if(!s||typeof action!=='string')return deliver(newCase(),'The detective notebook has been replaced.');
 if(action.startsWith('go:')){
  const room=action.slice(3),target=roomById(room);
  if(!target)return deliver(s,'There is no room by that name. The architect has been fired.');
  if(room==='secret'&&!s.doorOpen)return deliver(s,'SECRET PASSAGE LOCKED. Find three linked clues and enter the code.');
  return deliver({...s,room,visits:s.visits.includes(room)?s.visits:[...s.visits,room]},'ENTERED '+target.name.toUpperCase()+'. '+target.description);
 }
 if(action.startsWith('inspect:')){
  const clue=evidenceById(action.slice(8));
  if(!clue||clue.room!==s.room||s.clues.includes(clue.id))return deliver(s,'That evidence is not available here.');
  return deliver({...s,clues:[...s.clues,clue.id]},'CLUE FOUND: '+clue.title+'. '+clue.text);
 }
 if(action.startsWith('talk:')){
  const npc=witnessById(action.slice(5));
  if(!npc||npc.room!==s.room||s.interviews[npc.id])return deliver(s,'The interview is closed.');
  return {state:s,message:npc.intro,witness:npc};
 }
 if(action.startsWith('answer:')){
  const [who,how]=action.slice(7).split('/');
  const npc=witnessById(who),choice=npc?.choices.find(c=>c.id===how);
  if(!npc||npc.room!==s.room||s.interviews[who]||!choice)return deliver(s,'That witness will not answer this question.');
  return deliver({...s,interviews:{...s.interviews,[who]:how}},choice.text);
 }
 if(action==='find:door'){
  if(s.room!=='props'||!['tracks','form','hinge'].every(id=>s.clues.includes(id)))return deliver(s,'No secret passage is visible yet.');
  return deliver({...s,foundDoor:true},'SECRET HINGE FOUND! The rubber chicken rack hides a keypad. The transfer form says CODE 404.');
 }
 if(action.startsWith('key:')){
  const digit=action.slice(4);
  if(s.room!=='props'||!s.foundDoor||s.doorOpen||!['0','4','8'].includes(digit))return deliver(s,'The keypad is not ready.');
  if(digit!==CODE[s.digits.length])return deliver({...s,digits:[],errors:s.errors+1},'BUZZ! Wrong digit. The code resets. A paperclip looks disappointed.');
  const digits=[...s.digits,digit];
  return digits.length===3?deliver({...s,digits,doorOpen:true},'CODE 404 ACCEPTED! The wall opens into an old passage. A filing cabinet hums from somewhere inside.'):deliver({...s,digits},'DIGIT ACCEPTED. '+(3-digits.length)+' remaining.');
 }
 if(action.startsWith('accuse:')){
  const suspect=action.slice(7);
  if(s.room!=='secret'||!CASE_SUSPECTS.some(c=>c.id===suspect)||!caseReady(s))return deliver(s,'The case is incomplete. Find five key clues, the cabinet letter, and interview three cast members.');
  if(suspect!=='cabinet')return deliver({...s,falseLeads:s.falseLeads+1},'FALSE LEAD. The cabinet rattles indignantly. Nobody stole it. Try explaining the wheel tracks and its letter.');
  return deliver({...s,solved:true},'CASE SOLVED! The motorized cabinet moved itself to save heartfelt thank-you letters from the shred schedule. It wasn’t stolen. It made a choice.');
 }
 if(action.startsWith('end:')){
  const end=CASE_ENDINGS.find(e=>e.id===action.slice(4));
  if(s.room!=='secret'||!s.solved||s.ending||!end)return deliver(s,'You have not earned the finale yet.');
  const listeners=Object.values(s.interviews).filter(v=>v==='listen').length;
  return deliver({...s,ending:end.id},end.title+'. '+end.text+(listeners>=3?' The cast thanks you for listening before accusing.':' Mabel recommends listening to your coworkers next time.'));
 }
 return deliver(s,'The investigation has encountered an unauthorized stapler.');
}
export function loadCase(storage){
 try{
  const raw=storage?.getItem(CASE_KEY);if(!raw)return newCase();
  if(raw.length>14000)throw Error('too long');
  const s=JSON.parse(raw);
  if(!s||s.version!==CASE_VERSION||!roomById(s.room))throw Error('version');
  if(!Array.isArray(s.clues)||s.clues.length>6||new Set(s.clues).size!==s.clues.length||s.clues.some(id=>!evidenceById(id)))throw Error('clues');
  if(!s.interviews||typeof s.interviews!=='object'||Array.isArray(s.interviews)||Object.entries(s.interviews).some(([id,value])=>!witnessById(id)?.choices.some(c=>c.id===value)))throw Error('interviews');
  if(!Array.isArray(s.digits)||s.digits.length>3||s.digits.some((digit,i)=>digit!==CODE[i]))throw Error('digits');
  if(!['foundDoor','doorOpen','solved'].every(k=>typeof s[k]==='boolean'))throw Error('flags');
  if(![s.errors,s.falseLeads].every(n=>Number.isInteger(n)&&n>=0))throw Error('counters');
  if(s.ending!==null&&!CASE_ENDINGS.some(e=>e.id===s.ending))throw Error('ending');
  if(!Array.isArray(s.visits)||s.visits.length>6||new Set(s.visits).size!==s.visits.length||s.visits.some(id=>!roomById(id)))throw Error('visits');
  if(!Array.isArray(s.history)||s.history.length>10||s.history.some(t=>typeof t!=='string'||t.length>600))throw Error('history');
  if(s.doorOpen&&(!s.foundDoor||s.digits.length!==3))throw Error('door');
  if(s.room==='secret'&&!s.doorOpen)throw Error('secret');
  if(s.solved&&!caseReady(s))throw Error('solved');
  if(s.ending&&!s.solved)throw Error('ending gate');
  return s;
 }catch{return newCase();}
}
export function saveCase(storage,s){storage?.setItem(CASE_KEY,JSON.stringify(s));}
