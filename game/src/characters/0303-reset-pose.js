function resetPose(person){
 if(!person)return;
 if(person===player)riderVisibility24(false);
 renderRestore=null;renderPrevious=null;
 originalV4.restorePerson(person);
}
