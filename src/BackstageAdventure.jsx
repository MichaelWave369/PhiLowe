import React,{useEffect,useMemo,useState} from 'react';
import {
 BACKSTAGE_KEY,ROOMS,NOTES,LIGHT_ORDER,freshBackstage,tasks,inventory,
 availableActions,playBackstage,readBackstage,saveBackstage
} from './backstageGame.js';

const firstText='A red emergency bulb flashes. Mabel has left a note: "Report to my office before attempting anything remotely enjoyable."';
const HELPS={
 hall:'Look behind the vending machine for a coin and read the exit poster for the lighting clue.',
 office:'Talk to Mabel, sign Form LOL-404, then return with a repaired microphone and correct booth cue.',
 props:'The microphone needs a battery. The dispenser wants the coin from the hallway.',
 dressing:'Bix and Vera have helpful dialogue. The chicken detour is optional, but management will never understand.',
 booth:'Set the lights GOLD → PINK → CYAN. A wrong press resets the sequence.',
 stage:'Collect the final scrapbook note, then perform the secret encore.'
};
function loadGame(){
 try{return readBackstage(window.localStorage);}
 catch{return freshBackstage();}
}
function Scene({room,complete,lights}){
 return <div className={'backstage-scene backstage-theme-'+room.theme} aria-hidden="true">
   <div className="backstage-ceiling"><i/><i/><i/></div>
   <div className="backstage-wall">
    <span className="backstage-wall-poster">{room.id==='booth'?'GOLD · PINK · CYAN':room.id==='office'?'LOL-404':room.id==='stage'?'ENCORE':'NO REFUNDS'}</span>
    <span className="backstage-wall-lamp">✦</span>
    <div className="backstage-arch"><div className="backstage-arch-glyph">{complete&&room.id==='stage'?'☺':room.icon}</div>
     <div className="backstage-arch-caption">{room.name}</div></div>
    <div className="backstage-scene-object">{room.id==='booth'?LIGHT_ORDER.map((c,i)=><span className={lights.includes(c)?'lit '+c:c} key={c}>●</span>):room.id==='office'?'▣':room.id==='props'?'♫':room.id==='dressing'?'♥':room.id==='stage'?'★':'▤'}</div>
   </div>
   <div className="backstage-floor"><i/><i/><i/><i/><i/></div>
   <div className="backstage-avatar"><div className="backstage-avatar-head"><span>• •</span><i>⌣</i></div><div className="backstage-avatar-body">Φ</div><div className="backstage-avatar-legs"><i/><i/></div></div>
   <div className="backstage-scene-status">6 ROOMS · NO SENSIBLE EXIT · ORIGINAL PIXEL STAGE</div>
 </div>;
}
export default function BackstageAdventure({beep}){
 const [game,setGame]=useState(loadGame);
 const [message,setMessage]=useState(firstText);
 const [helpOpen,setHelpOpen]=useState(false);
 const [resetArmed,setResetArmed]=useState(false);
 const [storageWarning,setStorageWarning]=useState('');
 const [scrapbookOpen,setScrapbookOpen]=useState(false);
 const room=useMemo(()=>ROOMS.find(r=>r.id===game.room)||ROOMS[0],[game.room]);
 const note=NOTES.find(n=>n.room===game.room&&!game.notes.includes(n.id));
 const completed=tasks(game).filter(x=>x.done).length;
 const actionList=availableActions(game);
 useEffect(()=>{
   try{saveBackstage(window.localStorage,game);setStorageWarning('');window.dispatchEvent(new Event('philowe-progress'));}
   catch{setStorageWarning('Browser storage is unavailable. This adventure may not survive a reload.');}
 },[game]);
 function perform(id){
   const result=playBackstage(game,id);
   setGame(result.state);
   setMessage(result.message);
   setHelpOpen(false);setResetArmed(false);
   beep?.(id.startsWith('press:')?840:id.startsWith('collect:')?930:600,.06);
 }
 function reset(){
   if(!resetArmed){setResetArmed(true);setMessage('CONFIRM RESTART to clear this browser’s adventure save and collectibles.');return;}
   setGame(freshBackstage());setMessage('New adventure started. Mabel has already ordered fresh paperwork.');
   setHelpOpen(false);setScrapbookOpen(false);setResetArmed(false);
 }
 return <section className="backstage-section" id="backstage" aria-labelledby="backstage-title">
   <div className="wrap">
    <div className="section-heading centered">
      <div className="pixel-rule"><span>05 / PHILOWE BACKSTAGE MAYHEM</span><span className="rule-line"/><span className="rule-end">✦</span></div>
      <p className="superlabel">POINT · CLICK · GET BURIED IN PAPERWORK</p>
      <h2 id="backstage-title">THE SHOW<br/><span>BEHIND THE SHOW.</span></h2>
      <p>Six original rooms, a ridiculous quest from Mabel, a real little lighting puzzle, and six hidden comic notes. Your adventure saves locally so you can return between catastrophes.</p>
    </div>
    <div className="backstage-topbar">
      <span>BACKSTAGE.EXE / SAVE SLOT 01</span>
      <span className="backstage-save-light">● LOCAL SAVE</span>
      <span>{completed}/4 CHECKLIST COMPLETE</span>
    </div>
    <div className="backstage-grid">
      <div className="backstage-main">
        <div className="backstage-room-top"><span>{room.name.toUpperCase()}</span><span>{game.visits.length}/6 ROOMS DISCOVERED</span></div>
        <Scene room={room} complete={game.completed} lights={game.lights}/>
        <div className="backstage-narrator" aria-live="polite" aria-atomic="true">
          <span className="backstage-narrator-label">NARRATOR / QUEST FEED</span>
          <p>{message}</p>
        </div>
        <div className="backstage-room-info">
          <div><span>YOU ARE HERE</span><h3>{room.name}</h3><p>{room.description}</p></div>
          <div className="backstage-npc"><span>LOCAL NPC</span><strong>{room.npc}</strong></div>
        </div>
        <div className="backstage-actions">
          <div className="backstage-sectionbar">ROOM ACTIONS <span>{actionList.length} AVAILABLE</span></div>
          <div className="backstage-buttons">
            {actionList.length?actionList.map(a=><button key={a.id} type="button" onClick={()=>perform(a.id)}>▸ {a.label}</button>):<p>No more actions required here. Try another room or admire the questionable décor.</p>}
          </div>
          {note&&<button type="button" className="backstage-secret" onClick={()=>perform('collect:'+note.id)}>✦ FOUND SOMETHING ODD: COLLECT HIDDEN JOKE NOTE</button>}
        </div>
      </div>
      <aside className="backstage-sidebar">
        <div className="backstage-panel">
          <div className="backstage-sectionbar">BACKSTAGE MAP <span>SELECT A ROOM</span></div>
          <div className="backstage-map">
            {ROOMS.map(r=><button key={r.id} type="button" className={(room.id===r.id?'selected ':'')+(r.id==='stage'&&!game.pass?'locked':'')} aria-pressed={room.id===r.id}
              onClick={()=>perform('go:'+r.id)}><span className="backstage-map-glyph">{r.icon}</span><span><strong>{r.name}</strong><small>{game.visits.includes(r.id)?'DISCOVERED':r.id==='stage'&&!game.pass?'STAGE PASS REQUIRED':'UNEXPLORED'}</small></span><span>{room.id===r.id?'◉':'↗'}</span></button>)}
          </div>
        </div>
        <div className="backstage-panel">
          <div className="backstage-sectionbar">MABEL'S CHECKLIST <span>{completed}/4</span></div>
          <div className="backstage-checklist">{tasks(game).map((task,i)=><div className={task.done?'done':''} key={task.name}><span>{task.done?'☑':'☐'}</span><span>{String(i+1).padStart(2,'0')} · {task.name}</span></div>)}</div>
        </div>
        <div className="backstage-panel">
          <div className="backstage-sectionbar">YOUR INVENTORY <span>{inventory(game).length} ITEMS</span></div>
          <div className="backstage-inventory">{inventory(game).length?inventory(game).map(x=><span key={x}>◆ {x}</span>):<p>Empty pockets. Immense potential for trouble.</p>}</div>
        </div>
        <div className="backstage-panel backstage-scrapbook">
          <div className="backstage-sectionbar">HIDDEN JOKE SCRAPBOOK <span>{game.notes.length}/6</span></div>
          <button type="button" onClick={()=>setScrapbookOpen(x=>!x)} aria-expanded={scrapbookOpen}>{scrapbookOpen?'HIDE THE SCRAPBOOK':'OPEN THE SCRAPBOOK'} ↗</button>
          {scrapbookOpen&&<div className="backstage-notes">{NOTES.map(n=><article key={n.id} className={game.notes.includes(n.id)?'collected':'unknown'}>
            <strong>{game.notes.includes(n.id)?n.title:'??? UNDISCOVERED NOTE'}</strong>
            <p>{game.notes.includes(n.id)?n.text:'Explore the rooms and look for unusual clues.'}</p>
          </article>)}</div>}
        </div>
        <div className="backstage-help">
          <button type="button" onClick={()=>setHelpOpen(x=>!x)} aria-expanded={helpOpen}>{helpOpen?'HIDE HINT':'? NEED A CLUE?'}</button>
          {helpOpen&&<p role="status">{HELPS[game.room]}</p>}
          <button type="button" className={resetArmed?'backstage-confirm-reset':''} onClick={reset}>{resetArmed?'CONFIRM RESTART':'↻ RESTART ADVENTURE'}</button>
          {resetArmed&&<button type="button" onClick={()=>setResetArmed(false)}>CANCEL RESTART</button>}
        </div>
      </aside>
    </div>
    {storageWarning&&<p className="backstage-storage-warning" role="alert">{storageWarning}</p>}
    {game.completed&&<div className="backstage-victory" role="status">
      <span className="backstage-victory-seal">★</span><div><span>THE END · OR ANOTHER BEGINNING</span><h3>THE LAUGH WAS THE QUEST.</h3><p>All paperwork approved, all comedians rescued, and one final laugh delivered. You found {game.notes.length} of six collectible jokes. Mabel, for once, files a report under JOY.</p></div>
      <button type="button" onClick={reset}> {resetArmed?'CONFIRM RESTART':'PLAY AGAIN'} </button>
    </div>}
    <p className="backstage-disclaimer">Independent fan tribute. Original characters, rooms, puzzles, and jokes. Progress is saved only in your browser; clearing site data resets it. No uploads, registration, or external game servers.</p>
   </div>
 </section>;
}
