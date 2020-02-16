
function stopStreams(stream){
	if(stream){
		stream.getVideoTracks()[0].stop();
	}else if(window.stream){
		window.stream.getTracks().forEach( (track)=> {
			track.stop();
		});
	}
}

function pausePlayback(){
	mapPause=(mapPause+1)%2;
	mapPause ? webcamVideo.pause() :  webcamVideo.play();
	if(verbose) verbPaused.innerText=webcamVideo.paused?"PAUSED":"PLAYING";
	
	let curMS=Date.now();
	fpsGrabTime=curMS+1000;
	fpsCount=0;
	
	if(mapPause==0){
		mapRender(runner);
	}
}

// I'm using the phone's face as the top, so -- 
// Rotating the phone sideways is Yaw
// Tiling the phone to the floor or sky is Pitch
// Turning to face left or right is Roll
// THIS IS INCORRECT
// But its late... soooo screw it for now
function devicePoseData(e){
	var abs=e.absolute;
	var gamma=e.gamma; // Yaw
	var beta=e.beta; // Pitch
	var alpha=e.alpha; // Roll

	if(alpha!==null){
		let piMult=0.00555555555*Math.PI;
		beta=Math.sin(beta*piMult); // Yaw
		gamma=Math.sin(-gamma*piMult); // Pitch
		alpha=Math.sin((alpha-180)*piMult); // Roll
		
		if(verbose){
			verbYaw.innerText=toHundreths(gamma);
			verbPitch.innerText=toHundreths(beta);
			verbRoll.innerText=toHundreths(alpha);
		}
		
		if(!phonePoseActive) phone_yprInit=[beta,gamma,alpha];
		phonePoseActive=true;
		phone_yprDelta=[beta-phone_ypr[0],gamma-phone_ypr[1],alpha-phone_ypr[2]];
		phone_ypr=[beta,gamma,alpha];
	}else{	
		phonePoseActive=false;
	}
} 	

function devicePoseChange(e){
	if(verbose) verbCurAngle.innerHTML( screen.orientation.angle );
}

function nextCamera(){ // Delay boot, hoping this can prevent the delays in camera switches on mobile
		if(verbose) verbPrevCamName.innerText=webcamNameList[webcamActive];
		
		webcamActive=(webcamActive+1)%webcamList.length;
		if(verbose){
			verbCurCam.innerText=webcamActive+1;
			verbCurCamName.innerText=(webcamActive+1)+" - "+webcamNameList[webcamActive];
		}
		stopStreams();
		
		if(camSafeRes[webcamActive]!=null){
			delayLoadCam=true;
		}
}

function bootCamera(){
	if(camSafeResFound){
		//stopStreams();
		if( navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
			var cons;
			var verb="";
			var cons={ video:{"deviceId":webcamList[webcamActive], "width":{"exact":camSafeRes[webcamActive][0]}, "height":{"exact":camSafeRes[webcamActive][1]}}, audio:false};
			//var cons={ video:{"deviceId":webcamList[webcamActive], "width":{"exact":1920}}, audio:false};
				navigator.mediaDevices.getUserMedia(cons).then( function success(stream) {
					webcamVideo.setAttribute("width",camSafeRes[webcamActive][0]);
					webcamVideo.setAttribute("height",camSafeRes[webcamActive][1]);
					window.stream=stream;
					window.track=stream.getVideoTracks()[0];
					webcamVideo.srcObject=stream;
					webcamVideo.autofocus=true;
					//setCanvasRes( [stream.getVideoTracks()[0].getSettings().width,stream.getVideoTracks()[0].getSettings().height], false, false);
					if(verbose) verbCamRes.innerHTML=stream.getVideoTracks()[0].getSettings().width+"x"+stream.getVideoTracks()[0].getSettings().height;
					if(webcamNameList[webcamActive]==""){
						webcamNameList=[];
						navigator.mediaDevices.enumerateDevices().then( (mediaDevices) => {
							findMediaDeviceData(mediaDevices);
						}).then(()=>{
							if(verbose){
								verbConsole.innerHTML=verb;
								verbCurCamName.innerText=webcamNameList[webcamActive];
							}
							var nameSplit=webcamNameList[webcamActive].split(" ");
							flipHorizontal=(nameSplit.indexOf("front")!=-1 || nameSplit.indexOf("front,")!=-1)?true:false;
							useFrontFlash=webcamList.length==1?true:flipHorizontal;
							filterShader.uniforms.uFlipHorizontal.value=flipHorizontal;
						});
					}else{
						var nameSplit=webcamNameList[webcamActive].split(" ");
						flipHorizontal=(nameSplit.indexOf("front")!=-1 || nameSplit.indexOf("front,")!=-1)?true:false;
						useFrontFlash=webcamList.length==1?true:flipHorizontal;
						filterShader.uniforms.uFlipHorizontal.value=flipHorizontal;
					}
					failedBootCount=0;
				}).catch( function (err){
					delayLoadCam=true;
					failedBootCount+=1;
					console.log(" Couldn't access webCam - ", err.name);
					if(verbose) verbConsole.innerHTML+=" Can't access -", err.name;
				});
		}else{
			console.log("Webcam not available");
			if(verbose) verbConsole.innerHTML="Not available";
		}
	}
}

