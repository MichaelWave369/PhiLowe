/** A seeded-testable, per-filter shuffle bag. Each joke appears once per cycle. */
export function shuffle(values, random=Math.random) {
  const out=[...values];
  for(let i=out.length-1;i>0;i--){
    const r=random();
    const j=Math.min(i,Math.max(0,Math.floor((Number.isFinite(r)?r:0)* (i+1))));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
export function drawJoke(catalog, category, bags, random=Math.random) {
  const pool=category==='all'?catalog:catalog.filter(j=>j.category===category);
  if(!pool.length) return null;
  const ids=new Set(pool.map(j=>j.id));
  const prev=bags.get(category)||{remaining:[],last:null};
  let remaining=prev.remaining.filter(id=>ids.has(id));
  if(!remaining.length){
    remaining=shuffle([...ids],random);
    // Pop() is the first draw. Never repeat the boundary joke if avoidable.
    if(remaining.length>1 && remaining[remaining.length-1]===prev.last){
      [remaining[remaining.length-1],remaining[0]]=[remaining[0],remaining[remaining.length-1]];
    }
  }
  const id=remaining.pop();
  bags.set(category,{remaining,last:id});
  return pool.find(j=>j.id===id)||null;
}
