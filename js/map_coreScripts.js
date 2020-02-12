
function launchFullscreen(domObj){
	if(domObj.requrestFullscreen){
		domObj.requestFullscreen();
	}else if(domObj.mozRequestFullScreen){
		domObj.mozRequestFullScreen();
	}else if(domObj.webkitRequestFullscreen){
		domObj.webkitRequestFullscreen();
	}else if(domObj.msRequestFullscreen){
		domObj.msRequestFullscreen();
	}
}

function toHundreths(val){ // int(val*100)*.01 returns an erronious float on semi ussual basis...
	if(val===null) return "null";

	let sp=(val+"").split(".");
	if(sp.length == 1){
		return val;
	}else{
		let ret=sp[0]+"."+sp[1].substr(0,2);
		return ret;
	}
}

function degToRad(deg){
	return deg*(Math.PI/180);
}


function mapRender(){
	runner++;
	var curMS=Date.now();
	let delta=(curMS-startTime);
	if(runSmartBlur){
		if(delta/30<.7){
			runSmartBlur=false;
			buildShaderPass(true);
		}
	}
	if(verbose){
		verbPaused.innerText=webcamVideo.paused?"PAUSED":"PLAYING";
		fpsCount++;
		verbFPS.innerText=delta+" ms - "+fpsAvg+" fps average" ;
		if(curMS>fpsGrabTime){
			fpsGrabTime=curMS+1000;
			
			fpsAvg=fpsAvg==0?fpsCount: (fpsAvg*2+fpsCount)*.33333333333333;
			fpsAvg=(fpsAvg+"").substr(0,5);
			fpsCount=0;
		}
	}
	startTime=curMS;
	
	if(camSafeRes[webcamActive]==null){
		camResCheckList=[...camResOrigCheckList];
		let r=camResCheckList[0];
		r=sH>sW?[r[1],r[0]]:r;
		camSafeRes[webcamActive]=[0,0];
		camResChecking=false;
		camSafeResFound=false;
		camSafeResBooting=false;
		camSafeResBooted=false;
		if(verbose) verbConsole.innerHTML="";
		promptScreen(cameraLoading, true);
	}
	if(camResCheckList.length>0 && !camResChecking){
		camResChecking=true;
		checkMediaRes();
	}
	if(delayLoadCam){
		// Failed to boot the camera over 5 times - change to next camera
		// I've never seen two fails in a row, but the case may come up
		if(failedBootCount>5){ 
			delayLoadCam=true;
			failedBootCount=0;
			nextCamera();
		}else{
			delayLoadCam=false;
			findPictureAspect();
			bootCamera();
		}
	}
	if(camSafeResFound){
		pxlCamComposer.render();
		pxlCamShaderComposer.render();
	}
	
	if(mapPause == 0){
		requestAnimationFrame(mapRender);
	}
}