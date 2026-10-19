function bindStage21(){
 const filter=()=>{
  const type=$('garageFilters').querySelector('.selected')?.dataset.filter||'all';
  const query=$('garageSearch').value.trim().toLocaleLowerCase('es');
  for(const b of $('modelchoices').children){
   const v=originalV4.spec().vehicles.find(x=>x.id===b.dataset.model);
   const motor=v?.type==='moto',camioneta=v?.type==='camioneta',caponera=v?.type==='caponera';
   const match=type==='all'||type==='bike'&&motor||type==='car'&&camioneta||
     type==='pickup'&&camioneta||type==='service'&&caponera;
   b.hidden=!match||!(v?.name||v?.id||'').toLocaleLowerCase('es').includes(query);
  }
  $('garageResults').textContent=[...$('modelchoices').children].filter(x=>!x.hidden).length+' modelos';
 };
 for(const button of $('garageFilters').children)button.onclick=()=>{
  for(const x of $('garageFilters').children)x.classList.toggle('selected',x===button);filter();
 };
 $('garageSearch').oninput=filter;filter();
 for(const b of document.querySelectorAll('[data-panel]'))b.onclick=()=>{for(const x of document.querySelectorAll('[data-panel]'))x.classList.toggle('selected',x===b);for(const id of ['ridePanel','optionsPanel','controlsPanel'])$(id).hidden=id!==b.dataset.panel;if(b.dataset.panel==='controlsPanel')$('controlsPanel').open=true;};$('viewFirst').onclick=()=>{if(!driving||!current.bike){toast('Subí a una moto para usar la vista del manillar.');return;}camMode=3;camera._track=null;camera._offset=null;pause(false);};$('viewThird').onclick=()=>{camMode=0;pause(false);};$('sandinoRoute').onclick=()=>{waypoint={x:-341,z:37};$('routeText').textContent='Ciudad Sandino · dirección marcada, sin cálculo de ruta';pause(false);toast('Seguí la avenida hacia el oeste.');};}
