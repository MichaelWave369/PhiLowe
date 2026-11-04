import React,{useMemo,useRef,useState,useEffect} from 'react';
import {JOKES,JOKE_CATEGORIES} from './jokes.js';
import {drawJoke} from './jokeEngine.js';
import {onStage} from './writerRoomStore.js';

const FAVORITES_KEY='philowe.jokes.favorites.v1';
const REACTIONS_KEY='philowe.jokes.reactions.v1';
const heckles=[
  'IS THIS THE PART WHERE I ASK FOR A HINT?',
  'MY FLOPPY DISK HAS BETTER TIMING!',
  'I HAVE SEEN FASTER PUNCHLINES ON DIAL-UP!',
  'THE CRICKET IS REQUESTING A REFUND!',
  'GIVE THAT JOKE A SAVE POINT!',
  'THE AUDIENCE HAS ENCOUNTERED AN UNEXPECTED ERROR!',
  'SOMEBODY UPDATE THE HUMOR DRIVERS!',
  'MY COFFEE JUST ASKED TO LEAVE EARLY!'
];

function stored(key,fallback){
  try {const val=JSON.parse(window.localStorage.getItem(key));return val??fallback;}
  catch{return fallback;}
}
function belongsToCategory(j,category,favorites){
  return category==='all'||(category==='mine'&&j.id.startsWith('CW-'))||(category==='favorites'&&favorites.includes(j.id))||j.category===category;
}
function pick(pool,key,decks,previous){
  if(!pool.length)return null;
  let cache=decks.current.get(key);
  if(!cache){cache=new Map();decks.current.set(key,cache);}
  let found=drawJoke(pool,'all',cache);
  if(pool.length>1&&found?.id===previous?.id)found=drawJoke(pool,'all',cache);
  return found;
}

