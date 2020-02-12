'use strict';

function boot(){
	if(verbose){
		console.log(mapToDoList);
		console.log("Verbose console logs are ON");
	}
	window.addEventListener('onbeforeunload', stopStreams);
	document.onmousemove=function(e){mapOnMove(e);};
	document.onmousedown=function(e){mapOnDown(e);};
	document.onmouseup=function(e){mapOnUp(e);};
    //document.addEventListener(mouseWheelEvt, function(e) {mouseWheel(e);}, false)
	window.onresize=function(e){resizeRenderResolution();};
	
	document.addEventListener('touchstart', function(e) {startTouch(e);}, false);
	document.addEventListener('touchmove', function(e) {doTouch(e);}, false);
	document.addEventListener('touchend', function(e) {endTouch(e);}, false);
	
	window.addEventListener('deviceorientation', devicePoseData);
	window.addEventListener('orientationchange', devicePoseChange);
	
	iconTray=document.getElementById('iconTray');
	cameraLoading=document.getElementById('cameraLoadingBlock');
	
	verbBlock=document.getElementById('verbose');
	verbFPS=document.getElementById('verbose_fps');
	verbDeviceRes=document.getElementById('verbose_deviceRes');
	verbCurCam=document.getElementById('verbose_curCamNumber');
	verbCurCamName=document.getElementById('verbose_curCamName');
	verbPrevCamName=document.getElementById('verbose_prevCam');
	verbMaxCam=document.getElementById('verbose_maxCamNumber');
	verbPaused=document.getElementById('verbose_paused');
	verbConsole=document.getElementById('verbose_console');
	
	verbCamRes=document.getElementById('verbose_curCamRes');
	verbYaw=document.getElementById('verbose_yaw');
	verbPitch=document.getElementById('verbose_pitch');
	verbRoll=document.getElementById('verbose_roll');
	verbCurAngle=document.getElementById('verbose_curAngle');

	if(verbose){
		verbBlock.style.display='inline';
		verbDeviceRes.innerHTML=sW+"x"+sH;
	}
	mapCanvas=document.getElementById(pxlCamCore);
	mapW=window.innerWidth*mapResPerc;
	mapCanvas.width=window.innerWidth;
	mapH=window.innerHeight*mapResPerc;
	mapCanvas.height=window.innerHeight;
	mapBootEngine();
	mapRender(runner);
	//mapPrepGUI();
	//launchFullscreen(mapCanvas);
}

function getMouseXY(e){
	e.preventDefault();
	if(touchScreen==0){
		mouseX=e.clientX;
		mouseY=e.clientY;
	}else{
		if(e.touches){
			touch = e.touches[0];
			mouseX = touch.pageX;
			mouseY = touch.pageY;
		}
	}
	mapMouse.x=(mouseX/sW)*2 - 1;
	mapMouse.y=-(mouseY/sH)*2 + 1;
}

function mapOnDown(e){
	e.preventDefault();
	mouseButton=e.which;
	xyDeltaData.active=1;
	xyDeltaData.mode=mouseButton;
	xyDeltaData.startPos=new THREE.Vector2(mouseX,mouseY);
	xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
	xyDeltaData.dragCount=0;
}
function mapOnMove(e){
	e.preventDefault();
	getMouseXY(e);
	if(xyDeltaData.active==1){
		xyDeltaData.dragCount++;
		if(xyDeltaData.dragCount == 8){
			if(xyDeltaData.latched==0){
				setCursor("grabbing");
			}
			xyDeltaData.latched=1;
		}
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);		
		stepShaderValues();
	}
}
function mapOnUp(e){
	e.preventDefault();
	
	xyDeltaData.dragCount++;
	xyDeltaData.dragTotal+=xyDeltaData.dragCount;
	xyDeltaData.active=0;
	xyDeltaData.latched=0;
	xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
}
function mapOnExitMode(){
	xyDeltaData.startPos=new THREE.Vector2(0,0);
	xyDeltaData.endPos=new THREE.Vector2(0,0);
	xyDeltaData.dragTotal=1;
	
	xyDeltaData.netDistance[0]=0;
	xyDeltaData.netDistance[1]=0;
	xyDeltaData.netDistance[2]=0;
	xyDeltaData.latchMatrix=null;
	mouseWheelDelta=0;
	pxlCamCameraObjLatchOffset=[0,0];
	setCursor("default");
	pxlCamCameraObjLatchPrev=null;
}
function mouseWheel(e){ // Scroll wheel
	//Ehhhh IE be damned...
	// ... Bleh ... I'll address issues after MAP is done
	var delta=Math.sign(e.detail || e.wheelDelta);
	mouseWheelDelta+=delta;
	if(pxlCamCameraMode == 2){
		mouseWheelDelta=Math.max(-10, mouseWheelDelta);
		if(delta<0){
			xyDeltaData.netDistance[0]*=.9;
			xyDeltaData.netDistance[2]*=.9;
		}else{
			var blend=.5;
			objRaycast.setFromCamera(mapMouse,pxlCamCamera);
			var rayHits=objRaycast.intersectObjects([geoList['table'][0]]);
			var objRayCurPos=new THREE.Vector3(xyDeltaData.netDistance[0],xyDeltaData.netDistance[1],xyDeltaData.netDistance[2]);
			if(rayHits.length > 0){
				for(var x=0; x<rayHits.length;++x){
					var obj=rayHits[x].object;
					objRayCurPos=rayHits[x].point;
					break;
				}
				objRayCurPos.sub(pxlCamCamera.position).multiplyScalar(3).multiplyScalar(-1*(Math.max(0,mouseWheelDelta/3)));
				xyDeltaData.netDistance[0]=xyDeltaData.netDistance[0]+ objRayCurPos.x;//*blend;
				xyDeltaData.netDistance[2]=xyDeltaData.netDistance[2]+ objRayCurPos.z;//*blend;
			}
		}
	}
}

