function signalPhase23(axis,t=traffic23.clock){const phase=t%44;return axis==='x'?(phase<18?'green':phase<21?'yellow':'red'):(phase>=23&&phase<41?'green':phase>=41?'yellow':'red');}