export default function JokeLounge({beep,customJokes=[]}){
  const published=useMemo(()=>onStage(customJokes),[customJokes]);
  const catalog=useMemo(()=>[...JOKES,...published],[published]);
  const [category,setCategory]=useState('all');
  const [query,setQuery]=useState('');
  const [current,setCurrent]=useState(JOKES[0]);
  const [revealed,setRevealed]=useState(false);
  const [favorites,setFavorites]=useState(()=>{
    const v=stored(FAVORITES_KEY,[]);
    const allowed=new Set(catalog.map(j=>j.id));
    return Array.isArray(v)?v.filter(id=>allowed.has(id)):[];
  });
  const [reactions,setReactions]=useState(()=>{
    const v=stored(REACTIONS_KEY,{});
    return v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  });
  const [notice,setNotice]=useState('');
  const [heckle,setHeckle]=useState('');
  const decks=useRef(new Map());
  const [served,setServed]=useState(0);
  const searchable=useMemo(()=>{
    const needle=query.trim().toLowerCase();
    return catalog.filter(j=>belongsToCategory(j,category,favorites)&&(!needle||[j.setup,j.punchline,j.category,j.id].some(t=>t.toLowerCase().includes(needle))));
  },[catalog,category,query,favorites]);
  useEffect(()=>{
    if(!current)return;
    const match=catalog.find(j=>j.id===current.id);
    if(!match){setCurrent(catalog[0]||null);setRevealed(false);}
    else if(match!==current){setCurrent(match);setRevealed(false);}
  },[catalog]);
  useEffect(()=>{
    const valid=new Set(catalog.map(j=>j.id));
    setFavorites(old=>{const next=old.filter(id=>valid.has(id));return next.length===old.length?old:next;});
  },[catalog]);

  useEffect(()=>{try{window.localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites));}catch{}},[favorites]);
  useEffect(()=>{try{window.localStorage.setItem(REACTIONS_KEY,JSON.stringify(reactions));}catch{}},[reactions]);

  function selectNext(nextCategory=category,nextQuery=query,nextFavorites=favorites){
    const search=nextQuery.trim().toLowerCase();
    const pool=catalog.filter(j=>belongsToCategory(j,nextCategory,nextFavorites)&&(!search||[j.setup,j.punchline,j.category,j.id].some(t=>t.toLowerCase().includes(search))));
    const key=nextCategory+'/'+search+'/'+(nextCategory==='favorites'?nextFavorites.join(','):'');
    const joke=pick(pool,key,decks,current);
    setCurrent(joke);setRevealed(false);setNotice('');setHeckle('');
    if(joke)setServed(n=>n+1);
    beep?.(620,.06);
  }
  function chooseCategory(id){
    setCategory(id);
    selectNext(id,query,favorites);
  }
  function searchText(value){
    setQuery(value);
    // The finder updates immediately; pressing SURPRISE ME draws from matching results.
    setNotice('');
  }
  function favorite(){
    if(!current)return;
    const next=favorites.includes(current.id)?favorites.filter(id=>id!==current.id):[...favorites,current.id];
    setFavorites(next);
    if(category==='favorites'&&!next.includes(current.id))selectNext(category,query,next);
    else setNotice(next.includes(current.id)?'SAVED TO YOUR LOCAL FAVORITES':'REMOVED FROM FAVORITES');
    beep?.(760,.07);
  }
  function react(type){
    if(!current||!revealed)return;
    setReactions(old=>({...old,[current.id]:type}));
    setNotice(type==='laugh'?'THE AUDIENCE APPROVES. MIRACLES HAPPEN.':'A PREMIUM GROAN. THE COMEDIAN ACCEPTS.');
    beep?.(type==='laugh'?900:245,.11);
  }
  async function copy(){
    if(!current)return;
    try{
      await navigator.clipboard.writeText(current.setup+'\n'+current.punchline+'\n\n'+(current.id.startsWith('CW-')?'Written in PhiLowe Writer Room.':'Original joke from PhiLowe — independent fan tribute to Al Lowe.'));
      setNotice('JOKE COPIED. DISTRIBUTE RESPONSIBLY.');
    }catch{setNotice('COPY BLOCKED BY BROWSER. SELECT THE TEXT TO SHARE.');}
  }
  function interrupt(){
    const choice=heckles[Math.floor(Math.random()*heckles.length)];
    setHeckle(choice===heckle?heckles[(heckles.indexOf(choice)+1)%heckles.length]:choice);
    beep?.(230,.1);
  }
  const selectedVote=current?reactions[current.id]:null;
  const laughter=Object.values(reactions).filter(v=>v==='laugh').length;
  const groans=Object.values(reactions).filter(v=>v==='groan').length;
  const currentCategory=JOKE_CATEGORIES.find(c=>c.id===current?.category);

  return <section className="joke-lounge-section" id="jokes">
    <div className="wrap">
      <div className="section-heading centered">
        <div className="pixel-rule lounge-rule"><span>03 / THE CYBERJOKE 3690</span><span className="rule-line"/><span className="rule-end">✦</span></div>
        <p className="superlabel">AUTOMATED COMEDY // QUESTIONABLE QUALITY CONTROL</p>
        <h2>THE LAUGH<br/><span>LOUNGE IS OPEN.</span></h2>
        <p>{JOKES.length} original house jokes plus {published.length} of your own, across eight ridiculous departments. Draft your material in the Writer Room and put it on stage when ready. Browse the archive, heckle the act, or collect your favorite groaners.</p>
      </div>
      <div className="joke-theater">
        <div className="joke-main">
          <div className="joke-led"><span className="signal-dot"/> LIVE FROM THE LAUGH LOUNGE <span className="joke-number">{current?.id||'NO SIGNAL'}</span></div>
          <div className="joke-stage">
            <div className="joke-spotlight" aria-hidden="true"/><div className="joke-mic" aria-hidden="true">♩</div>
            <div className="joke-content" aria-live="polite">
              <span className="joke-chip">{current?.id.startsWith('CW-')?'YOUR JOKE · ':''}{currentCategory?.label||'EMPTY STAGE'}</span>
              <h3>{current?current.setup:'No jokes match this search. Apparently the archive has standards.'}</h3>
              {current&&<div className={'joke-punch '+(revealed?'visible':'concealed')}>
                {revealed?<p>{current.punchline}</p>:<p className="joke-wait">[ PRESS REVEAL TO DELIVER THE PUNCHLINE ]</p>}
              </div>}
            </div>
            <div className="joke-stage-bottom" aria-hidden="true">THE MICROPHONE IS NOT RESPONSIBLE FOR THE MATERIAL</div>
          </div>
          <div className="joke-actions">
            <button type="button" className="joke-big-button" disabled={!current||revealed} onClick={()=>{setRevealed(true);beep?.(780,.09)}}>▶ {revealed?'PUNCHLINE DELIVERED':'REVEAL PUNCHLINE'}</button>
            <button type="button" className="joke-next-button" onClick={()=>selectNext()} disabled={!searchable.length}>↻ ANOTHER JOKE</button>
          </div>
          <div className="joke-reactions">
            <button type="button" disabled={!current||!revealed} className={selectedVote==='laugh'?'voted':''} onClick={()=>react('laugh')}>☺ ACTUAL LAUGH</button>
            <button type="button" disabled={!current||!revealed} className={selectedVote==='groan'?'voted':''} onClick={()=>react('groan')}>☹ QUALITY GROAN</button>
            <button type="button" disabled={!current} aria-pressed={!!current&&favorites.includes(current.id)} className={current&&favorites.includes(current.id)?'voted':''} onClick={favorite}>{current&&favorites.includes(current.id)?'♥ SAVED':'♡ SAVE'}</button>
            <button type="button" disabled={!current} onClick={copy}>▤ COPY</button>
          </div>
          <div className="joke-stage-footer" aria-live="polite"><span>{notice||'ORIGINAL HOUSE GAGS + YOUR MATERIAL · STORED ON THIS DEVICE'}</span><span>SETUPS SERVED: {served}</span></div>
        </div>
        <aside className="joke-sidebar">
          <div className="joke-sidebar-top"><span>CHOOSE YOUR POISON</span><span>◉ ONLINE(ISH)</span></div>
          <div className="joke-categories" role="group" aria-label="Joke categories">
            <button className={category==='all'?'selected':''} aria-pressed={category==='all'} onClick={()=>chooseCategory('all')}>✦ ALL DEPARTMENTS <span>{catalog.length}</span></button>
            {JOKE_CATEGORIES.map(c=><button key={c.id} className={category===c.id?'selected':''} aria-pressed={category===c.id} onClick={()=>chooseCategory(c.id)}><span className="category-icon">{c.icon}</span>{c.label}<span>{catalog.filter(j=>j.category===c.id).length}</span></button>)}
            <button className={category==='mine'?'selected':''} aria-pressed={category==='mine'} onClick={()=>chooseCategory('mine')}>✎ MY JOKES <span>{published.length}</span></button>
            <button className={category==='favorites'?'selected':''} aria-pressed={category==='favorites'} onClick={()=>chooseCategory('favorites')}>♥ MY FAVORITES <span>{favorites.length}</span></button>
          </div>
          <div className="joke-sidebar-info"><span>YOUR PRIVATE SCORECARD</span><div><strong>☺ {laughter}</strong><strong>☹ {groans}</strong><strong>♥ {favorites.length}</strong></div><small>No account, no tracking, no backend. Just browser storage and very questionable jokes.</small></div>
          <button type="button" className="heckle-button" onClick={interrupt}>📣 HECKLE THE COMEDIAN</button>
          <p className="heckle-quote" aria-live="polite">{heckle||'A good audience participates. A bad audience gets hired as the writer.'}</p>
        </aside>
      </div>
      <div className="joke-archive">
        <div className="joke-archive-head"><div><span>LAUGH LOUNGE / ARCHIVE TERMINAL</span><h3>FIND A GAG</h3></div><label className="joke-search">SEARCH THE FILES<input type="search" value={query} onChange={e=>searchText(e.target.value)} placeholder="Try: wizard, modem, coffee..." /></label></div>
        <div className="joke-archive-grid">
          {searchable.slice(0,6).map(j=><button type="button" key={j.id} className={'joke-archive-card '+(current?.id===j.id?'active':'')} onClick={()=>{setCurrent(j);setRevealed(false);setNotice('');setHeckle('');beep?.(500,.05)}}><small>{j.id} / {JOKE_CATEGORIES.find(c=>c.id===j.category)?.label}</small><span>{j.setup}</span><b>LOAD THIS SETUP ↗</b></button>)}
          {!searchable.length&&<p className="joke-empty">No matches. Try clearing your search or choosing another department. The comedian has left the building.</p>}
        </div>
        <p className="joke-archive-note">SHOWING {Math.min(6,searchable.length)} OF {searchable.length} MATCHES · Use ANOTHER JOKE to cycle every matching entry without repeats. Independent fan tribute, not affiliated with Al Lowe. Your own submissions remain local to your browser.</p>
      </div>
    </div>
  </section>;
}
