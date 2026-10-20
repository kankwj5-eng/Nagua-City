function bindGarageFilters(){
 const all=[...$('garageFilters').children],choices=$('modelchoices');
 const filter=()=>{
  const type=all.find(b=>b.classList.contains('selected'))?.dataset.filter||'all';
  for(const b of choices.children){
   const meta=originalV4.spec().vehicles.find(x=>x.id===b.dataset.model);
   const bike=meta?.type==='moto',car=meta?.type==='camioneta',service=meta?.type==='caponera';
   b.hidden=!(type==='all'||type==='bike'&&bike||type==='car'&&car||
     type==='pickup'&&car||type==='service'&&service);
  }
 };
 for(const button of all)button.onclick=()=>{
  for(const b of all)b.classList.toggle('selected',b===button);
  filter();
  const selectedButton=[...choices.children].find(b=>b.dataset.model===selected);
  if(selectedButton?.hidden){
   const first=[...choices.children].find(b=>!b.hidden);
   if(first)selectModel(first.dataset.model);
  }
 };
 filter();
}
