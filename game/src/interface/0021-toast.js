function toast(s){$('toast').textContent=s;$('toast').style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.opacity=0,2800);}
