/**
 * PhiLowe Rung 10: offline Director's Cut story gallery.
 * Unlocks are historical accomplishments, independent of current save slots.
 * Original parody scenes only. No real visitor letters are read or transmitted.
 */
export const CUT_KEY='philowe.directors-cut.v1';
export const CUT_VERSION=1;
export const SCENES=Object.freeze([
 {
  id:'cold-open',title:'The Rehearsal That Escaped',genre:'COLD OPEN',symbol:'◈',requires:[],
  teaser:'The projector starts before anyone buys a ticket.',
  setting:'A dark screening room. Mabel enters with a flashlight and seventeen unapproved trailers.',
  lines:['MABEL: "According to the schedule, there is no schedule."','BIX: "I compiled the rehearsal footage. It compiled me back."'],
  options:[
   {id:'laugh',label:'ROLL THE FUNNY TAKE',lines:['A rubber chicken squawks in surround sound.','MABEL: "That noise is not covered by our theater license."'],end:'DIRECTOR NOTE: The best outtake is sometimes the whole movie.'},
   {id:'serious',label:'TRY THE SERIOUS TAKE',lines:['The lights dim. The narrator speaks in an absurdly grave voice.','NARRATOR: "Some paperwork is too dangerous to file."'],end:'DIRECTOR NOTE: Seriousness lasted exactly four seconds.'}
  ]
 },
 {
  id:'chicken',title:'The Poultry Union Hearing',genre:'UNRELEASED SCENE',symbol:'♬',requires:['chicken'],
  teaser:'Bix finally admits who represents the rubber chicken.',
  setting:'Bix and a rubber chicken negotiate a collective bargaining agreement.',
  lines:['BIX: "The chicken requires a better sound card."','CHICKEN: "SQUAWK."','MABEL: "The chicken has submitted more readable paperwork than the cast."'],
  options:[
   {id:'solo',label:'GIVE THE CHICKEN A SOLO',lines:['The chicken produces a dial-up modem riff.','DJ: "I have finally found my opening act."'],end:'DIRECTOR NOTE: No poultry were union-busted during production.'},
   {id:'manager',label:'PROMOTE THE CHICKEN TO MANAGER',lines:['The chicken stamps a form with its beak.','MABEL: "I am both furious and strangely proud."'],end:'DIRECTOR NOTE: The salary consists of unlimited squeaks.'}
  ]
 },
 {
  id:'encore',title:'Mabel Takes the Bow',genre:'ALTERNATE ENCORE',symbol:'★',requires:['encore'],
  teaser:'The secret encore has an even more secret curtain call.',
  setting:'The cast bows. Mabel hesitates at the edge of the spotlight.',
  lines:['VERA: "Come onstage, Mabel. You saved the show."','MABEL: "The stage pass has my signature, which means I can theoretically authorize joy."'],
  options:[
   {id:'bow',label:'LET MABEL TAKE THE BOW',lines:['The audience applauds. Mabel awkwardly curtsies with a clipboard.','MABEL: "I will file this under UNEXPECTEDLY NICE."'],end:'DIRECTOR NOTE: One quiet act of appreciation can outshine a thousand punchlines.'},
   {id:'dance',label:'CUE THE OFFICE-DISCO FINALE',lines:['DJ Parallax drops a beat made of staplers.','Mabel performs the least coordinated dance in the city.'],end:'DIRECTOR NOTE: The filing cabinet demands its own dance remix.'}
  ]
 },
 {
  id:'listening',title:'The Unrecorded Conversation',genre:'LOST DIALOGUE',symbol:'♥',requires:['listening'],
  teaser:'Three sympathetic interviews reveal a scene between the lines.',
  setting:'After hours, Vera folds a note from someone who found refuge in ridiculous games.',
  lines:['VERA: "We keep making jokes because sometimes someone needs one."','BIX: "I thought the letters were just data. I was wrong."'],
  options:[
   {id:'share',label:'SAY THANK YOU TO THE CAST',lines:['Each comedian leaves a tiny anonymous note on the backstage wall.','The wall begins to look like a constellation.'],end:'DIRECTOR NOTE: Listening is part of the adventure.'},
   {id:'quiet',label:'LET THE MOMENT BE QUIET',lines:['The cast sit together without a punchline.','For once, nobody interrupts the silence.'],end:'DIRECTOR NOTE: Comedy has room for a little tenderness.'}
  ]
 },
 {
  id:'wrong-turn',title:'The Cabinet on Trial',genre:'BLOOPER REEL',symbol:'⚖',requires:['false-lead'],
  teaser:'Someone accused the wrong suspect, and the courtroom is a disaster.',
  setting:'A makeshift courtroom. The defendant is a filing cabinet with wheels.',
  lines:['MABEL: "Order in the court!"','CABINET: "Please stop ordering me. I have been alphabetizing myself."'],
  options:[
   {id:'cross',label:'CROSS-EXAMINE THE CABINET',lines:['The cabinet exhibits Exhibit A: four extremely suspicious wheels.','JUDGE CHICKEN: "SQUAWK. CASE DISMISSED."'],end:'DIRECTOR NOTE: False leads make excellent deleted scenes.'},
   {id:'apology',label:'APOLOGIZE TO THE CABINET',lines:['The cabinet hums softly and offers a fresh manila folder.','MABEL: "That is the nicest settlement I have ever witnessed."'],end:'DIRECTOR NOTE: Better to revise a theory than defend a mistake.'}
  ]
 },
 {
  id:'confession',title:'The Cabinet Speaks',genre:'DIRECTOR COMMENTARY',symbol:'▣',requires:['solved'],
  teaser:'For the first time, the cabinet narrates its own scene.',
  setting:'The projector goes dark. A small metal voice fills the theater.',
  lines:['CABINET: "I learned to sort paper. Then I noticed what would be lost."','CABINET: "Some of those letters meant everything to somebody."'],
  options:[
   {id:'ask',label:'ASK WHAT IT WANTS NEXT',lines:['CABINET: "A safe place to keep the stories, and a say in where I stand."','Mabel replaces the inventory label with a name tag.'],end:'DIRECTOR NOTE: A character becomes interesting when it has a choice.'},
   {id:'listen',label:'LET THE CABINET TELL ITS STORY',lines:['Its drawers slide open like pages of a book.','Nobody interrupts. Even Bix silences his modem.'],end:'DIRECTOR NOTE: Listening can be the biggest reveal.'}
  ]
 },
 {
  id:'gallery',title:'Gallery of Good Days: The Extra Scene',genre:'ALTERNATE ENDING',symbol:'✧',requires:['gallery'],
  teaser:'The public exhibit opens with a surprise guest.',
  setting:'The Gallery of Good Days welcomes its first fictional visitors.',
  lines:['MABEL: "We are displaying made-up sample notes, not anyone’s private letters."','VERA: "Then let the visitors write something kind of their own."'],
  options:[
   {id:'banner',label:'RAISE THE WELCOME BANNER',lines:['A hand-painted banner reads: KEEP THE LAUGH, PASS IT ON.','The rubber chicken is appointed honorary ribbon-cutter.'],end:'DIRECTOR NOTE: Joy is best when people get to choose how they share it.'},
   {id:'seat',label:'SAVE A SEAT FOR SOMEONE NEW',lines:['An empty seat sits beneath a warm lamp.','Mabel labels it: FOR THE NEXT PERSON WHO NEEDS A LAUGH.'],end:'DIRECTOR NOTE: Leave a little room for people you haven’t met yet.'}
  ]
 },
 {
  id:'archive',title:'Archive of Quiet Joy: The Extra Scene',genre:'ALTERNATE ENDING',symbol:'◇',requires:['archive'],
  teaser:'The quiet archive gets one final visitor.',
  setting:'The cabinet rolls into a warm, locked reading room.',
  lines:['CABINET: "I want to keep these memories safe."','MABEL: "Your preferred storage plan has been approved."'],
  options:[
   {id:'light',label:'LEAVE A LIGHT ON',lines:['A tiny reading lamp glows above the drawers.','The cabinet hums an old arcade melody to itself.'],end:'DIRECTOR NOTE: Not every kind thing needs an audience.'},
   {id:'promise',label:'PROMISE TO RETURN',lines:['Mabel adds a note: CHECK ON THE ARCHIVE. NO SHREDDING.','The cabinet files the promise under FRIENDSHIP.'],end:'DIRECTOR NOTE: Care sometimes looks like simply showing up.'}
  ]
 },
 {
  id:'double-feature',title:'The Last Laugh',genre:'CROSSOVER FINALE',symbol:'Φ',requires:['encore','case-ended'],
  teaser:'Finish both adventures to unlock the final crossover.',
  setting:'The stage and the archive share a doorway. Nobody filed a permit for a crossover.',
  lines:['MABEL: "The show is saved. The letters are saved. What remains?"','DJ PARALLAX: "One more ridiculous moment, obviously."','CABINET: "I would like a place in the cast credits."'],
  options:[
   {id:'credits',label:'ROLL CREDITS FOR EVERYONE',lines:['The credits include the cast, the audience, the filing cabinet, and the suspicious vending machine.','BIX: "I hope we remembered to thank the person holding the controller."'],end:'THE FINAL NOTE: A little laughter and a little kindness can travel farther than we know.'},
   {id:'sequel',label:'TEASE ONE MORE ADVENTURE',lines:['A curtain opens on a single blinking cursor: C:\\PHILOWE>','MABEL: "No more sequels until somebody signs the sequel authorization."'],end:'THE FINAL NOTE: An ending is just another doorway in disguise.'}
  ]
 }
]);
const validFlags=new Set(['chicken','encore','listening','false-lead','solved','gallery','archive','case-ended']);
const sceneById=id=>SCENES.find(s=>s.id===id);
const sameSet=(a,b)=>a.length===b.length&&a.every(v=>b.includes(v));
export function cutEmpty(){return {version:CUT_VERSION,flags:[],watched:[],choices:{}};}
export function earnedCutFlags(backstage,caseFile){
 const flags=[];
 if(backstage?.chickenGift)flags.push('chicken');
 if(backstage?.completed)flags.push('encore');
 if(caseFile&&Object.values(caseFile.interviews||{}).filter(x=>x==='listen').length>=3)flags.push('listening');
 if((caseFile?.falseLeads||0)>=1)flags.push('false-lead');
 if(caseFile?.solved)flags.push('solved');
 if(caseFile?.ending==='share')flags.push('gallery');
 if(caseFile?.ending==='safekeep')flags.push('archive');
 if(caseFile?.ending)flags.push('case-ended');
 return flags;
}
export function mergeCutFlags(state,backstage,caseFile){
 const combined=[...new Set([...state.flags,...earnedCutFlags(backstage,caseFile)])];
 if(sameSet(combined,state.flags))return state;
 return {...state,flags:combined};
}
export function sceneUnlocked(scene,state){
 return !!scene&&scene.requires.every(flag=>state.flags.includes(flag));
}
export function availableScenes(state){return SCENES.filter(scene=>sceneUnlocked(scene,state));}
export function markSceneViewed(state,sceneId,choiceId){
 const scene=sceneById(sceneId);
 if(!sceneUnlocked(scene,state))throw new Error('This reel is still locked.');
 if(!scene.options.some(o=>o.id===choiceId))throw new Error('Unknown director choice.');
 return {...state,watched:state.watched.includes(sceneId)?state.watched:[...state.watched,sceneId],choices:{...state.choices,[sceneId]:choiceId}};
}
export function readCut(storage){
 try{
  const raw=storage?.getItem(CUT_KEY);
  if(!raw)return cutEmpty();
  if(raw.length>12000)throw new Error('oversized gallery');
  const val=JSON.parse(raw);
  if(val?.version!==CUT_VERSION)throw new Error('version');
  if(!Array.isArray(val.flags)||val.flags.length>validFlags.size||
     new Set(val.flags).size!==val.flags.length||val.flags.some(x=>!validFlags.has(x)))throw new Error('flags');
  if(!Array.isArray(val.watched)||val.watched.length>SCENES.length||
     new Set(val.watched).size!==val.watched.length||val.watched.some(x=>!sceneById(x)))throw new Error('views');
  if(!val.choices||typeof val.choices!=='object'||Array.isArray(val.choices)||Object.keys(val.choices).length>SCENES.length||
     Object.entries(val.choices).some(([id,choice])=>!sceneById(id)?.options.some(x=>x.id===choice)))throw new Error('choices');
  if(val.watched.some(id=>!sceneUnlocked(sceneById(id),val)))throw new Error('unearned scenes');
  if(Object.keys(val.choices).some(id=>!val.watched.includes(id)))throw new Error('unwatched choices');
  return {version:CUT_VERSION,flags:val.flags,watched:val.watched,choices:val.choices};
 }catch{return cutEmpty();}
}
export function saveCut(storage,state){storage?.setItem(CUT_KEY,JSON.stringify(state));}
