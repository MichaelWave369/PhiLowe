import React,{useEffect,useMemo,useState} from 'react';
import {
  CASE_ROOMS,CASE_CLUES,CASE_ENDINGS,newCase,caseActions,caseStep,loadCase,saveCase
} from './case404.js';
const CASE_HINTS={
  hall:'Start by inspecting the wheel tracks. Real mysteries leave physical evidence, even when the suspects are furniture.',
  office:'Find Form 404-C and question Mabel. The transfer form contains the passage code.',
  props:'Inspect the hinge. You need the hall tracks and office form before you can find the secret door; then key in 404.',
  dressing:'The mirror contains a personal clue. Interview Vera to understand why the letters matter.',
  booth:'Inspect the overnight recording and question DJ Parallax about the mysterious voice.',
  secret:'Read the cabinet’s letter, question at least three witnesses, then choose your conclusion and one of two endings.'
};
function restore(){try{return loadCase(window.localStorage);}catch{return newCase();}}
function Scene({room,foundDoor,doorOpen,solved}){
 return <div className={'case-scene case-scene-'+room.tone} aria-hidden="true">
    <div className="case-ceiling"><i/><i/><i/></div>
    <div className="case-window"><span>CASE 404</span><i>▓ ░ ▓ ░ ▓</i></div>
    <div className="case-spotlight"/>
    <div className="case-cabinet">
      <div className="case-cabinet-top">PHILOWE RECORDS</div>
      <div className="case-cabinet-drawers">
        {[0,1,2].map(n=><div key={n}><span>{room.id==='secret'?(solved?'JOY':'404'):'CONFIDENTIAL'}</span><i/></div>)}
      </div>
      <div className="case-cabinet-wheels"><i/><i/><i/><i/></div>
    </div>
    <div className="case-door"><div className="case-door-number">{room.id==='props'?(doorOpen?'OPEN':foundDoor?'404':'???'):room.symbol}</div><span>{room.name.toUpperCase()}</span></div>
    <div className="case-floor"><span>THE CASE OF THE CABINET THAT WALKED AWAY</span></div>
  </div>;
}
export default function Case404({beep}){
 const [game,setGame]=useState(restore);
 const [message,setMessage]=useState('CASE OPEN: Mabel’s master filing cabinet has vanished. Start with the hall tracks. The cast appears suspiciously eager to blame each other.');
 const [witness,setWitness]=useState(null);
 const [hint,setHint]=useState(false);
 const [resetArmed,setResetArmed]=useState(false);
 const [storageWarning,setStorageWarning]=useState('');
 const [boardOpen,setBoardOpen]=useState(true);
 const current=useMemo(()=>CASE_ROOMS.find(r=>r.id===game.room)||CASE_ROOMS[0],[game.room]);
 const choices=caseActions(game);
 const discovered=CASE_CLUES.filter(c=>game.clues.includes(c.id));
 const interviews=Object.keys(game.interviews).length;
 const ending=CASE_ENDINGS.find(e=>e.id===game.ending);
 useEffect(()=>{
  try{saveCase(window.localStorage,game);setStorageWarning('');}
  catch{setStorageWarning('Browser storage is blocked. Case progress may not survive a refresh.');}
 },[game]);
 function act(action){
  const result=caseStep(game,action);
  setGame(result.state);setMessage(result.message);
  setWitness(result.witness||null);setResetArmed(false);
  beep?.(action.startsWith('key:')?850:action.startsWith('inspect:')?900:640,.06);
 }
 function reset(){
  if(!resetArmed){setResetArmed(true);setMessage('CONFIRM NEW CASE to erase this investigation. The other Backstage adventure will not be affected.');return;}
  setGame(newCase());setMessage('CASE REOPENED. Mabel has already prepared an entirely new pile of paperwork.');
  setResetArmed(false);setWitness(null);setHint(false);
 }
 return <section className="case404-section" id="case404" aria-labelledby="case404-title">
  <div className="wrap">
   <div className="section-heading centered">
    <div className="pixel-rule"><span>06 / THE BACKSTAGE MYSTERY</span><span className="rule-line"/><span className="rule-end">✦</span></div>
    <p className="superlabel">AN ORIGINAL COMEDY DETECTIVE ADVENTURE</p>
    <h2 id="case404-title">CASE 404.<br/><span>CABINET NOT FOUND.</span></h2>
    <p>One missing filing cabinet, four unreliable witnesses, six clues, a hidden passage, and a mystery that goes deeper than administrative negligence. Start anytime. Your original Backstage Mayhem progress stays separate.</p>
   </div>
   <div className="case404-frame">
    <div className="case404-top">
     <span><i/> PRIVATE INVESTIGATION / FILE NO. 404</span>
     <span>{discovered.length}/6 CLUES · {interviews}/4 INTERVIEWS</span>
     <span>{game.ending?'CASE CLOSED':game.solved?'AWAITING FINALE':'CASE OPEN'}</span>
    </div>
    <div className="case404-layout">
     <div className="case404-main">
      <Scene room={current} foundDoor={game.foundDoor} doorOpen={game.doorOpen} solved={game.solved}/>
      <div className="case404-narrator" aria-live="polite" aria-atomic="true"><span>DETECTIVE'S OBSERVATIONS</span><p>{message}</p></div>
      <div className="case404-room-label"><div><span>CURRENT LOCATION</span><h3>{current.name}</h3><p>{current.description}</p></div><span className="case404-room-symbol">{current.symbol}</span></div>
      {witness&&<div className="case404-interview" aria-label={'Question '+witness.name}>
       <div className="case404-interview-head"><span>WITNESS STATEMENT / {witness.name}</span></div>
       <p>{witness.intro}</p>
       <div className="case404-dialogue-choices">
        {witness.choices.map(choice=><button key={choice.id} type="button" onClick={()=>act('answer:'+witness.id+'/'+choice.id)}>▸ {choice.label}</button>)}
       </div>
      </div>}
      <div className="case404-actions">
       <div className="case404-panel-title">POINT & CLICK INVESTIGATION <span>{choices.length} POSSIBLE ACTIONS</span></div>
       <div className="case404-action-grid">
        {choices.length?choices.map(c=><button key={c.id} type="button" disabled={!!witness} onClick={()=>act(c.id)} className={c.id.startsWith('end:')?'case404-finale-btn':c.id.startsWith('key:')?'case404-key-btn':''}>▸ {c.label}</button>)
        :<p>{game.ending?'The evidence has spoken. Your final report is sealed.':'No other actions here. Check another location or the clue board.'}</p>}
       </div>
       {game.foundDoor&&!game.doorOpen&&<div className="case404-code">LOCK CODE <span>{game.digits.join(' ')||'_'}</span> / 3 DIGITS · ATTEMPTS RESET ON WRONG DIGIT</div>}
      </div>
     </div>
     <aside className="case404-side">
      <div className="case404-panel-title">INVESTIGATION MAP <span>{game.visits.length}/6 VISITED</span></div>
      <div className="case404-map">
       {CASE_ROOMS.map(r=><button type="button" key={r.id} className={(game.room===r.id?'selected ':'')+(r.id==='secret'&&!game.doorOpen?'locked':'')}
         aria-pressed={game.room===r.id} onClick={()=>act('go:'+r.id)} disabled={!!witness}>
         <span className="case404-map-symbol">{r.symbol}</span><span><strong>{r.name}</strong><small>{game.visits.includes(r.id)?'VISITED':r.id==='secret'&&!game.doorOpen?'SECRET ROOM LOCKED':'UNEXPLORED'}</small></span><span>{game.room===r.id?'◉':'↗'}</span>
       </button>)}
      </div>
      <div className="case404-panel-title">EVIDENCE BOARD <span>{discovered.length}/6</span></div>
      <div className="case404-evidence">
       <button type="button" onClick={()=>setBoardOpen(x=>!x)} aria-expanded={boardOpen}>{boardOpen?'CLOSE CLUE BOARD':'OPEN CLUE BOARD'}</button>
       {boardOpen&&CASE_CLUES.map(clue=><article key={clue.id} className={game.clues.includes(clue.id)?'found':'unfound'}>
        <span>{game.clues.includes(clue.id)?'✓':'?'}</span><div>
         <strong>{game.clues.includes(clue.id)?clue.title:'UNKNOWN EVIDENCE'}</strong>
         <p>{game.clues.includes(clue.id)?clue.text:'Inspect the scene to uncover the truth.'}</p>
        </div>
       </article>)}
      </div>
      <div className="case404-panel-title">WITNESS BOARD <span>{interviews}/4</span></div>
      <div className="case404-witnesses">
       {['mabel','bix','vera','dj'].map(id=><div key={id} className={game.interviews[id]?'interviewed':''}>
         <span>{game.interviews[id]?'✓':'○'}</span><strong>{id.toUpperCase()}</strong>
         <small>{game.interviews[id]==='listen'?'TRUSTED CONVERSATION':game.interviews[id]==='press'?'PRESSURED':'NOT YET QUESTIONED'}</small>
       </div>)}
      </div>
      <div className="case404-helpbox">
       <button type="button" onClick={()=>setHint(v=>!v)} aria-expanded={hint}>{hint?'HIDE CASE HINT':'? NEED A DETECTIVE HINT?'}</button>
       {hint&&<p role="status">{CASE_HINTS[game.room]}</p>}
       <button type="button" className={resetArmed?'armed':''} onClick={reset}>{resetArmed?'CONFIRM NEW CASE':'↻ OPEN A NEW CASE'}</button>
       {resetArmed&&<button type="button" onClick={()=>setResetArmed(false)}>CANCEL</button>}
      </div>
     </aside>
    </div>
   </div>
   {game.ending&&<div className="case404-conclusion" role="status">
    <div className="case404-final-seal">404</div><div><span>CASE CLOSED · ONE VERY STRANGE SORTING ERROR</span><h3>{ending.title}</h3>
     <p>{ending.text}</p><p>False leads: {game.falseLeads}. Incorrect keypad entries: {game.errors}. Witnesses heard: {interviews}/4. Sometimes protecting something good matters more than knowing who to blame.</p></div>
   </div>}
   {storageWarning&&<p role="alert" className="case404-warning">{storageWarning}</p>}
   <p className="case404-credits">CASE 404 is a standalone, original, fictional detective story. No real letters or personal information are shown. Case choices and clues are saved only in your browser; clearing site data resets them. Independent tribute, no affiliation with Sierra or Al Lowe.</p>
  </div>
 </section>;
}
