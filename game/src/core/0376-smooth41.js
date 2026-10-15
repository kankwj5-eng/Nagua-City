function smooth41(a,b,rate,dt){return a+(b-a)*(1-Math.exp(-rate*Math.min(.1,Math.max(0,dt))));}