function resizeRenderResolution(){
	mapW=(sW=window.innerWidth)*mapResPerc;
	mapH=(sH=window.innerHeight)*mapResPerc;
	verbDeviceRes.innerHTML=sW+"x"+sH;
	setCanvasRes([sW,sH]);
}
function setCanvasRes(res,save=false){
	mapW=res[0];
	mapH=res[1];
	
	findPictureAspect(save);
	bootCamera();
	
	mapCanvas.width=mapW;
	mapCanvas.height=mapH;
	pxlCamEngine.setPixelRatio(1);//window.devicePixelRatio*mapResPerc);
	pxlCamEngine.setSize(mapW/mapResPerc, mapH/mapResPerc);
	pxlCamCamera.aspect=mapW/mapH;
	pxlCamCamera.updateProjectionMatrix();
	pxlCamRenderTarget=new THREE.WebGLRenderTarget(mapW,mapH,{
		minFilter:THREE.LinearFilter,
		magFilter:THREE.LinearFilter,
		format:THREE.RGBFormat,
		stencilBuffer:false
	});
	buildShaderPass(true, (save?((res[0]+res[1])/(sW+sH)):1) );
	
	smartBlurShader.uniforms.uResScaleX.value=1/res[1];
	smartBlurShader.uniforms.uResScaleY.value=1/res[0];
	filterShader.uniforms.uResScaleX.value=1/res[0];
	filterShader.uniforms.uResScaleY.value=1/res[1];
	pxlCamComposer.render();
	pxlCamShaderComposer.render();
}

document.onkeyup=function(e){keyUpCall(e);};
function keyUpCall(e){
	e.preventDefault();
	let keyHit=e.keyCode || e.which;
	// Space
	if(keyHit == 32){
		pausePlayback();
	}
	// F
	if(keyHit == 70){
	}
	// M
	if(keyHit == 77){
	}
	// R
	if(keyHit == 82 && loadFullTome==1){
		mapBookOpenToggle();
	}
	// Left
	if(keyHit == 37 && loadFullTome==1){
	}
	// Right
	if(keyHit == 39 && loadFullTome==1){
	}
}


function startTouch(e) {
	touchScreen=1;
	var touch = e.touches[0];
	mouseX = touch.pageX;
	mouseY = touch.pageY;
	xyDeltaData.active=1;
	xyDeltaData.mode=mouseButton;
	xyDeltaData.startPos=new THREE.Vector2(mouseX,mouseY);
	xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
	xyDeltaData.dragCount=0;
}

function doTouch(e) {
	var touch = e.touches[0];
	if(typeof(e.touches[1]) !== 'undefined'){
		var touchTwo = e.touches[1];
	}
	mouseX=touch.pageX;
	mouseY=touch.pageY;
	
	if(xyDeltaData.active==1){
		xyDeltaData.dragCount++;
		if(xyDeltaData.dragCount == 8){
			if(xyDeltaData.latched==0){
				setCursor("grabbing");
			}
			xyDeltaData.latched=1;
		}
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
		stepShaderValues();
	}
}
function endTouch(e) {
	var touch = e.touches[0];
	//getMouseXY(e);
	xyDeltaData.dragCount++;
	xyDeltaData.dragTotal+=xyDeltaData.dragCount;
	xyDeltaData.active=0;
	xyDeltaData.latched=0;
	xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
}

function setCursor(cursorType){
	if(cursorType == "activeLatch"){
		if(mouseButton==0){
			cursorType="grab";
		}else if(mouseButton==1){
			cursorType="grabbing";
		}else if(mouseButton==2){
			cursorType="all-scroll";
		}
	}else{
		prevCursor=null;
	}
	document.body.style.cursor=cursorType;
}

function promptScreen(screenObj, vis){
	if(typeof(screenObj)=="string"){
		screenObj=document.getElementById(screenObj);
	}
	if(screenObj.classList.value.indexOf("fader")<0){
		screenObj.classList.add("fader");
	}
	if(vis){
		screenObj.classList.remove("visOff");
		screenObj.classList.add("visOn");
	}else{
		screenObj.classList.remove("visOn");
		screenObj.classList.add("visOff");
	}
}