function checkMediaRes(){
	var r=camResCheckList.pop();//camResCheckList[camResIttr];
	//if(verbose) console.log(r);
	var cons={ video:{"deviceId":{"exact":webcamList[webcamActive]}, "width":{"exact":r}}, audio:false};
	navigator.mediaDevices.getUserMedia(cons).then( function success(stream) {
			//window.stream=stream;
			//webcamVideo.srcObject=stream;
			let curCamName=stream.getVideoTracks()[0].label;
			if(curCamName==webcamNameList[webcamActive]){
				camSafeRes[webcamActive]=[ Math.max(camSafeRes[webcamActive][0], stream.getVideoTracks()[0].getSettings().width), Math.max(camSafeRes[webcamActive][1], stream.getVideoTracks()[0].getSettings().height) ];
				camSafeResValid[webcamActive].push([ stream.getVideoTracks()[0].getSettings().width, stream.getVideoTracks()[0].getSettings().height ]);
			}
			return stream;
	}).catch( (err)=>{ // Overload Error most likely - Failed to set camera to desired resolution
	}).then((stream)=>{
		camResIttr+=1;
		if(camResCheckList.length==0){
				stopStreams(stream);
				camSafeResFound=true;
				delayLoadCam=true;
				promptScreen(cameraLoading, false);
				if(verbose){
					let verb='Found Resolutions - '
					for(var x=0; x<camSafeResValid[webcamActive].length;++x){
						verb+=(x%4==0?"<br>":'')+" ["+camSafeResValid[webcamActive][x][0]+","+camSafeResValid[webcamActive][x][1]+"] ";
					}
					verb+="<br> Attempting Resolution : "+ camSafeRes[webcamActive][0] + " x " + camSafeRes[webcamActive][1];
					verb+="<br> Booting Cam "+(webcamActive+1)+"/"+webcamList.length+" - "+webcamNameList[webcamActive];
					verbConsole.innerHTML+=verb;
				}
		}
		camResChecking=false;
	});
}

function findMediaDevices(init){
    if (!navigator.getUserMedia){
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	}
	if( navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
		navigator.mediaDevices.enumerateDevices().then( (mediaDevices) => {
			findMediaDeviceData(mediaDevices);
		});
	}else{
		console.log("Webcam not available");
		if(verbose) verbConsole.innerHTML="Not available";
	}
}

function findMediaDeviceData(mediaDevices){
	var cons;
	var verb="";
	mediaDevices.forEach( (mediaDevice) => {
		if(mediaDevice.kind==='videoinput' || mediaDevice.kind==='videoInput'){
			let name=mediaDevice.label;
			verb+="<br>"+name;
			if(name!='ManyCam Virtual Webcam' && name!='screen-capture-recorder'){
				webcamList.push(mediaDevice.deviceId);
				webcamNameList.push(name);
				camSafeRes.push(null);
				camSafeResValid.push([]);
				curResId.push(0);
			}
		}
	});
	if(verbose){
		verbConsole.innerHTML=verb;
		verbPrevCamName.innerText=" -- "
		verbCurCam.innerText=webcamActive+1;
		verbCurCamName.innerText=webcamNameList[webcamActive];
		verbMaxCam.innerText=webcamList.length;
	}
	if(webcamNameList[webcamActive]==""){
		var nameSplit=webcamNameList[webcamActive].split(" ");
		flipHorizontal=(nameSplit.indexOf("front")!=-1 || nameSplit.indexOf("front,")!=-1)?true:false;
		useFrontFlash=webcamList.length==1?true:flipHorizontal;
		filterShader.uniforms.uFlipHorizontal.value=flipHorizontal;
	}
	
	if(webcamList.length == 1 ){
		document.getElementById("icon-nextCamera").style.visibility="hidden";
	}else{
		document.getElementById("icon-nextCamera").style.visibility="visible";
	} 	
}

//////////////////////////////////////

function nextRes(){
	curResId[webcamActive]=(curResId[webcamActive]+1)%camSafeResValid[webcamActive].length;
	if(verbose){
		verbConsole.innerHTML+="<br>Setting Res to - "+camSafeResValid[webcamActive][curResId[webcamActive]][0]+"x"+camSafeResValid[webcamActive][curResId[webcamActive]][1];
	}
	camSafeRes[webcamActive]=[...camSafeResValid[webcamActive][curResId[webcamActive]]];
	findPictureAspect(false);
	setCanvasRes([sW,sH], true, false);
}

//////////////////////////////////////

function toggleFlash(dom){
	useFlash=!useFlash;
	nullToggle(dom);
}

function setDeviceFlash(active=false, savePhoto=false){
	if(useFrontFlash){
		frontFlash.style.visibility=active?"visible":"hidden";
		flashActive=active;
		delaySaveShot=savePhoto;
		takeShotTime=Date.now()+flashWaitTime;
	}else{
		if(window.track){
			let imageCapture=new ImageCapture(track);
			let photoCapabilities=imageCapture.getPhotoCapabilities().then(()=>{
				window.track.applyConstraints({ advanced:[{torch:active}] }).then(()=>{
					flashActive=active;
					delaySaveShot=savePhoto;
					takeShotTime=Date.now()+flashWaitTime;
				});
			});
		}
	}
}