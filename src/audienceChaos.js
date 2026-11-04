/**
 * Audience Chaos: original physical comedy and heckler challenges.
 * Pure functions here allow tests without a browser or a backend.
 */
export const STAGE_PROPS = Object.freeze([
  {
    id: 'chicken', label: 'RUBBER CHICKEN', symbol: '🐔',
    cue: 'The rubber chicken unleashes a solo that the orchestra refuses to acknowledge.',
    className: 'chaos-chicken'
  },
  {
    id: 'banana', label: 'BANANA PEEL', symbol: '🍌',
    cue: 'The performer slips, lands safely, and immediately requests a stunt double.',
    className: 'chaos-banana'
  },
  {
    id: 'confetti', label: 'CONFETTI CANNON', symbol: '🎉',
    cue: 'CONFETTI! That was the entire effects budget. Please reuse these pixels.',
    className: 'chaos-confetti'
  },
  {
    id: 'trapdoor', label: 'TRAPDOOR', symbol: '▤',
    cue: 'The trapdoor opens. Gravity earns a five-star review. The comedian does not.',
    className: 'chaos-trapdoor'
  }
]);

const DUELS = {
  bix: [
    {
      prompt: 'A heckler shouts: "Your jokes are full of bugs!" Choose Bix’s comeback.',
      choices: ['At least mine are documented.', 'Please restart your mouth.', 'Then stop installing the punchlines.'],
      correct: 0, win: 'Bix: "At least mine are documented." The crowd grants one reluctant chuckle.'
    },
    {
      prompt: 'Heckler: "I waited forever for that joke!" Give Bix a comeback.',
      choices: ['My keyboard has feelings.', 'Sorry, the punchline was on dial-up.', 'Please read the terms of laughter.'],
      correct: 1, win: 'Bix: "Sorry, the punchline was on dial-up." The modem in the back starts crying.'
    },
    {
      prompt: 'Heckler: "That is not a feature!" Choose the comeback.',
      choices: ['Try moving to another chair.', 'I demand more RAM.', 'Correct. It is a limited-edition bug.'],
      correct: 2, win: 'Bix: "Correct. It is a limited-edition bug." The imaginary QA department resigns.'
    }
  ],
  vera: [
    {
      prompt: 'Heckler: "Your love life is a disaster!" Help Vera respond.',
      choices: ['It has a sequel scheduled.', 'Still better than your opening line.', 'Are you my wedding planner?'],
      correct: 1, win: 'Vera: "Still better than your opening line." The heckler deletes their dating profile.'
    },
    {
      prompt: 'Heckler: "That joke had no chemistry!" Choose her comeback.',
      choices: ['At least no one needed safety goggles.', 'Please consult the laboratory.', 'Then where did this explosion come from?'],
      correct: 2, win: 'Vera: "Then where did this explosion come from?" The stage lights turn pink.'
    },
    {
      prompt: 'Heckler: "Nobody wants a second date with that joke!" Choose wisely.',
      choices: ['Perfect. It already blocked you.', 'My calendar is full.', 'It prefers a long-distance relationship.'],
      correct: 0, win: 'Vera: "Perfect. It already blocked you." The audience applauds the boundary.'
    }
  ],
  prof: [
    {
      prompt: 'Heckler: "That quest was pointless!" Help the Professor.',
      choices: ['Are you sure you have the map?', 'The points are in another dungeon.', 'Check the terms of the prophecy.'],
      correct: 1, win: 'Plotwick: "The points are in another dungeon." Three adventurers start a side quest.'
    },
    {
      prompt: 'Heckler: "Your wizard has no magic!" Pick a spell of a comeback.',
      choices: ['He specializes in low-budget illusions.', 'The mana is on vacation.', 'Then why did your wallet disappear?'],
      correct: 2, win: 'Plotwick: "Then why did your wallet disappear?" A suspiciously rich toad hops away.'
    },
    {
      prompt: 'Heckler: "Your dragon is just a lizard!" Choose the reply.',
      choices: ['That is between him and his publicist.', 'Please lower your expectations.', 'He has already filed an appeal.'],
      correct: 0, win: 'Plotwick: "That is between him and his publicist." The dragon requests a trailer.'
    }
  ],
  dj: [
    {
      prompt: 'Heckler: "Your set has terrible latency!" Help DJ Parallax.',
      choices: ['You are out of phase.', 'I heard that complaint next Tuesday.', 'Did you try turning the beat off?'],
      correct: 1, win: 'DJ Parallax: "I heard that complaint next Tuesday." The room cheers three beats late.'
    },
    {
      prompt: 'Heckler: "That is not immersive!" What should DJ say?',
      choices: ['Neither is your furniture.', 'Have you checked the warranty?', 'The floor is the real simulation.'],
      correct: 0, win: 'DJ Parallax: "Neither is your furniture." A virtual lamp files an incident report.'
    },
    {
      prompt: 'Heckler: "Your bass sounds like a printer!" Give a reply.',
      choices: ['The tone is fine.', 'Our technician is on break.', 'Wait until it runs out of toner.'],
      correct: 2, win: 'DJ Parallax: "Wait until it runs out of toner." The front row starts head-nodding.'
    }
  ],
  guest: [
    {
      prompt: 'Heckler: "Who wrote this material?" Defend the Open Mic.',
      choices: ['The local Writer Room, and it keeps receipts.', 'A rubber chicken with a typewriter.', 'Do not ask the microphone.'],
      correct: 0, win: 'Open Mic: "The local Writer Room, and it keeps receipts." The heckler considers copyright law.'
    },
    {
      prompt: 'Heckler: "Your joke needs a rewrite!" Choose a comeback.',
      choices: ['It needs more glitter.', 'Perfect, you have been promoted to unpaid editor.', 'Then submit a pull request.'],
      correct: 2, win: 'Open Mic: "Then submit a pull request." The heckler reports a merge conflict.'
    },
    {
      prompt: 'Heckler: "The audience is sleeping!" Wake them up.',
      choices: ['Please see the manual.', 'No, we are buffering dramatically.', 'I understand your concern.'],
      correct: 1, win: 'Open Mic: "No, we are buffering dramatically." The audience starts loading applause.'
    }
  ]
};

