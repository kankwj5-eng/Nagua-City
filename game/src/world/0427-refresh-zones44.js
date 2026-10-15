function refreshZones44(force=false){
 technical44.streamRequests++;streamForce44=streamForce44||force;
 if(streamJob44){streamAgain44=true;technical44.streamCoalesced++;return streamJob44;}
 streamJob44=(async()=>{streamWorkers44++;technical44.maxStreamWorkers=Math.max(technical44.maxStreamWorkers,streamWorkers44);try{do{streamAgain44=false;const forced=streamForce44;streamForce44=false;await streamPass44(forced);}while(streamAgain44);}finally{streamWorkers44--;streamJob44=null;}})();return streamJob44;
}
// Block 02: identical zone selection, ordering, radii and load budgets.
