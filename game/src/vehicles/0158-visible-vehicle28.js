function visibleVehicle28(v,distance){if(v.retired28)return false;if(v.garage&&v!==current)return false;return v===current||distance<(v.traffic?110:v.cityPatrol?90:70)**2;}