export const BADGES = Object.freeze([
  {id:'first-show',symbol:'★',name:'CURTAIN CALL',description:'Start your first act.'},
  {id:'prop-debut',symbol:'🐔',name:'PROPS TO YOU',description:'Use a stage prop.'},
  {id:'prop-master',symbol:'🎭',name:'MASTER OF DISASTER',description:'Perform with all four different props.'},
  {id:'comeback-kid',symbol:'⚡',name:'COMEBACK KID',description:'Win three heckler duels.'},
  {id:'crowd-pleaser',symbol:'♥',name:'CROWD PLEASER',description:'Collect five applause reactions.'},
  {id:'ten-acts',symbol:'♫',name:'TEN ACT WONDER',description:'Cue ten acts in one session.'},
  {id:'open-mic',symbol:'✦',name:'THE WRITER IS IN',description:'Watch a joke from your Writer Room reach the stage.'}
]);
export const BADGE_STORAGE_KEY='philowe.club.badges.v1';
export function getProp(id){return STAGE_PROPS.find(p=>p.id===id)||null;}
export function duelForAct(act){
  if(!act?.comedian?.id||!Number.isInteger(act.number))return null;
  const group=DUELS[act.comedian.id];
  if(!group?.length)return null;
  // A second performance by the same act will vary the challenge.
  const round=Math.floor((act.number-1)/(act.comedian.id==='guest'?5:4));
  const challenge=group[round%group.length];
  return {...challenge,id:act.comedian.id+'-'+round%group.length};
}
export function answerDuel(duel,choice){
  if(!duel||!Number.isInteger(choice)||choice<0||choice>=duel.choices.length)return null;
  const correct=choice===duel.correct;
  return {
    correct,
    text: correct?duel.win:'The heckler grins. Even the microphone requests a second attempt next act.',
    points: correct?100:0
  };
}
export function earnedBadges(stats){
  if(!stats)return [];
  const acts=Math.max(0,Number(stats.acts)||0);
  const props=[...new Set(Array.isArray(stats.props)?stats.props:[])].filter(id=>getProp(id));
  const wins=Math.max(0,Number(stats.duelWins)||0);
  const applause=Math.max(0,Number(stats.laughs)||0);
  return BADGES.filter(b=>{
    switch(b.id){
      case 'first-show':return acts>=1;
      case 'prop-debut':return props.length>=1;
      case 'prop-master':return props.length===STAGE_PROPS.length;
      case 'comeback-kid':return wins>=3;
      case 'crowd-pleaser':return applause>=5;
      case 'ten-acts':return acts>=10;
      case 'open-mic':return !!stats.openMicPlayed;
      default:return false;
    }
  }).map(b=>b.id);
}
export function readBadges(storage){
  try{
    const raw=storage?.getItem(BADGE_STORAGE_KEY);
    if(!raw||raw.length>3000)return [];
    const value=JSON.parse(raw);
    if(!Array.isArray(value))return [];
    const valid=new Set(BADGES.map(b=>b.id));
    return [...new Set(value.filter(id=>typeof id==='string'&&valid.has(id)))];
  }catch{return [];}
}
export function writeBadges(storage,ids){
  const valid=new Set(BADGES.map(b=>b.id));
  const clean=[...new Set(ids.filter(id=>valid.has(id)))];
  storage?.setItem(BADGE_STORAGE_KEY,JSON.stringify(clean));
  return clean;
}
