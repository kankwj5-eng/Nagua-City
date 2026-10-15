function storyDialogue42(lines,title='Cuando vuelve la luz'){
 story42.previousPlaying=playing;playing=false;clearInput();story42.dialogue=true;$('storyDialogue42').hidden=false;$('storyHeading42').textContent=title;const box=$('storyLines42');box.replaceChildren();for(const [name,line] of lines){const p=document.createElement('p'),b=document.createElement('b');b.textContent=name+': ';p.append(b,document.createTextNode(line));box.append(p);}
}
