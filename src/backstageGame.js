/** Original offline-first PhiLowe backstage adventure. */
export const BACKSTAGE_KEY='philowe.backstage.v1';
export const BACKSTAGE_VERSION=1;
export const ROOMS=[
 {id:'hall',name:'Hallway of Regrets',icon:'▤',theme:'violet',npc:'A suspicious vending machine',description:'The fire exit map leads to the gift shop. Of course it does.'},
 {id:'office',name:"Mabel's Office",icon:'▣',theme:'gold',npc:'Mabel Carbon-Copy',description:'Paperwork towers over an exhausted filing cabinet.'},
 {id:'props',name:'Prop Closet 369',icon:'★',theme:'mint',npc:'A rubber chicken',description:'The microphone is dead. A chicken is not taking questions.'},
 {id:'dressing',name:'Dressing Rooms',icon:'♥',theme:'pink',npc:'Bix Binary and Vera Velvet',description:'The mirrors offer career advice. Nobody asked.'},
 {id:'booth',name:'Lighting Booth',icon:'♫',theme:'cyan',npc:'DJ Parallax',description:'A three-color console waits for the cue sequence.'},
 {id:'stage',name:'The Secret Encore',icon:'✦',theme:'amber',npc:'The entire club',description:'The curtains have been cleared by the legal department.'}
];
export const NOTES=[
 {id:'poster',room:'hall',title:'Emergency Exit Instructions',text:'If jokes become dangerous, exit through the gift shop. LIGHT CUE: GOLD, PINK, CYAN.'},
 {id:'memo',room:'office',title:"Mabel's Liability Memo",text:'If a joke falls in an empty theater, file Form LOL-404 within three business decades.'},
 {id:'crate',room:'props',title:'Prop Closet Receipt',text:'ONE rubber chicken. ONE 9V battery. SEVENTEEN complaints from the poultry union.'},
 {id:'mirror',room:'dressing',title:'Dressing Room Reflection',text:'The mirror has been warned about giving unsolicited career advice.'},
 {id:'mix',room:'booth',title:'Technician’s Notes',text:'The audience wanted surround sound, so we surrounded them with problems.'},
 {id:'encore',room:'stage',title:'The Golden Punchline',text:'The best jokes make a hard day lighter. The encore is for everyone who needed that laugh.'}
];
export const LIGHT_ORDER=['gold','pink','cyan'];
const flags=['briefed','coin','battery','mic','waiver','cue','pass','completed','chicken','chickenGift'];
const initial={version:BACKSTAGE_VERSION,room:'hall',briefed:false,coin:false,battery:false,mic:false,waiver:false,cue:false,pass:false,completed:false,chicken:false,chickenGift:false};
export function freshBackstage(){return {...initial,notes:[],lights:[],visits:['hall']};}
export function tasks(s){return [
 {name:'Sign Form LOL-404',done:s.waiver},
 {name:'Repair the backup microphone',done:s.mic},
 {name:'Set the lighting sequence',done:s.cue},
 {name:'Obtain Mabel’s stage pass',done:s.pass}
];}
export function inventory(s){return [
 ...(s.coin?['Vending Coin']:[]),...(s.battery?['9V Battery']:[]),
 ...(s.chicken?['Rubber Chicken']:[]),...(s.mic?['Working Microphone']:[]),
 ...(s.waiver?['Signed Form LOL-404']:[]),...(s.cue?['Lighting Cue']:[]),
 ...(s.pass?["Mabel's Stage Pass"]:[])
];}
export function availableActions(s){
 switch(s.room){
  case 'hall':return [{id:'read:poster',label:'READ THE EXIT POSTER'},...(!s.coin?[{id:'take:coin',label:'SEARCH VENDING MACHINE'}]:[])];
  case 'office':return [{id:'talk:mabel',label:'ASK MABEL FOR THE BRIEFING'},...(!s.waiver?[{id:'sign:waiver',label:'SIGN FORM LOL-404'}]:[]),...(!s.pass?[{id:'request:pass',label:'REQUEST FINAL STAGE PASS'}]:[])];
  case 'props':return [...(!s.mic&&!s.battery?[{id:'take:battery',label:'BUY A 9V BATTERY'}]:[]),...(!s.mic?[{id:'repair:mic',label:'REPAIR SPARE MICROPHONE'}]:[]),...(!s.chicken&&!s.chickenGift?[{id:'take:chicken',label:'BORROW RUBBER CHICKEN'}]:[])];
  case 'dressing':return [{id:'talk:bix',label:'ASK BIX ABOUT THE BOOTH'},{id:'talk:vera',label:'TALK WITH VERA'},...(!s.chickenGift?[{id:'gift:chicken',label:'OFFER CHICKEN TO BIX'}]:[])];
  case 'booth':return [{id:'talk:dj',label:'ASK DJ ABOUT THE LIGHTS'},...(!s.cue?LIGHT_ORDER.map(color=>({id:'press:'+color,label:'PRESS '+color.toUpperCase()+' SWITCH'})):[])];
  case 'stage':return !s.completed?[{id:'perform:encore',label:'PERFORM THE GRAND ENCORE'}]:[];
  default:return [];
 }
}
export function playBackstage(s,action){
 if(!s||typeof action!=='string')return {state:freshBackstage(),message:'Adventure restarted.'};
 if(action.startsWith('go:')){
  const next=action.slice(3),room=ROOMS.find(r=>r.id===next);
  if(!room)return {state:s,message:'That doorway is not on this floor.'};
  if(next==='stage'&&!s.pass)return {state:s,message:'STAGE LOCKED. Mabel needs the waiver, working microphone, lighting cue, and final clearance.'};
  return {state:{...s,room:next,visits:s.visits.includes(next)?s.visits:[...s.visits,next]},message:room.description};
 }
 if(action.startsWith('collect:')){
  const note=NOTES.find(n=>n.id===action.slice(8));
  if(!note||note.room!==s.room)return {state:s,message:'No such collectible in this room.'};
  if(s.notes.includes(note.id))return {state:s,message:'Already in the scrapbook.'};
  return {state:{...s,notes:[...s.notes,note.id]},message:'SCRAPBOOK: '+note.title+' collected.'};
 }
 if(!availableActions(s).some(a=>a.id===action))return {state:s,message:'No effect. The audience requests a hint.'};
 switch(action){
  case 'read:poster':return {state:s,message:'The poster says: "LIGHT CUE: GOLD → PINK → CYAN." It also recommends leaving through the gift shop.'};
  case 'take:coin':return {state:{...s,coin:true},message:'FOUND: a coin in the vending return. It seems older than the venue.'};
  case 'talk:mabel':return {state:{...s,briefed:true},message:'Mabel: "Sign Form LOL-404, repair the microphone and set the booth lights GOLD, PINK, CYAN. Then report back for your stage pass."'};
  case 'sign:waiver':return !s.briefed?{state:s,message:'Mabel: "You must attend the mandatory briefing before signing!"'}:{state:{...s,waiver:true},message:'SIGNED: Form LOL-404. Mabel grudgingly acknowledges your existence.'};
  case 'request:pass':return !s.waiver||!s.mic||!s.cue?{state:s,message:'Mabel: "Not yet. I still need the signed waiver, repaired microphone and correct lighting cue."'}:{state:{...s,pass:true},message:'CLEARED: Mabel stamps a backstage pass so hard the building is briefly legal.'};
  case 'take:battery':return !s.coin?{state:s,message:'The battery dispenser wants a vending coin. Corporate policy.'}:{state:{...s,coin:false,battery:true},message:'FOUND: 9V battery. The receipt also includes a small apology.'};
  case 'repair:mic':return !s.battery?{state:s,message:'The microphone needs a 9V battery.'}:{state:{...s,battery:false,mic:true},message:'MIC REPAIRED! A dramatic squeal announces that nobody checked the volume.'};
  case 'take:chicken':return {state:{...s,chicken:true},message:'You borrow the rubber chicken. It requests better representation.'};
  case 'talk:bix':return {state:s,message:'Bix: "The light order is GOLD, PINK, CYAN. I wrote it down before the console ate my code."'};
  case 'talk:vera':return {state:s,message:'Vera: "Do not flirt with the curtain. It has healthier boundaries than the cast."'};
  case 'gift:chicken':return !s.chicken?{state:s,message:'Bix: "Where is the chicken? An actual chicken would work, but this is a union stage."'}:{state:{...s,chicken:false,chickenGift:true},message:'Bix squeezes the chicken. It makes a dial-up sound. He calls it his finest duet.'};
  case 'talk:dj':return {state:s,message:'DJ Parallax: "Remember GOLD, PINK, CYAN. Please do not remix the colors."'};
  case 'press:gold':case 'press:pink':case 'press:cyan':{
   const color=action.slice(6);
   if(color!==LIGHT_ORDER[s.lights.length])return {state:{...s,lights:[]},message:'BUZZ! Wrong color. The console resets to step one.'};
   const lights=[...s.lights,color];
   return lights.length===3?{state:{...s,lights,cue:true},message:'LIGHT CUE COMPLETE! Gold, pink and cyan beams cross the stage. DJ Parallax bows.'}:{state:{...s,lights},message:color.toUpperCase()+' accepted. '+(3-lights.length)+' remaining.'};
  }
  case 'perform:encore':return {state:{...s,completed:true},message:'ENCORE COMPLETE! Mabel files her first report under JOY. Even the filing cabinet laughs. This one is for everyone who needed a little escape.'};
  default:return {state:s,message:'The room politely declines.'};
 }
}
export function readBackstage(storage){
 try{
  const raw=storage?.getItem(BACKSTAGE_KEY);
  if(!raw)return freshBackstage();
  if(raw.length>30000)throw Error('oversized');
  const s=JSON.parse(raw);
  if(!s||s.version!==BACKSTAGE_VERSION||!ROOMS.some(r=>r.id===s.room))throw Error('invalid');
  if(flags.some(f=>typeof s[f]!=='boolean'))throw Error('flags');
  if(!Array.isArray(s.notes)||s.notes.length>NOTES.length||new Set(s.notes).size!==s.notes.length||s.notes.some(x=>!NOTES.some(n=>n.id===x)))throw Error('notes');
  if(!Array.isArray(s.lights)||s.lights.length>3||s.lights.some((x,i)=>x!==LIGHT_ORDER[i]))throw Error('lights');
  if(!Array.isArray(s.visits)||s.visits.length>ROOMS.length||new Set(s.visits).size!==s.visits.length||s.visits.some(x=>!ROOMS.some(r=>r.id===x)))throw Error('visits');
  if(s.pass&&(!s.waiver||!s.mic||!s.cue))throw Error('flags');
  if(s.room==='stage'&&!s.pass||s.completed&&(s.room!=='stage'||!s.pass))throw Error('stage');
  return s;
 }catch{return freshBackstage();}
}
export function saveBackstage(storage,state){storage?.setItem(BACKSTAGE_KEY,JSON.stringify(state));}
