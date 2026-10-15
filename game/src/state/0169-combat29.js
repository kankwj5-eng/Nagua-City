var Combat29=(()=>{
 function create(){return {stamina:100,lastStrike:-100,lastHand:'r',combo:0,aim:false,blocked:false,blockSince:-100};}
 function advance(s,dt,block,now){dt=Math.max(0,Math.min(dt,.1));if(block&&!s.blocked)s.blockSince=now;s.blocked=!!block&&s.stamina>2;s.stamina=Math.min(100,s.stamina+dt*(s.blocked?5:now-s.lastStrike>.6?18:4));return s;}
 function strike(s,now,weapon='hands'){const cost=weapon==='hands'?12:20,cool=weapon==='hands'?.55:.75;if(now-s.lastStrike<cool||s.stamina<cost)return false;s.combo=now-s.lastStrike<1.25?(s.combo+1)%2:0;s.lastHand=s.combo?'l':'r';s.lastStrike=now;s.stamina-=cost;return true;}
 function incoming(s,damage,front,ranged,now){if(ranged||!s.blocked||front<.2||s.stamina<10)return damage;s.stamina-=10;return damage*(now-s.blockSince<.22?.15:.4);}
 return {create,advance,strike,incoming};
})();
