function status(text,pct){if(boot45?.inspect().failed)return;boot45?.progress(text,pct);$('status').textContent=text;$('loadbar').firstElementChild.style.width=pct+'%';}
