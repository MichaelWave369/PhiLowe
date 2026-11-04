import {drawJoke} from './jokeEngine.js';

/**
 * Entirely original PhiLowe characters; no licensed Sierra characters, game
 * assets, dialogue, or Al Lowe quotations are used.
 */
export const COMEDIANS = Object.freeze([
  {
    id:'bix',name:'BIX BINARY',title:'Professional Bug Enthusiast',
    color:'mint',categories:['coding','retro'],symbol:'⌘',
    intros:['I tried to debug my personality. The issue was marked "working as designed."','I used to tour with a modem. We split up over communication issues.','Tonight my act has zero dependencies. Unfortunately, it has several known bugs.'],
    comebacks:['Your feedback has been logged and immediately ignored.','I would compile a better response, but your heckle failed type checking.','Congratulations, your comment is now a legacy support ticket.']
  },
  {
    id:'vera',name:'VERA VELVET',title:'Romance Disaster Specialist',
    color:'pink',categories:['love','everyday'],symbol:'♥',
    intros:['My dating profile says emotionally available, pending a software update.','I brought flowers and a backup plan. Somehow both wilted.','Welcome to date night. The exit is behind the enormous red flags.'],
    comebacks:['Sweetheart, I have rejected better dialogue options than that.','That line needs more rehearsal than my last relationship.','If awkwardness paid rent, this room would be a penthouse.']
  },
  {
    id:'prof',name:'PROF. PLOTWICK',title:'Dungeon-Certified Comedian',
    color:'gold',categories:['adventure','fantasy'],symbol:'✦',
    intros:['My quest for the perfect joke required seventeen unrelated errands.','A wizard told me to follow my destiny. The map was upside down.','Tonight, you are all part of an optional side quest. No refunds.'],
    comebacks:['That heckle grants exactly zero experience points.','You have triggered the secret boss: basic manners.','Even the tavern rat thought that needed another draft.']
  },
  {
    id:'dj',name:'DJ PARALLAX',title:'Headset & Head-Nod Technician',
    color:'cyan',categories:['vr','music'],symbol:'♫',
    intros:['This set is fully immersive. Please move your furniture.','My beats are spatial audio. My confidence is still mono.','Who is ready for a standing ovation? Do not stand if your guardian boundary is red.'],
    comebacks:['I would drop the mic, but it is still in my other controller.','That heckle has more latency than my first headset.','Turn the booing down. You are clipping the audience bus.']
  }
]);
export const GUEST_COMEDIAN=Object.freeze({
  id:'guest',name:'THE OPEN MIC',title:'From Your Writer Room',
  color:'lavender',categories:[],symbol:'★',
  intros:['Fresh material from the local notebook. The audience has signed no waivers.','Our next performer brought original jokes, and possibly a legal-sized apology.'],
  comebacks:['That heckle is going straight into my private notes.','Try that again when you have your own microphone.']
});
export function lineupFor(staged=[]){
  return staged.length?[...COMEDIANS,GUEST_COMEDIAN]:[...COMEDIANS];
}
export function nextClubAct(houseJokes,staged=[],bags=new Map(),previousTurn=-1,random=Math.random){
  const lineup=lineupFor(staged);
  if(!lineup.length)return null;
  const turn=previousTurn+1;
  const comedian=lineup[turn%lineup.length];
  const pool=comedian.id==='guest'?staged:
    [...houseJokes,...staged].filter(j=>comedian.categories.includes(j.category));
  if(!pool.length)return null;
  let bag=bags.get(comedian.id);
  if(!bag){bag=new Map();bags.set(comedian.id,bag);}
  const joke=drawJoke(pool,'all',bag,random);
  const round=Math.floor(turn/lineup.length);
  return {turn,number:turn+1,comedian,joke,
    intro:comedian.intros[round%comedian.intros.length]};
}
export function comebackFor(comedian,heckleCount=0){
  if(!comedian)return '';
  return comedian.comebacks[Math.max(0,heckleCount)%comedian.comebacks.length];
}
export function crowdLabel(laughs=0,groans=0){
  if(laughs+groans===0)return 'TENTATIVELY HOPEFUL';
  const ratio=laughs/(laughs+groans);
  if(ratio>=.75)return 'STANDING OVATION';
  if(ratio>=.5)return 'MILDLY IMPRESSED';
  if(ratio>=.25)return 'COURTESY CHUCKLES';
  return 'CRICKETS AND CONCERN';
}
