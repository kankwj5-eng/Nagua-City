/* Self-contained original illustrated presentation. No network requests or slideshow timer. */
window.Presentation46=(()=>{
 const ART=__ART_DATA_URL__,STYLE=__STYLE_TEXT__,$=id=>document.getElementById(id),home=$('home');
 const css=document.createElement('style');css.id='presentation47-style';css.textContent=STYLE;document.head.append(css);
 const art=document.createElement('div');art.id='menu-art47';art.setAttribute('aria-hidden','true');const image=new Image();image.alt='';image.decoding='async';image.src=ART;art.append(image);home.prepend(art);
 const mast=document.createElement('header');mast.className='menu-top47';mast.innerHTML='<b>MANAGUA</b><span>NICARAGUA / EXPLORACIÓN LIBRE</span>';home.append(mast);
 const note=document.createElement('div');note.className='menu-note47';note.textContent='EL TALLER. EL BARRIO. EL LAGO.';home.append(note);
 const intro=home.querySelector('.intro'),nodes=['start','garageOpen','homeSettings','status','loadbar'].map($);
 const brand=document.createElement('div');brand.className='brand47';brand.innerHTML='<div class="eyebrow47">TU CIUDAD, A TU RITMO</div><h1>MANAGUA</h1><div class="subtitle47">DEL TALLER AL LAGO</div><p>Elegí tu vehículo.<br>Salí a recorrer el barrio.</p>';
 const actions=document.createElement('nav');actions.className='menu-actions47';actions.setAttribute('aria-label','Menú principal');
 nodes.slice(0,3).forEach((button,i)=>{button.dataset.order='0'+(i+1);actions.append(button);});nodes[1].textContent='Elegir vehículo';nodes[2].textContent='Ajustes';
 intro.replaceChildren(brand,actions);
 const load=document.createElement('div');load.className='load47';load.append(nodes[3],nodes[4]);const percent=document.createElement('span');percent.id='percent47';percent.textContent='0%';load.append(percent);home.append(load);
 nodes[3].setAttribute('role','status');nodes[3].setAttribute('aria-live','polite');
 nodes[4].setAttribute('role','progressbar');nodes[4].setAttribute('aria-label','Preparación de la ciudad');nodes[4].setAttribute('aria-valuemin','0');nodes[4].setAttribute('aria-valuemax','100');
 let maximum=0,returnFocus=null,settingsBuilt=false;
 function progress(){const n=parseFloat(nodes[4].firstElementChild.style.width)||0;maximum=Math.max(maximum,Math.min(100,n));percent.textContent=Math.round(maximum)+'%';nodes[4].setAttribute('aria-valuenow',String(Math.round(maximum)));if(Math.abs(n-maximum)>.01)nodes[4].firstElementChild.style.width=maximum+'%';}
 function availability(){const ready=!nodes[0].disabled;nodes[1].disabled=nodes[2].disabled=!ready;load.classList.toggle('ready47',ready);home.setAttribute('aria-busy',String(!ready));if(ready){nodes[0].textContent='Entrar a la ciudad';maximum=100;nodes[4].firstElementChild.style.width='100%';}progress();}
 new MutationObserver(progress).observe(nodes[4].firstElementChild,{attributes:true,attributeFilter:['style']});new MutationObserver(availability).observe(nodes[0],{attributes:true,attributeFilter:['disabled']});availability();
 function settings(){
  if(settingsBuilt)return;settingsBuilt=true;
  const modal=$('settings'),sheet=modal.querySelector('.sheet'),panels=['ridePanel','optionsPanel','controlsPanel'].map($),tabs=$('settingsTabs');
  const buttons=[...sheet.children].find(el=>el.classList.contains('menubuttons')),credits=[...sheet.children].filter(el=>el.tagName==='DETAILS'&&el.id!=='controlsPanel');
  sheet.querySelector('.featureline')?.remove();sheet.querySelector(':scope>.kicker')?.remove();sheet.querySelector(':scope>h2')?.remove();for(const c of sheet.querySelectorAll(':scope>.credit'))panels[2].append(c);for(const c of credits)panels[2].append(c);
  const header=document.createElement('header');header.className='settings-header47';header.innerHTML='<small>MANAGUA / A TU MANERA</small><h2 id="settings-title47">Ajustes</h2><button aria-label="Cerrar ajustes">×</button>';header.querySelector('button').onclick=()=>$('resume').click();
  const body=document.createElement('div');body.className='settings-body47';const main=document.createElement('div');main.className='settings-main47';main.append(...panels);body.append(tabs,main);const footer=document.createElement('footer');footer.className='settings-footer47';if(buttons)footer.append(buttons);sheet.append(header,body,footer);if(panels[2].tagName==='DETAILS')panels[2].open=true;
  const labels=['Ciudad','Imagen y sonido','Controles'];tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Secciones de ajustes');
  function select(button){for(const p of panels)p.hidden=p.id!==button.dataset.panel;for(const b of tabs.children){const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}main.scrollTop=0;}
  [...tabs.children].forEach((button,i)=>{button.textContent=labels[i];button.id='settings-tab47-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls',button.dataset.panel);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',button.id);button.addEventListener('click',e=>{e.stopImmediatePropagation();select(button);},true);button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;tabs.children[n].focus();select(tabs.children[n]);});});
  select(tabs.querySelector('.selected')||tabs.firstElementChild);modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','settings-title47');
  function visible(){if(modal.hidden){if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});return;}returnFocus=document.activeElement;const inGame=home.hidden;header.querySelector('h2').textContent=inGame?'Partida en pausa':'Ajustes';$('resume').textContent=inGame?'Continuar':'Volver al inicio';for(const id of ['returnVehicle','backHome','openInventoryMenu'])$(id).hidden=!inGame;select(tabs.children[inGame?0:1]);header.querySelector('button').focus({preventScroll:true});}
  new MutationObserver(visible).observe(modal,{attributes:true,attributeFilter:['hidden']});
  modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=[...modal.querySelectorAll('button,input,select,summary,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(!first)return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 }
 function readyLayout(){settings();document.head.append(css);availability();}
 return {readyLayout,postals:1,artStyle:'original-urban-illustration',inspect(){return {ready:!nodes[0].disabled,progress:maximum,images:art.querySelectorAll('img').length};}};
})();
