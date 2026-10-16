function refreshEquipmentUI(){
 if(!itemDefinitions[equipped])equipped='hands';
 const item=itemDefinitions[equipped];
 $('equippedName').textContent=item.name;
 $('equippedAmmo').textContent='I: mochila · F: '+(equipped==='hands'?'pelear':'usar herramienta');
 $('useItem').textContent=item.action;
 $('reloadHUD').hidden=true;$('reloadItem').hidden=true;
 for(const button of $('inventoryChoices').children){
  const allowed=!!itemDefinitions[button.dataset.item];
  button.hidden=!allowed;
  button.disabled=!allowed;
  button.classList.toggle('selected',allowed&&button.dataset.item===equipped);
 }
 $('itemDescription').textContent=item.desc;
}
