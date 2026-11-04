import React,{useEffect,useMemo,useRef,useState} from 'react';
import {JOKES} from './jokes.js';
import {onStage} from './writerRoomStore.js';
import {COMEDIANS,GUEST_COMEDIAN,lineupFor,nextClubAct,comebackFor,crowdLabel} from './comedyClubEngine.js';
import {STAGE_PROPS,BADGES,getProp,duelForAct,answerDuel,earnedBadges,readBadges,writeBadges} from './audienceChaos.js';

const HECKLES=[
  'I HAVE HAD LONGER LAUGHS FROM A LOADING SCREEN!',
  'CAN YOU TURN ON THE SUBTITLES FOR YOUR PERSONALITY?',
  'MY FLOPPY DISK HAS BETTER MATERIAL!',
  'IS THERE AN UNINSTALL BUTTON FOR THIS JOKE?',
  'I WANT A REFUND ON MY IMAGINARY TICKET!',
  'THESE PUNCHLINES NEED A PATCH!'
];
const keep=(n,min,max)=>Math.min(max,Math.max(min,n));

function PixelPerformer({comedian,animated=false}){
  return <div className={'club-performer club-person-'+comedian.color+(animated?' club-dancing':'')} aria-hidden="true">
    <div className="club-person-hair"/>
    <div className="club-person-face"><span className="club-person-eyes">• •</span><span className="club-person-smile">⌣</span></div>
    <div className="club-person-body"><span>{comedian.symbol}</span></div>
    <div className="club-person-legs"><span/><span/></div>
    <div className="club-person-shadow"/>
  </div>;
}

