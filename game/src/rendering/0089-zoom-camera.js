function zoomCamera(delta){cameraRig.zoomTarget=clamp(cameraRig.zoomTarget*Math.exp(delta),.55,1.9);}