//////////////////////////////////////

function mapBootEngine(){
	
	// Rederer
	pxlCamEngine=new THREE.WebGLRenderer({
		canvas: mapCanvas,
		antialias: true,
		preserveDrawingBuffer:true,
	});
	//pxlCamEngine.autoClear=false;
	pxlCamEngine.setClearColor(0x000000);
	pxlCamEngine.setPixelRatio(1);//window.devicePixelRatio);
	pxlCamEngine.setSize(mapW/mapResPerc, mapH/mapResPerc);
	//pxlCamEngine.gammaOutput=true;
	
	pxlCamRenderTarget=new THREE.WebGLRenderTarget(mapW,mapH,{
		minFilter:THREE.LinearFilter,
		magFilter:THREE.LinearFilter,
		format:THREE.RGBFormat,
		stencilBuffer:false
	});
	
	//texLoader=new THREE.ImageLoader();
	
	/////////////////////////////////////////////
	//Shadow Maps-
	pxlCamEngine.shadowMap.enabled=true;
	if(mobile==3){
		pxlCamEngine.shadowMap.type=THREE.BasicShadowMap;
	}else{
		pxlCamEngine.shadowMap.type=THREE.PCFSoftShadowMap;//PCFScatterShadowMap;//PCFShadowMap;//PCFSoftShadowMap;
		//pxlCamEngine.shadowMap.type=THREE.PCFSoftShadowMap;
	}
	
	var aspectRatio=mapCanvas.width/mapCanvas.height;
	pxlCamCamera=new THREE.PerspectiveCamera(35,aspectRatio, 1, 3000);
	pxlCamCamera.position.z=130;
	pxlCamCamera.target=new THREE.Vector3(0,0,0);
	pxlCamScene=new THREE.Scene();
	//mapProcessScene=new THREE.Scene();
	
	var textureList;
	var transformList;
	/*
	var ground=new THREE.PlaneGeometry(400,250,100,100);
	var groundMat;
	if(mobile==1){
		groundMat=new THREE.MeshLambertMaterial();
	}else{
		groundMat=new THREE.MeshStandardMaterial();
	}
	
	var groundMesh=new THREE.Mesh(ground,groundMat);
	groundMesh.material.emissive=new THREE.Color( 0x101010 );
	groundMesh.material.roughness=.9;
	groundMesh.rotation.x=-90*(Math.PI/180);
	groundMesh.position.z=-50;
	pxlCamScene.add(groundMesh);
	
	groundMesh.receiveShadow=true;
	geoList["table"]=[groundMesh,ground];
	*/
	/*
	var ambLight=new THREE.AmbientLight(0xffffff,.1);
	pxlCamScene.add(ambLight);
	
	var ambLightMask=new THREE.AmbientLight(0xffffff,1);
	mapProcessScene.add(ambLightMask);
	*/
	
	webcamVideo=document.getElementById("webcamVideo");
	webcamVideo.setAttribute("autoplay", "");
	webcamVideo.setAttribute("muted", "");
	webcamVideo.setAttribute("playsinline", "");
	
	webcamResChecker=document.getElementById("webcamResChecker");
	webcamResChecker.setAttribute("autoplay", "");
	webcamResChecker.setAttribute("muted", "");
	webcamResChecker.setAttribute("playsinline", "");
	
	if(verbose){
		webcamVideo.onloadedmetadata=()=>{
			if(camSafeResFound){
				verbConsole.innerHTML+="<br> "+webcamVideo.width+ "x"+webcamVideo.height+" || "+ webcamVideo.videoWidth + "x"+ webcamVideo.videoHeight+" ||  "+webcamNameList[webcamActive];
				webcamVideo.play();
			}
			if(camSafeResFound && camSafeResBooting && !camSafeResBooted){
				camSafeResBooted=true;
				verbConsole.innerHTML+="<br>"+webcamVideo.videoWidth+" x "+webcamVideo.videoHeight;
			}
		}
	}else{
		webcamVideo.onloadedmetadata=()=>{
			webcamVideo.play();
		}
	}
	
	vidTexture=new THREE.VideoTexture(webcamVideo);
	vidTexture.minFilter=THREE.LinearFilter;
	vidTexture.magFilter=THREE.LinearFilter;
	vidTexture.format=THREE.RGBFormat;
	
	vidGeo=new THREE.PlaneBufferGeometry(16, 9);
	vidGeo.scale(.5,.5,.5);
	vidMat=new THREE.MeshBasicMaterial({map:vidTexture});
	vidMesh=new THREE.Mesh(vidGeo, vidMat);
	vidMesh.lookAt(pxlCamCamera.position);
	pxlCamScene.add(vidMesh);
	
	findMediaDevices();
	
	///////////////////////////////////////////////////////
	buildShaderPass(true);
	
}