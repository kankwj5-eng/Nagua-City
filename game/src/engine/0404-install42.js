async function install42(){
 status('Bloque uno · preparando materiales y sombras…',79);await maps42();finishSurfaces42();vegetation42();vehicleFinish42();locomotion42();
 updateShadowList=shadowList42;const beforeLight=lightSettings;lightSettings=function(){beforeLight();light42();};
 const beforeSettings=settings;settings=function(){beforeSettings();light42();shadowSettings42();ao42();for(const r of [...stage42.trees,...stage42.palms])r.metadata.r31=quality==='low'?65:quality==='high'?140:105;};
 const beforeFollow=follow;follow=function(dt){beforeFollow(dt);anchorShadow42();};
 const panel=$('optionsPanel')||$('settings').querySelector('.sheet'),label=document.createElement('div');label.className='setting';label.innerHTML='<b>Luz y vegetación</b><label style="display:block;margin-top:8px">Sombras<select id="shadow42"><option value="soft">Suaves · recomendadas</option><option value="cinema">Cinemáticas · calidad alta</option></select></label><label style="display:block;margin-top:8px"><input id="ao42" type="checkbox" style="width:auto"> Oclusión ambiental · calidad alta</label><label style="display:block;margin-top:8px"><input id="plants42" type="checkbox" checked style="width:auto"> Árboles y palmeras</label><small>La iluminación cinematográfica y la oclusión aumentan el trabajo gráfico. El modo suave conserva sombras en calidad ligera.</small>';panel.append(label);
 $('shadow42').onchange=()=>{stage42.settings.shadow=$('shadow42').value;shadowSettings42();};$('ao42').onchange=()=>{stage42.settings.ao=$('ao42').checked;ao42();};$('plants42').onchange=()=>stage42.settings.vegetation=$('plants42').checked;
 scene.onBeforeRenderObservable.add(()=>{if(!stage42.settings.vegetation)for(const r of [...stage42.trees,...stage42.palms])r.setEnabled(false);});
 light42();shadowSettings42();lightsNeighborhood42();
}

