function trafficPhase28(axis,c,center){const x=axis==='x'?c:center,z=axis==='x'?center:c;return [[-111,37],[-37,37],[37,37],[111,37],[37,-111],[37,-37],[37,111]].some(p=>p[0]===x&&p[1]===z)?signalPhase23(axis):'green';}

