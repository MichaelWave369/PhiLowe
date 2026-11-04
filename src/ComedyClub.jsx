import React,{useEffect,useMemo,useRef,useState} from 'react';
import {JOKES} from './jokes.js';
import {onStage} from './writerRoomStore.js';
import {COMEDIANS,GUEST_COMEDIAN,lineupFor,nextClubAct,comebackFor,crowdLabel} from './comedyClubEngine.js';
import {STAGE_PROPS,BADGES,getProp,duelForAct,answerDuel,earnedBadges,readBadges,writeBadges} from './audienceChaos.js';
import {LANES,MAX_THROWS_PER_ACT,MANAGER,nextTomato,resolveTomato,incidentReport,trimReports,readReports,writeReports,serializeReportArchive} from './tomatoNight.js';

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
  const [tomato,setTomato]=useState(null);
  const [tomatoResult,setTomatoResult]=useState(null);
  const [tomatoAttempts,setTomatoAttempts]=useState(0);
  const [tomatoDodges,setTomatoDodges]=useState(0);
  const [tomatoSplats,setTomatoSplats]=useState(0);
  const [reports,setReports]=useState(()=>{
    try{return readReports(window.localStorage);}
    catch{return [];}
  });
  const [clearArmed,setClearArmed]=useState(false);
  const [reportStatus,setReportStatus]=useState('Incident reports are stored locally, not submitted to any bureaucracy.');
  useEffect(()=>{
    try{writeReports(window.localStorage,reports);}
    catch{setReportStatus('Local storage is unavailable. Export the report archive before leaving the page.');}
  },[reports]);
  function tossTomato(){
    if(!act||(tomato&&!tomatoResult)||tomatoAttempts>=MAX_THROWS_PER_ACT)return;
    const next=nextTomato(act.number,tomatoAttempts);
    if(!next)return;
    setTomato(next);
    setTomatoResult(null);
    setTomatoAttempts(n=>n+1);
    logEvent('AUDIENCE TOSSES A TOMATO! TARGET: '+next.lane+'.');
    beep?.(450,.08);
  }
  function chooseDodge(lane){
    if(!tomato||tomatoResult)return;
    const resolution=resolveTomato(tomato,lane);
    if(!resolution)return;
    setTomatoResult(resolution);
    if(resolution.dodged)setTomatoDodges(n=>n+1);
    else setTomatoSplats(n=>n+1);
    const report=incidentReport(tomato,resolution,act.comedian);
    if(report)setReports(old=>trimReports([report,...old]));
    setClearArmed(false);
    setReportStatus(resolution.outcome+': '+resolution.text);
    logEvent('TOMATO '+resolution.outcome+': '+act.comedian.name+'.');
    beep?.(resolution.dodged?880:250,.12);
  }
  function exportReports(){
    try{
      const blob=new Blob([serializeReportArchive(reports)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');
      anchor.href=url;anchor.download='philowe-mabel-incident-reports.json';
      document.body.appendChild(anchor);anchor.click();anchor.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1500);
      setReportStatus('Report archive exported. Mabel wants three printed copies.');
    }catch{setReportStatus('Export failed. The bureaucracy is temporarily unavailable.');}
  }
  function clearReports(){
    if(!clearArmed){setClearArmed(true);setReportStatus('Click CONFIRM CLEAR to erase saved incident reports.');return;}
    setReports([]);setClearArmed(false);setReportStatus('Incident reports cleared from this browser.');
  }
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
    setTomato(null);
    setTomatoResult(null);
    setTomatoAttempts(0);
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
    if(key==='t'&&act){e.preventDefault();tossTomato();}
  }
  const applause=keep(50+(laughs-groans)*9,0,100);
  const active=act?.comedian;
  const dodgeClass=tomatoResult?.dodged?' club-dodged-'+tomatoResult.dodgeLane.toLowerCase():tomatoResult?' club-tomato-splat':'';
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
            {active?<div className={'club-actor-placement'+dodgeClass}><PixelPerformer comedian={active} animated={phase==='punchline'}/></div>:<div className="club-idle">
              <strong>TONIGHT: 4 ACTS + OPEN MIC</strong>
              <span>INSERT LAUGHTER TO BEGIN</span>
              <span className="club-idle-glyph" aria-hidden="true">♫</span>
            </div>}
            {tomato&&<div key={act.number+'-'+tomato.attempt} className={'club-tomato-projectile incoming-'+tomato.lane.toLowerCase()+(tomatoResult?(tomatoResult.dodged?' missed':' splatted'):'')} aria-hidden="true">🍅</div>}
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
            <div className="club-tomato-game" aria-label="Tomato Night dodge game">
              <div className="club-tomato-heading">
                <div><span>TOMATO NIGHT / DODGE THE PRODUCE</span><small>Three tomatoes maximum per act. The lane is announced before you dodge.</small></div>
                <button type="button" disabled={!act||(!!tomato&&!tomatoResult)||tomatoAttempts>=MAX_THROWS_PER_ACT}
                  onClick={tossTomato}>🍅 THROW A TOMATO</button>
              </div>
              <div className="club-tomato-readout" role="status">
                {tomato&&!tomatoResult?'INCOMING TOMATO: '+tomato.lane+'. CHOOSE A DIFFERENT LANE TO DODGE!':
                  tomatoResult?tomatoResult.outcome+' · '+tomatoResult.text:
                  act?'The audience is respectfully waiting for permission to be unreasonable.':'The produce counter is closed until the show starts.'}
              </div>
              <div className="club-tomato-lanes" role="group" aria-label="Choose a dodge lane">
                {LANES.map(lane=><button type="button" key={lane} disabled={!tomato||!!tomatoResult}
                  onClick={()=>chooseDodge(lane)} aria-label={'Dodge '+lane.toLowerCase()}>
                  {lane==='LEFT'?'←':lane==='RIGHT'?'→':'↓'} DODGE {lane}</button>)}
              </div>
              <div className="club-tomato-tally"><span>DODGES: {tomatoDodges}</span><span>SPLATS: {tomatoSplats}</span><span>THROWS THIS ACT: {tomatoAttempts}/{MAX_THROWS_PER_ACT}</span></div>
            </div>
            <p className="club-keyhint">FOCUS STAGE: <kbd>N</kbd> NEXT · <kbd>R</kbd> REVEAL · <kbd>H</kbd> HECKLE · <kbd>P</kbd> CHICKEN · <kbd>D</kbd> DUEL · <kbd>T</kbd> TOMATO. AUTO SHOW OFF BY DEFAULT.</p>
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
      <div className="club-manager-desk" id="mabel-desk">
        <div className="club-manager-head">
          <div className="club-manager-avatar" aria-hidden="true">📋</div>
          <div><span>BACKSTAGE SAFETY & COMEDY COMPLIANCE</span><h3>{MANAGER.name}</h3><p>{MANAGER.title}. "{MANAGER.motto}"</p></div>
        </div>
        <div className="club-manager-toolbar">
          <div><strong>{reports.length} ON-FILE INCIDENTS</strong><small>Latest {MAX_THROWS_PER_ACT} throws per act · archive capped at 30 reports</small></div>
          <div><button type="button" onClick={exportReports} disabled={!reports.length}>↓ EXPORT REPORTS</button>
            <button type="button" onClick={clearReports} disabled={!reports.length}>{clearArmed?'CONFIRM CLEAR':'CLEAR REPORTS'}</button>
            {clearArmed&&<button type="button" onClick={()=>setClearArmed(false)}>CANCEL</button>}</div>
        </div>
        <p className="club-manager-status" role="status">{reportStatus}</p>
        <div className="club-manager-reports">
          {reports.length?reports.slice(0,8).map(report=><article key={report.id}>
            <div><span>{report.id}</span><strong>{report.outcome}</strong></div>
            <h4>ACT {report.act} / {report.performer}</h4>
            <p>INCOMING: {report.incoming} · DODGE: {report.dodge}</p>
            <p>{report.note}</p>
          </article>):<p className="club-no-reports">Mabel has no reports to file. She finds this deeply suspicious.</p>}
        </div>
        <p className="club-manager-footnote">Fictional incident reports stay in this browser only. Export them as JSON if you wish to keep a copy. Clearing them is irreversible without a previous export.</p>
      </div>
      <div className="club-incident-log" aria-live="polite">
        <strong>BACKSTAGE INCIDENT REPORT</strong>
        {eventLog.length?<ol>{eventLog.map((line,index)=><li key={index}>{line}</li>)}</ol>:<p>No accidents have been reported. The management is concerned.</p>}
      </div>
      <p className="club-disclaimer">This is an original, single-player simulated comedy show, not a livestream or multiplayer room. The cast, heckles and applause are fictional; your real reactions and Writer Room material remain on this device. Independent fan tribute, not affiliated with or endorsed by Al Lowe.</p>
    </div>
  </section>;
}
