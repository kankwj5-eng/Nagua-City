function installCombat29(){
 const originalEquip=equipItem;
 equipItem=function(name){
  if(!itemDefinitions[name])return;
  if(!city.state.owned?.[name]&&name!=='hands'){toast('Esta herramienta se consigue en la ferretería.');return;}
  originalEquip(name);
 };
 const originalRefresh=refreshEquipmentUI;
 refreshEquipmentUI=function(){
  originalRefresh();
  for(const button of $('inventoryChoices').children){
   const allowed=!!itemDefinitions[button.dataset.item];
   button.hidden=!allowed;
   button.disabled=!allowed||!city.state.owned?.[button.dataset.item];
   button.title=allowed?(button.disabled?'Disponible en ferretería':'Equipar'):'No disponible en este juego';
  }
 };
 const hud=document.createElement('div');
 hud.id='stamina29';hud.setAttribute('role','meter');hud.setAttribute('aria-label','Resistencia');
 hud.setAttribute('aria-valuemin','0');hud.setAttribute('aria-valuemax','100');
 hud.innerHTML='<span></span>';$('hud').append(hud);
 refreshEquipmentUI();
}
