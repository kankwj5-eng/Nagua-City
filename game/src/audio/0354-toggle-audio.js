function toggleAudio(){startAudio();if(!audio)return;audio.muted=!audio.muted;audio.master.gain.setTargetAtTime(audio.muted?0:volume,audio.ctx.currentTime,.05);$('audioButton').textContent=audio.muted?'SONIDO: APAGADO':'Sonido activado';}