export default function ComedyClub({beep,writerJokes=[]}){
  const staged=useMemo(()=>onStage(writerJokes),[writerJokes]);
  const lineup=useMemo(()=>lineupFor(staged),[staged]);
  const bags=useRef(new Map());
  const turn=useRef(-1);
  const [act,setAct]=useState(null);
  const [phase,setPhase]=useState('closed');
  const [auto,setAuto]=useState(false);
  const [vote,setVote]=useState(null);
  const [laughs,setLaughs]=useState(0);
  const [groans,setGroans]=useState(0);
  const [heckles,setHeckles]=useState(0);
  const [heckleLine,setHeckleLine]=useState('');
  const [comeback,setComeback]=useState('');
  const [history,setHistory]=useState([]);
  const [stageProp,setStageProp]=useState(null);
  const [propUses,setPropUses]=useState(0);
  const [usedProps,setUsedProps]=useState([]);
  const [duelOpen,setDuelOpen]=useState(false);
  const [duelAnswer,setDuelAnswer]=useState(null);
  const [duelWins,setDuelWins]=useState(0);
  const [openMicPlayed,setOpenMicPlayed]=useState(false);
  const [badges,setBadges]=useState(()=>{
    try{return readBadges(window.localStorage);}
    catch{return [];}
  });
  const [eventLog,setEventLog]=useState([]);
  function logEvent(line){setEventLog(old=>[line,...old].slice(0,5));}
  const duel=duelForAct(act);
  const propVisual=stageProp?getProp(stageProp.id):null;
  useEffect(()=>{
    const gained=earnedBadges({
      acts:act?.number||0,props:usedProps,duelWins,laughs,openMicPlayed
    });
    setBadges(old=>{
      const next=gained.filter(id=>!old.includes(id));
      return next.length?[...old,...next]:old;
    });
  },[act?.number,usedProps,duelWins,laughs,openMicPlayed]);
  useEffect(()=>{
    try{writeBadges(window.localStorage,badges);}
    catch{/* badges are optional if storage is blocked */}
  },[badges]);

  function cueNext(){
    const next=nextClubAct(JOKES,staged,bags.current,turn.current);
    if(!next)return;
    turn.current=next.turn;
    setAct(next);
    setPhase('setup');
    setVote(null);
    setHeckleLine('');
    setComeback('');
    setStageProp(null);
    setDuelOpen(false);
    setDuelAnswer(null);
    if(next.comedian.id==='guest')setOpenMicPlayed(true);
    setHistory(old=>[{
      number:next.number,who:next.comedian.name,
      setup:next.joke.setup
    },...old].slice(0,6));
    logEvent('ACT '+next.number+': '+next.comedian.name+' TAKES THE MIC.');
    beep?.(650,.07);
  }
  function dropProp(id){
    if(!act||stageProp)return;
    const prop=getProp(id);
    if(!prop)return;
    setStageProp({id:prop.id,sequence:propUses+1});
    setPropUses(n=>n+1);
    setUsedProps(old=>old.includes(prop.id)?old:[...old,prop.id]);
    logEvent(prop.label+': '+prop.cue);
    beep?.(prop.id==='trapdoor'?230:690,.12);
  }
  function answerHeckler(choice){
    if(!duel||duelAnswer)return;
    const result=answerDuel(duel,choice);
    if(!result)return;
    setDuelAnswer({...result,choice});
    if(result.correct)setDuelWins(n=>n+1);
    logEvent(result.correct?'HECKLER DEFEATED. +100 POINTS.':'HECKLER SURVIVED. TRY AGAIN NEXT ACT.');
    beep?.(result.correct?970:230,.11);
  }
  function reveal(){
    if(!act||phase!=='setup')return;
    setPhase('punchline');
    beep?.(820,.12);
  }
  function react(kind){
    if(phase!=='punchline'||vote)return;
    setVote(kind);
    if(kind==='laugh')setLaughs(n=>n+1);else setGroans(n=>n+1);
    beep?.(kind==='laugh'?980:240,.09);
  }
  function heckle(){
    if(!act)return;
    setHeckleLine(HECKLES[heckles%HECKLES.length]);
    setComeback(comebackFor(act.comedian,heckles));
    setHeckles(n=>n+1);
    beep?.(315,.09);
  }
  useEffect(()=>{
    if(!act?.joke.id.startsWith('CW-'))return;
    if(!staged.some(j=>j.id===act.joke.id)){
      setAct(null);
      setPhase('closed');
      setAuto(false);
    }
  },[staged,act?.joke.id]);

  // Explicitly opt-in: no autoplay until a visitor chooses it.
  useEffect(()=>{
    if(!auto||!act)return undefined;
    const ms=phase==='setup'?4800:phase==='punchline'?6400:null;
    if(ms===null)return undefined;
    const timer=window.setTimeout(()=>{
      if(phase==='setup')setPhase('punchline');
      else cueNext();
    },ms);
    return ()=>window.clearTimeout(timer);
  },[auto,phase,act?.number]);

  function toggleAutoplay(){
    if(!auto&&!act)cueNext();
    setAuto(v=>!v);
  }
  function handleKeys(e){
    if(e.target!==e.currentTarget||e.altKey||e.ctrlKey||e.metaKey)return;
    const key=e.key.toLowerCase();
    if(key==='n'){e.preventDefault();cueNext();}
    if(key==='r'&&phase==='setup'){e.preventDefault();reveal();}
    if(key==='h'&&act){e.preventDefault();heckle();}
    if(key==='p'&&act){e.preventDefault();dropProp('chicken');}
    if(key==='d'&&act){e.preventDefault();setDuelOpen(true);}
  }
  const applause=keep(50+(laughs-groans)*9,0,100);
  const active=act?.comedian;
  return <section className="club-section" id="comedy-club" aria-labelledby="club-title" tabIndex={0} onKeyDown={handleKeys}>
    <div className="wrap">
      <div className="section-heading centered club-heading">
        <div className="pixel-rule"><span>04 / PHILOWE COMEDY CLUB</span><span className="rule-line"/><span className="rule-end">✦</span></div>
        <p className="superlabel">THE LAUGH LOUNGE PRESENTS · OPEN UNTIL THE PIXELS GO HOME</p>
        <h2 id="club-title">TONIGHT'S<br/><span>VERY QUESTIONABLE LINEUP.</span></h2>
        <p>Four original pixel comedians, a rotating microphone, and your own jokes on open-mic night. Each act has a distinct personality, fresh material, and absolutely no understanding of heckler management.</p>
      </div>
      <div className="club-layout">
        <div className="club-venue">
          <div className="club-housebar"><span><i className="club-live-dot"/> LIVE-ISH · PHILOWE THEATER</span><span>{act?'ACT '+String(act.number).padStart(3,'0'):'DOORS OPEN'}</span></div>
          <div className={'club-scene '+(active?'club-scene-'+active.color:'')}>
            <div className="club-stars" aria-hidden="true">✦ · ✧ · ✦ · ✧ · ✦</div>
            <div className="club-neon">THE LAUGH LOUNGE <span>★</span></div>
            <div className="club-curtain club-curtain-left" aria-hidden="true"/>
            <div className="club-curtain club-curtain-right" aria-hidden="true"/>
            <div className="club-spot" aria-hidden="true"/>
            {active?<PixelPerformer comedian={active} animated={phase==='punchline'}/>:<div className="club-idle">
              <strong>TONIGHT: 4 ACTS + OPEN MIC</strong>
              <span>INSERT LAUGHTER TO BEGIN</span>
              <span className="club-idle-glyph" aria-hidden="true">♫</span>
            </div>}
            {propVisual&&<div key={stageProp.sequence} className={'club-chaos-effect '+propVisual.className} aria-hidden="true">
              <span>{propVisual.symbol}</span>
              {propVisual.id==='confetti'&&<div className="club-confetti-pieces">✦ ✧ ✦ ✧ ✦ ✧ ✦</div>}
            </div>}
            <div className="club-stagefloor" aria-hidden="true"/>
            <div className="club-micstand" aria-hidden="true"><span/></div>
            <div className={'club-crowd '+(phase==='punchline'?'club-crowd-active':'')} aria-hidden="true">
              {Array.from({length:11},(_,i)=><span key={i} style={{'--seat':i%5}}>●<i/></span>)}
            </div>
            <div className="club-scene-caption">NO REFUNDS · NO COPYRIGHTED CHARACTERS · NO SENSIBLE LIFE CHOICES</div>
          </div>
          <div className="club-spotlight-copy" aria-live="polite" aria-atomic="true">
            <div className="club-speaker"><span>{active?active.name:'THE HOUSE EMCEE'}</span><span>{active?active.title:'Welcome to comedy night.'}</span></div>
            {act?<div className="club-speech">
              <p className="club-intro">{act.intro}</p>
              <h3>{act.joke.setup}</h3>
              {phase==='punchline'?<p className="club-punchline">{act.joke.punchline}</p>:<p className="club-unrevealed">[ HOLD FOR THE PUNCHLINE ... ]</p>}
            </div>:<div className="club-speech"><h3>Welcome to PhiLowe after dark.</h3><p>Start the show to meet the cast. Press Reveal when the setup has had enough time to embarrass itself.</p></div>}
            {heckleLine&&<div className="club-heckle-dialog"><span>AUDIENCE: {heckleLine}</span><strong>{active?.name}: {comeback}</strong></div>}
            {propVisual&&<div className="club-prop-cue" role="status"><strong>BACKSTAGE INCIDENT:</strong> {propVisual.cue}</div>}
          </div>
          <div className="club-console">
            <div className="club-controls">
              <button type="button" className="club-main-button" onClick={cueNext}>{act?'▶ NEXT COMEDIAN':'▶ START THE SHOW'}</button>
              <button type="button" onClick={reveal} disabled={!act||phase!=='setup'}>✦ REVEAL PUNCHLINE</button>
              <button type="button" onClick={toggleAutoplay} className={auto?'club-auto-on':''} aria-pressed={auto}>{auto?'■ STOP AUTO SHOW':'▷ AUTO SHOW: OFF'}</button>
            </div>
            <div className="club-reactions">
              <button type="button" onClick={()=>react('laugh')} disabled={phase!=='punchline'||!!vote} className={vote==='laugh'?'selected':''}>☺ APPLAUD</button>
              <button type="button" onClick={()=>react('groan')} disabled={phase!=='punchline'||!!vote} className={vote==='groan'?'selected':''}>☹ GROAN</button>
              <button type="button" onClick={heckle} disabled={!act}>📣 HECKLE</button>
            </div>
            <div className="club-prop-rack" role="group" aria-label="Stage prop effects">
              <div className="club-extra-heading"><span>PROP CLOSET / PHYSICAL COMEDY</span><small>{stageProp?'ONE PROP PER ACT. THE INSURANCE COMPANY INSISTS.':'CHOOSE ONE PROP FOR THIS ACT'}</small></div>
              <div className="club-prop-buttons">
                {STAGE_PROPS.map(prop=><button key={prop.id} type="button"
                  aria-label={'Trigger '+prop.label.toLowerCase()}
                  disabled={!act||!!stageProp} onClick={()=>dropProp(prop.id)}>
                  <span aria-hidden="true">{prop.symbol}</span><strong>{prop.label}</strong>
                </button>)}
              </div>
            </div>
            <div className="club-duel-box">
              <div className="club-duel-heading">
                <div><span>HECKLER'S CHALLENGE</span><small>Choose the best comeback. One attempt per act, 100 points for a win.</small></div>
                <button type="button" disabled={!act} aria-expanded={duelOpen}
                  onClick={()=>setDuelOpen(v=>!v)}>{duelOpen?'CLOSE DUEL':'OPEN HECKLER DUEL'}</button>
              </div>
              {duelOpen&&duel&&<div className="club-duel-play">
                <p className="club-duel-question">{duel.prompt}</p>
                <div className="club-duel-choices">{duel.choices.map((answer,i)=><button type="button" key={i} disabled={!!duelAnswer}
                  className={duelAnswer?.choice===i?(duelAnswer.correct?'right':'wrong'):''}
                  onClick={()=>answerHeckler(i)}><span>{String(i+1).padStart(2,'0')}</span>{answer}</button>)}</div>
                {duelAnswer&&<p className={'club-duel-result '+(duelAnswer.correct?'win':'loss')} role="status">
                  {duelAnswer.text} {duelAnswer.correct?'(+100 POINTS)':'(NO POINTS)'}
                </p>}
              </div>}
            </div>
            <p className="club-keyhint">FOCUS STAGE THEN: <kbd>N</kbd> NEXT ACT · <kbd>R</kbd> REVEAL · <kbd>H</kbd> HECKLE · <kbd>P</kbd> CHICKEN · <kbd>D</kbd> DUEL. AUTO SHOW IS OFF BY DEFAULT.</p>
          </div>
        </div>
        <aside className="club-side">
          <div className="club-sideheader">TONIGHT'S CAST <span>{lineup.length} PERFORMERS</span></div>
          <div className="club-roster">
            {lineup.map((comedian,index)=><div key={comedian.id} className={'club-roster-card '+(active?.id===comedian.id?'playing':'')}>
              <div className={'club-roster-avatar club-avatar-'+comedian.color} aria-hidden="true">{comedian.symbol}</div>
              <div><span>{String(index+1).padStart(2,'0')} / {comedian.id==='guest'?'OPEN MIC':'HOUSE ACT'}</span><strong>{comedian.name}</strong><small>{comedian.title}</small></div>
              {active?.id===comedian.id&&<span className="club-roster-indicator">ON AIR</span>}
            </div>)}
          </div>
          <div className="club-audience-stats">
            <div className="club-stats-heading">LOCAL AUDIENCE SCOREBOARD</div>
            <div className="club-statrow"><span>APPLAUSE</span><strong>{laughs}</strong><span>GROANS</span><strong>{groans}</strong></div>
            <div className="club-meter" role="progressbar" aria-label="Audience approval" aria-valuemin={0} aria-valuemax={100} aria-valuenow={applause}><div style={{width:applause+'%'}}/></div>
            <p>{crowdLabel(laughs,groans)}</p>
            <small>HECKLES THROWN: {heckles} · PROPS FIRED: {propUses} · DUELS WON: {duelWins} · Session scores reset on reload.</small>
          </div>
          <div className="club-badges">
            <div className="club-stats-heading">TROPHY CABINET <span>{badges.length}/{BADGES.length}</span></div>
            <p>Earn these in the show. Unlocked trophies stay on this browser.</p>
            <div className="club-badge-grid">{BADGES.map(b=><div key={b.id} className={'club-badge '+(badges.includes(b.id)?'unlocked':'locked')}
              title={b.description} aria-label={b.name+': '+(badges.includes(b.id)?'unlocked':'locked')+'. '+b.description}>
              <span aria-hidden="true">{b.symbol}</span><strong>{b.name}</strong><small>{b.description}</small>
            </div>)}</div>
          </div>
          <div className="club-billboard">
            <span>OPEN MIC NIGHT</span>
            <strong>{staged.length} CUSTOM JOKE{staged.length===1?'':'S'} READY</strong>
            <p>Mark a joke <b>On Stage</b> in your Writer Room. The guest performer will pick it up on the next rotation, right here on your device.</p>
            <a href="#writers-room">↗ WRITE FOR THE STAGE</a>
          </div>
        </aside>
      </div>
      <div className="club-aftershow">
        <div><span>LAST SIX APPEARANCES</span><h3>THE SHOW LOG</h3></div>
        <div className="club-history">
          {history.length?history.map(item=><div key={item.number}><span>ACT {String(item.number).padStart(3,'0')}</span><strong>{item.who}</strong><p>{item.setup}</p></div>):<p className="club-history-empty">The club is quiet. Suspiciously quiet. There must be a punchline somewhere.</p>}
        </div>
      </div>
      <div className="club-incident-log" aria-live="polite">
        <strong>BACKSTAGE INCIDENT REPORT</strong>
        {eventLog.length?<ol>{eventLog.map((line,index)=><li key={index}>{line}</li>)}</ol>:<p>No accidents have been reported. The management is concerned.</p>}
      </div>
      <p className="club-disclaimer">This is an original, single-player simulated comedy show, not a livestream or multiplayer room. The cast, heckles and applause are fictional; your real reactions and Writer Room material remain on this device. Independent fan tribute, not affiliated with or endorsed by Al Lowe.</p>
    </div>
  </section>;
}
