function install41(){
 neighborhood41();
 const before=settings;settings=function(){before();for(const r of stage41.detailRoots)r.metadata.r31=quality==='low'?38:quality==='high'?100:70;};
 // Keep simulation HUD useful on a phone without permanently occupying the view.
 const panel=$('optionsPanel')||$('settings').querySelector('.sheet');const section=document.createElement('div');section.className='setting';section.innerHTML='<b>Acabado V41</b><label style="display:block;margin-top:10px"><input id="feet41" type="checkbox" disabled style="width:auto"> La postura se obtiene del GLB nuevo</label><label style="display:block;margin-top:10px"><input id="detail41" type="checkbox" checked style="width:auto"> Cerámica y vegetación de portales</label><small>Los detalles comparten geometrías y se ocultan a distancia.</small>';panel.append(section);
 $('feet41').onchange=()=>stage41.settings.feet=$('feet41').checked;
 $('detail41').onchange=()=>{stage41.settings.detail=$('detail41').checked;for(const r of stage41.detailRoots)r.setEnabled(stage41.settings.detail);};
 // Streamer may enable roots again: hide disabled detail roots before each render.
 scene.onBeforeRenderObservable.add(()=>{if(!stage41.settings.detail)for(const r of stage41.detailRoots)if(r.isEnabled())r.setEnabled(false);});
 const dash=$('dashboard'),readout=document.createElement('div');readout.id='dynamics41';readout.style.cssText='font-size:10px;color:#d1dcce;min-width:55px';dash.append(readout);
 const ui=updateUI;updateUI=function(){ui();readout.hidden=!driving;if(driving)readout.textContent=state.shiftTimer41>.22?'CAMBIO':Math.abs((state.speed||0)*(state.yawRate||0)/9.81).toFixed(2)+' G';};
}
