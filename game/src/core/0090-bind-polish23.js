function bindPolish23(){
 $('garageOpen').onclick=()=>{homeGarage=true;$('home').classList.add('garage-open');camera._track=null;camera._offset=null;selectModel(selected);};
 $('garageClose').onclick=()=>{homeGarage=false;$('home').classList.remove('garage-open');camera._track=null;camera._offset=null;};
 $('combatToggle').onclick=()=>$('hud').classList.toggle('combat-open');
 $('zoomIn').onclick=()=>zoomCamera(-.16);$('zoomOut').onclick=()=>zoomCamera(.16);
 $('resetCamera').onclick=()=>{yaw=driving?-state.heading:-player.root.rotation.y;pitch=.23;cameraRig.zoomTarget=1;camMode=0;};
 for(const b of $('paintChoices').children)b.onclick=()=>{repaint(current,b.dataset.paint);for(const p of $('paintChoices').children)p.classList.toggle('selected',p===b);};
 $('optionsAudio').onclick=()=>$('audioButton').click();$('optionsLandscape').onclick=enterLandscape;
 document.addEventListener('keydown',e=>{if(!playing||e.target.tagName==='INPUT')return;if(e.code==='Equal'||e.code==='NumpadAdd')zoomCamera(-.1);if(e.code==='Minus'||e.code==='NumpadSubtract')zoomCamera(.1);});
}
