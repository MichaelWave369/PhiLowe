import React,{useEffect,useMemo,useState} from 'react';
import {readBackstage} from './backstageGame.js';
import {loadCase} from './case404.js';
import {SCENES,cutEmpty,readCut,saveCut,mergeCutFlags,availableScenes,sceneUnlocked,markSceneViewed} from './directorsCut.js';

const unlockedHints={
 chicken:'Give the rubber chicken to Bix in Backstage Mayhem.',
 encore:'Complete Mabel’s Secret Encore in Backstage Mayhem.',
 listening:'Choose a listening response with three Case 404 witnesses.',
 'false-lead':'Make and correct a false accusation in Case 404.',
 solved:'Solve the mystery of the missing filing cabinet.',
 gallery:'Choose the Gallery of Good Days ending in Case 404.',
 archive:'Choose the Archive of Quiet Joy ending in Case 404.',
 'case-ended':'Finish Case 404, whichever ending you choose.'
};
function fromBrowser(){
 try{
  return mergeCutFlags(readCut(window.localStorage),readBackstage(window.localStorage),loadCase(window.localStorage));
 }catch{return cutEmpty();}
}
function requirement(scene){
 if(!scene.requires.length)return 'OPENING REEL / AVAILABLE NOW';
 if(scene.id==='double-feature')return 'COMPLETE BACKSTAGE MAYHEM + CASE 404';
 return scene.requires.map(x=>unlockedHints[x]||x).join(' ');
}
function Projector({scene,selected,take}){
 const option=scene.options.find(x=>x.id===take);
 return <div className={'director-projection director-projection-'+(selected?'playing':'idle')} aria-live="polite" aria-atomic="true">
   <div className="director-projector-beam" aria-hidden="true"/>
   <div className="director-film-grain" aria-hidden="true">+ · + · + · + · +</div>
   <div className="director-screen-heading"><span>Φ PHILOWE PICTURES</span><span>{scene.genre}</span></div>
   <div className="director-screen-art" aria-hidden="true"><span className="director-screen-figure">{scene.symbol}</span><span className="director-screen-stars">✦ ✧ ✦</span></div>
   <div className="director-screen-dialogue">
     <div className="director-take-number">REEL {String(SCENES.indexOf(scene)+1).padStart(2,'0')} · {option?'THE DIRECTOR’S TAKE':'UNEDITED FOOTAGE'}</div>
     <h3>{scene.title}</h3>
     <p className="director-setting">{scene.setting}</p>
     {scene.lines.map((line,i)=><p className="director-line" key={i}>{line}</p>)}
     {option&&<div className="director-variant">
       {option.lines.map((line,i)=><p key={i}>{line}</p>)}
       <strong>{option.end}</strong>
     </div>}
   </div>
 </div>;
}
export default function DirectorsCut({beep}){
 const [gallery,setGallery]=useState(fromBrowser);
 const [activeId,setActiveId]=useState('cold-open');
 const [take,setTake]=useState(null);
 const [filter,setFilter]=useState('all');
 const [showNotes,setShowNotes]=useState(false);
 const [warning,setWarning]=useState('');
 const [notice,setNotice]=useState('Welcome to the editing room. Choose a reel and direct your own alternate take.');
 const active=SCENES.find(s=>s.id===activeId)||SCENES[0];
 const unlocked=useMemo(()=>availableScenes(gallery),[gallery]);
 const listed=SCENES.filter(scene=>filter==='all'||(filter==='unlocked'?sceneUnlocked(scene,gallery):sceneUnlocked(scene,gallery)&&!gallery.watched.includes(scene.id)));
 useEffect(()=>{
   try{saveCut(window.localStorage,gallery);setWarning('');}
   catch{setWarning('Director’s Cut progress cannot be saved in this browser. Your current session still works.');}
 },[gallery]);
 useEffect(()=>{
   function updateFromGames(){
     try{
       const back=readBackstage(window.localStorage),mystery=loadCase(window.localStorage);
       setGallery(previous=>mergeCutFlags(previous,back,mystery));
     }catch{/* browser storage is optional; all content remains functional */}
   }
   window.addEventListener('philowe-progress',updateFromGames);
   window.addEventListener('storage',updateFromGames);
   return ()=>{
     window.removeEventListener('philowe-progress',updateFromGames);
     window.removeEventListener('storage',updateFromGames);
   };
 },[]);
 useEffect(()=>{
   if(!sceneUnlocked(active,gallery)){setActiveId('cold-open');setTake(null);}
 },[activeId,gallery]);
 function selectScene(scene){
   if(!sceneUnlocked(scene,gallery))return;
   setActiveId(scene.id);
   setTake(null);
   setNotice('REEL LOADED: '+scene.title.toUpperCase()+'. Choose how the scene plays out.');
   beep?.(680,.075);
 }
 function direct(choice){
   try{
     setGallery(old=>markSceneViewed(old,active.id,choice.id));
     setTake(choice.id);
     setNotice('TAKE RECORDED. Replay this reel to try the alternate ending.');
     beep?.(900,.09);
   }catch(error){setNotice(error.message);}
 }
 const watched=gallery.watched.length;
 const total=SCENES.length;
 return <section className="directors-section" id="directors-cut" aria-labelledby="directors-title">
   <div className="wrap">
     <div className="section-heading centered">
       <div className="pixel-rule"><span>07 / THE DIRECTOR'S CUT</span><span className="rule-line"/><span className="rule-end">✦</span></div>
       <p className="superlabel">A SECRET SCREENING ROOM ABOVE THE COMEDY CLUB</p>
       <h2 id="directors-title">ROLL THE<br/><span>OTHER TAKE.</span></h2>
       <p>Nine original extra scenes. Two different versions of every reel. Unlock new footage by playing Backstage Mayhem and Case 404, then revisit your favorites whenever you like.</p>
     </div>
     <div className="director-stats" aria-label="Director's Cut progress">
       <div><span>REELS UNLOCKED</span><strong>{unlocked.length}<small>/{total}</small></strong></div>
       <div><span>REELS DIRECTED</span><strong>{watched}<small>/{total}</small></strong></div>
       <div><span>ALTERNATE TAKES</span><strong>{SCENES.reduce((count,scene)=>count+(gallery.choices[scene.id]?1:0),0)}</strong></div>
     </div>
     <div className="director-room">
       <div className="director-player">
         <div className="director-film-header"><span>Φ DIRECTOR.EXE / NOW SCREENING</span><span>LOCAL SHOWING · NO ADS OR TICKETS</span></div>
         <Projector scene={active} selected={!!take} take={take}/>
         <div className="director-stage-controls">
           <div className="director-stage-title"><span>SELECT THE NEXT BEAT</span><strong>{active.title.toUpperCase()}</strong></div>
           <div className="director-take-buttons">
             {active.options.map((option,i)=><button type="button" key={option.id} className={take===option.id?'selected':''}
                aria-pressed={take===option.id} onClick={()=>direct(option)}>
               <span>TAKE {i+1}</span><strong>{option.label}</strong>
             </button>)}
           </div>
           <p className="director-notice" role="status">{notice}</p>
           <div className="director-commentary">
             <button type="button" aria-expanded={showNotes} onClick={()=>setShowNotes(v=>!v)}>{showNotes?'HIDE DIRECTOR NOTES':'OPEN DIRECTOR NOTES'} ↗</button>
             {showNotes&&<div><p>{active.teaser}</p><p>{requirement(active)}</p><p>The scene changes based on the take you pick. Replay to try the other cut. The text, characters, and props are original.</p></div>}
           </div>
         </div>
       </div>
       <aside className="director-reel-side">
         <div className="director-film-header"><span>THE FILM VAULT</span><span>{watched} VIEWED</span></div>
         <div className="director-reel-filters" role="group" aria-label="Filter the Director's Cut reels">
           {['all','unlocked','unseen'].map(key=><button key={key} type="button" aria-pressed={filter===key} className={filter===key?'selected':''} onClick={()=>setFilter(key)}>{key==='all'?'ALL':key==='unlocked'?'UNLOCKED':'UNWATCHED'}</button>)}
         </div>
         <div className="director-reels">
           {listed.length?listed.map((scene,index)=>{
             const available=sceneUnlocked(scene,gallery),seen=gallery.watched.includes(scene.id);
             return <button type="button" key={scene.id}
               className={'director-reel '+(available?'available':'locked')+(activeId===scene.id?' active':'')}
               onClick={()=>selectScene(scene)} disabled={!available}
               aria-pressed={available&&activeId===scene.id}
               title={available?scene.teaser:requirement(scene)}>
               <span className="director-reel-icon">{available?scene.symbol:'⌑'}</span>
               <span className="director-reel-text"><small>REEL {String(SCENES.indexOf(scene)+1).padStart(2,'0')} · {scene.genre}</small><strong>{available?scene.title:'LOCKED FOOTAGE'}</strong><em>{available?(seen?'✓ DIRECTED · REPLAY ANYTIME':'▶ READY TO SCREEN'):'UNLOCK: '+requirement(scene)}</em></span>
               <span className="director-reel-status">{available?'▸':'🔒'}</span>
             </button>;
           }):<p className="director-empty">Every unlocked reel has a recorded take. The editor has finally caught up with the director.</p>}
         </div>
       </aside>
     </div>
     <div className="director-unlocks">
       <div><span>UNLOCK HINTS · TWO ADVENTURES, ONE UNIVERSE</span><h3>FIND THE DELETED SCENES.</h3></div>
       <div className="director-links"><a href="#backstage">↗ PLAY BACKSTAGE MAYHEM</a><a href="#case404">↗ INVESTIGATE CASE 404</a></div>
     </div>
     {warning&&<p className="director-warning" role="alert">{warning}</p>}
     <p className="director-privacy">Scene unlocks, watched reels, and chosen takes are saved only in this browser. Restarting either adventure does not remove earned footage. No personal notes or letters are read, published, or uploaded. Independent fan tribute with original scenes, not affiliated with Sierra or Al Lowe.</p>
   </div>
 </section>;
}
