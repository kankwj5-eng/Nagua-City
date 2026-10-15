function openInventory(){if(!ready||driving)return;inventoryWasPlaying=playing;playing=false;clearInput();$('inventory').hidden=false;refreshEquipmentUI();}
