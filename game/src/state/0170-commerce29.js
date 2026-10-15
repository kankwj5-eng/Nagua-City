var Commerce29=(()=>{
 const weapons=['pistol','rifle','shovel','bat'];
 function purchase(s,item,nearVehicle=false){if(!Number.isFinite(item.price)||item.price<0||s.cash<item.price)return false;if(item.type==='weapon'){if(!weapons.includes(item.weapon)||s.owned[item.weapon])return false;s.owned[item.weapon]=true;}else if(item.type==='paint'){if(!nearVehicle||!['blue','red','white','black','emerald'].includes(item.paint))return false;}else return null;s.cash-=item.price;s.purchases++;return true;}
 return {purchase};
})();
