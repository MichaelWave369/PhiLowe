import React,{useMemo,useState} from 'react';
import {JOKE_CATEGORIES} from './jokes.js';
import {
  MAX_IMPORT_BYTES,MAX_JOKES,upsertJoke,removeJoke,
  exportBackup,parseBackup,mergeBackup
} from './writerRoomStore.js';

const EMPTY={category:'adventure',setup:'',punchline:'',notes:'',status:'draft'};

export default function WriterRoom({jokes,onChange,beep,storageWarning}){
  const [draft,setDraft]=useState({...EMPTY});
  const [editingId,setEditingId]=useState(null);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [notice,setNotice]=useState('Nothing is uploaded. Your work stays in this browser until you export it.');
  const [error,setError]=useState('');
  const [pendingDelete,setPendingDelete]=useState(null);
  const [importing,setImporting]=useState(false);
  const [revealPreview,setRevealPreview]=useState(false);

  const listing=useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return jokes.filter(j=>(filter==='all'||j.status===filter)&&(!needle||[j.setup,j.punchline,j.notes,j.category].some(x=>x.toLowerCase().includes(needle))));
  },[jokes,filter,search]);

  function put(field,value){
    setDraft(v=>({...v,[field]:value}));
    setError('');
    setRevealPreview(false);
  }
  function reset(){
    setDraft({...EMPTY});setEditingId(null);setPendingDelete(null);setRevealPreview(false);setError('');
  }
  function save(event){
    event.preventDefault();
    try{
      const next=upsertJoke(jokes,draft,editingId);
      onChange(next);
      setNotice(editingId?'JOKE UPDATED. YOUR NEW VERSION IS READY.':draft.status==='stage'?'JOKE SAVED AND PLACED ON STAGE.':'DRAFT SAVED. THE AUDIENCE CANNOT SEE IT YET.');
      reset();beep?.(740,.08);
    }catch(err){setError(err.message);}
  }
  function edit(joke){
    setDraft({category:joke.category,setup:joke.setup,punchline:joke.punchline,notes:joke.notes,status:joke.status});
    setEditingId(joke.id);
    setPendingDelete(null);setRevealPreview(true);setError('');setNotice('EDITING '+joke.id+'. SAVE TO APPLY YOUR CHANGES.');
    document.getElementById('writer-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function toggleStage(joke){
    try{
      const next=upsertJoke(jokes,{...joke,status:joke.status==='draft'?'stage':'draft'},joke.id);
      onChange(next);
      setNotice(joke.status==='draft'?'YOUR JOKE IS NOW AVAILABLE IN THE LAUGH LOUNGE ON THIS DEVICE.':'JOKE TAKEN OFF STAGE AND RETURNED TO DRAFTS.');
      setPendingDelete(null);beep?.(640,.06);
    }catch(err){setError(err.message);}
  }
  function confirmDelete(id){
    if(pendingDelete!==id){setPendingDelete(id);setNotice('CONFIRM DELETION BELOW. THIS CANNOT BE UNDONE WITHOUT A BACKUP.');return;}
    onChange(removeJoke(jokes,id));
    if(editingId===id)reset();
    setPendingDelete(null);setNotice('JOKE DELETED FROM LOCAL WRITERS ROOM.');beep?.(290,.07);
  }
  function downloadBackup(){
    try{
      const data=exportBackup(jokes);
      const blob=new Blob([data],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='philowe-writers-room-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1500);
      setNotice('JSON BACKUP EXPORTED. KEEP A COPY SOMEWHERE SAFE.');
      setError('');
    }catch(err){setError('Could not create backup: '+err.message);}
  }
  async function importFile(event){
    const file=event.target.files?.[0];
    if(!file)return;
    setImporting(true);setError('');
    try{
      if(file.size>MAX_IMPORT_BYTES)throw new Error('File exceeds the 2 MB backup limit.');
      const text=await file.text();
      const records=parseBackup(text);
      const result=mergeBackup(jokes,records);
      if(result.added)onChange(result.jokes);
      setNotice('IMPORTED '+result.added+' JOKES. '+result.skipped+' DUPLICATES SKIPPED. EXISTING JOKES PRESERVED.');
      beep?.(750,.08);
    }catch(err){setError('Import failed: '+err.message+'. Your existing jokes were not changed.');}
    finally{event.target.value='';setImporting(false);}
  }

  const drafts=jokes.filter(j=>j.status==='draft').length;
  const staged=jokes.length-drafts;
  const chars=(name,max)=><span className="writer-count">{draft[name].length}/{max}</span>;
  return <section className="writer-section" id="writers-room" aria-labelledby="writer-title">
    <div className="wrap">
      <div className="section-heading centered">
        <div className="pixel-rule"><span>04 / WRITERS ROOM</span><span className="rule-line"/><span className="rule-end">✦</span></div>
        <p className="superlabel">THE WORLD ALREADY HAS ENOUGH BAD JOKES. LET US MAKE OUR OWN.</p>
        <h2 id="writer-title">WRITE IT.<br/><span>THEN WORK THE ROOM.</span></h2>
        <p>Build your own collection of adventure-game gags, groan-worthy puns, and outrageous ideas. Your drafts remain private. Move a joke On Stage when it is ready for the Laugh Lounge.</p>
      </div>
      <div className="writer-stats" aria-label="Your joke collection statistics">
        <div><span>YOUR MATERIAL</span><strong>{jokes.length}</strong><small>of {MAX_JOKES} slots</small></div>
        <div><span>IN THE NOTEBOOK</span><strong>{drafts}</strong><small>private drafts</small></div>
        <div><span>ON STAGE</span><strong>{staged}</strong><small>playable in the lounge</small></div>
      </div>
      {storageWarning&&<div className="writer-warning" role="alert">{storageWarning} Export a backup of any material that remains visible before closing this page.</div>}
      <div className="writer-columns">
        <div className="writer-form-shell" id="writer-editor">
          <div className="writer-bar"><span>WRITER.EXE / {editingId?'EDIT MODE':'NEW JOKE'}</span><span>◉ LOCAL SESSION</span></div>
          <form className="writer-form" onSubmit={save}>
            <label>COMEDY DEPARTMENT
              <select value={draft.category} onChange={e=>put('category',e.target.value)}>
                {JOKE_CATEGORIES.map(c=><option value={c.id} key={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label>SETUP {chars('setup',240)}
              <textarea required maxLength={240} rows={3} value={draft.setup} onChange={e=>put('setup',e.target.value)} placeholder="A programmer, a wizard and a rubber chicken enter a tavern..." />
            </label>
            <label>PUNCHLINE {chars('punchline',320)}
              <textarea required maxLength={320} rows={3} value={draft.punchline} onChange={e=>put('punchline',e.target.value)} placeholder="The bartender asks who broke the inventory system." />
            </label>
            <label>WRITER NOTES (PRIVATE) {chars('notes',800)}
              <textarea maxLength={800} rows={3} value={draft.notes} onChange={e=>put('notes',e.target.value)} placeholder="Timing, alternate endings, future VR gag, punchline B..." />
            </label>
            <fieldset className="writer-radio">
              <legend>WHERE DOES THIS ONE GO?</legend>
              <label><input type="radio" value="draft" checked={draft.status==='draft'} onChange={()=>put('status','draft')}/> PRIVATE DRAFT</label>
              <label><input type="radio" value="stage" checked={draft.status==='stage'} onChange={()=>put('status','stage')}/> ON STAGE</label>
            </fieldset>
            {error&&<p className="writer-error" role="alert">{error}</p>}
            <div className="writer-form-actions">
              <button type="submit" className="writer-save">{editingId?'SAVE CHANGES':'SAVE JOKE'} ↗</button>
              <button type="button" className="writer-reset" onClick={reset}>CLEAR / NEW</button>
            </div>
          </form>
        </div>
        <div className="writer-preview-shell">
          <div className="writer-bar"><span>PREVIEW.EXE</span><span>BEFORE THE CRICKETS ARRIVE</span></div>
          <div className="writer-preview">
            <span className="writer-preview-label">{JOKE_CATEGORIES.find(c=>c.id===draft.category)?.label} / {draft.status==='draft'?'PRIVATE DRAFT':'ON STAGE'}</span>
            <h3>{draft.setup||'Your setup walks onto the stage...'}</h3>
            <div className="writer-preview-punch">
              {revealPreview?<p>{draft.punchline||'...and forgets why it came.'}</p>:<span>[ THE PUNCHLINE IS WAITING IN THE WINGS ]</span>}
            </div>
            <button type="button" onClick={()=>setRevealPreview(v=>!v)}>{revealPreview?'HIDE PUNCHLINE':'REVEAL PUNCHLINE'}</button>
            <p className="writer-tip">WRITER'S TIP: The setup creates an expectation. The punchline changes it. If your audience groans, you have at least confirmed they're still awake.</p>
          </div>
        </div>
      </div>
      <div className="writer-vault">
        <div className="writer-vault-head">
          <div><span>PERSONAL ARCHIVE / PRIVATE TO THIS BROWSER</span><h3>YOUR JOKE VAULT</h3></div>
          <div className="writer-backup"><button type="button" onClick={downloadBackup} disabled={!jokes.length}>↓ EXPORT JSON</button><label className="writer-import">↑ IMPORT JSON<input type="file" accept=".json,application/json" disabled={importing} onChange={importFile}/></label></div>
        </div>
        <div className="writer-vault-filters">
          <div role="group" aria-label="Filter your jokes">
            {['all','draft','stage'].map(option=><button key={option} type="button" aria-pressed={filter===option} className={filter===option?'active':''} onClick={()=>setFilter(option)}>{option==='all'?'ALL':option==='draft'?'DRAFTS':'ON STAGE'}</button>)}
          </div>
          <label>FIND YOUR MATERIAL<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search setup, punchline or notes..." /></label>
        </div>
        <p className="writer-status" aria-live="polite">{notice}</p>
        <div className="writer-vault-list">
          {listing.length?listing.map(joke=><article key={joke.id} className="writer-entry">
            <div className="writer-entry-head"><span>{joke.id} · {JOKE_CATEGORIES.find(c=>c.id===joke.category)?.label}</span><strong className={joke.status==='stage'?'on-stage':'as-draft'}>{joke.status==='stage'?'● ON STAGE':'○ DRAFT'}</strong></div>
            <h4>{joke.setup}</h4><p>{joke.punchline}</p>
            {joke.notes&&<p className="writer-entry-notes">NOTES: {joke.notes}</p>}
            <div className="writer-entry-actions">
              <button type="button" onClick={()=>edit(joke)}>✎ EDIT</button>
              <button type="button" onClick={()=>toggleStage(joke)}>{joke.status==='stage'?'○ TAKE OFF STAGE':'● PUT ON STAGE'}</button>
              {pendingDelete===joke.id?<><button className="writer-danger" type="button" onClick={()=>confirmDelete(joke.id)}>CONFIRM DELETE</button><button type="button" onClick={()=>setPendingDelete(null)}>CANCEL</button></>:<button type="button" onClick={()=>confirmDelete(joke.id)}>× DELETE</button>}
            </div>
          </article>):<div className="writer-no-entries">No jokes here yet. The notebook is empty, and for once nobody is blaming the audience.</div>}
        </div>
        <p className="writer-footnote">Your joke vault is stored only in this browser. Export regularly to move it between computers or protect it from browser cleanup. Import merges records without replacing existing jokes. Publishing On Stage means playable here, not uploaded to the internet.</p>
      </div>
    </div>
  </section>;
}
