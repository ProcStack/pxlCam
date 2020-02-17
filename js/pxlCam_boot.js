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
	//window.addEventListener('orientationchange', devicePoseChange); // Don't know when this ever fires, docs seem like it should run tho
	
	menuBlock=document.getElementById('menuBlock');
	photoBinMenu=document.getElementById('photoBinMenu');
	menuExit=document.getElementById('menuExit');
	
	iconTray=document.getElementById('iconTray');
	thumbnailText=document.getElementById('thumbnailText');
	thumbnailImage=document.getElementById('thumbnailImage');
	cameraLoading=document.getElementById('cameraLoadingBlock');
	alignLines=document.getElementById('alignLines');
	frontFlash=document.getElementById('frontFlash');
	
	buildCameraLoadingPrompt();
	buildIcons();
	buildPhotoBin();
	setAlignLines();
	if(verbose) prepVerbose();
	
	pxlCanvas=document.getElementById(pxlCamCore);
	pxlW=window.innerWidth*mapResPerc;
	pxlCanvas.width=window.innerWidth;
	pxlH=window.innerHeight*mapResPerc;
	pxlCanvas.height=window.innerHeight;
	mapBootEngine();
	pxlRender(runner);
	//mapPrepGUI();
	//launchFullscreen(pxlCanvas);
}

//////////////////////////////////////

function buildCameraLoadingPrompt(){
	let textDiv=document.getElementById("cameraLoadingText");
	let html=`
		<span class="header"> Loading <span id="curLoadingCam">Camera</span></span>
		<br><span class="detect">[- Finding camera info -]</span>
		<br><span class="sub">( Occurs once per camera )</span>
	`;
	textDiv.innerHTML=html;
}

function buildPhotoBin(){
	let html=`
		<table border=0 cellpadding=0 cellspacing=0 class="menuBody">
		<tr><td><div class="menuTitle">Photo Bin</div></td></tr>
		<tr><td height="100%" valign="top" id="menuScroller" class="menuScroller">
			<div id="photoBinScroller" class="menuScrollerInner">
				<div class="photoBinEmpty">Photos you take will show up here.</div>
			</div></td></tr>
		<tr><td><div class="menuExitButton" onclick="closeActiveMenu(false);">Exit Menu </div></td></tr>
		</table
	`;
	photoBinMenu.innerHTML=html;
	let parentScroller=document.getElementById('menuScroller');
	let scroller=document.getElementById('photoBinScroller');
	scroller.style.height=parentScroller.offsetHeight;
}

function buildIcons(){
	let iconAdds=["thumbnailImage"];
	let iconList=[...document.getElementById("iconTray").children, ...iconAdds.map((i)=>document.getElementById(i))];
	iconList.map(d=>{
		let scalar=d.hasAttribute("scale")?parseFloat(d.getAttribute("scale")):1;
		let size=Math.min(sW,sH)*((d.classList.contains('large')?.12:.07)*(mobile?2.5:1)*scalar);
		let div=document.getElementById(d);
		d.style.width=size;
		d.style.height=size;
		if(!d.classList.contains('iconNextCamera')) d.style.visibility="visible";
		if(d.hasAttribute("draw")){
			let draw=d.getAttribute("draw");
			let can=document.createElement("canvas");
			can.width=size;
			can.height=size;
			can.classList.add("drop");
			d.innerHTML="";
			d.appendChild(can);
			drawIcon(can, draw, [size,size]);
			if(draw=="nextCam"){
				let box=document.createElement("div");
				box.classList.add("iconNextCameraBox");
				box.classList.add("drop");
				d.appendChild(box);
			}
		}
	});
	thumbnailCanvas=thumbnailImage.children[0];
}

function prepVerbose(){
	verbBlock=document.getElementById('verbose');
	let innerVerbose=`
		<div id="verbose_fps"></div>
		<div id="verbose_deviceResData">
			Device Res : <span id="verbose_deviceRes">--</span>
		</div>
		<div id="verbose_camData">
			Current Camera : <span id="verbose_curCamName"></span> - <span id="verbose_curCamNumber"></span> of <span id="verbose_maxCamNumber"> - <span id="verbose_paused">PAUSED</span>
		</div>
		<div id="verbose_camRes">
			Current Camera Res : <span id="verbose_curCamRes">--</span>
		</div>
		<div id="verbose_camPausedState">
			Orientation : Yaw - <span id="verbose_yaw">-</span> ; Pitch - <span id="verbose_pitch">-</span> ; Roll - <span id="verbose_roll">-</span> ;
		</div>
		<!-- <div id="verbose_camOrientationAngle">
			Device Angle : <span id="verbose_curAngle">--</span>
		</div> -->
		<div id="verbose_prevCamData">
			Previous Camera :</span> <span id="verbose_prevCam"></span>
		</div>
		<br>
		<div id="verbose_spacer"> --- --- Console --- ---</div>
		<div id="verbose_console"></div>
	`;
	let alDom=document.getElementById("icon-alignLines");
	let topOff=alDom.offsetTop*2+parseFloat(alDom.style.height);
	verbBlock.style.top=topOff;
	verbBlock.style.left=3;
	verbBlock.innerHTML=innerVerbose;
	
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
	
	verbBlock.style.display='inline';

	verbDeviceRes.innerHTML=sW+"x"+sH;
	
	window.onerror=(msg,source,line,col,err)=>{
		verbConsole.innerHTML=msg;
		verbConsole.innerHTML+="<br>"+source;
		verbConsole.innerHTML+="<br>Line - "+line+" | Col - "+col;
		verbConsole.innerHTML+="<br>"+err;
	};
}

//////////////////////////////////////

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
	if(keyHit == 82){
	}
	// Left
	if(keyHit == 37){
	}
	// Right
	if(keyHit == 39){
	}
}

//////////////////////////////////////

function resizeRenderResolution(){
	pxlW=(sW=window.innerWidth)*mapResPerc;
	pxlH=(sH=window.innerHeight)*mapResPerc;
	if(verbose) verbDeviceRes.innerHTML=sW+"x"+sH;
	setCanvasRes([sW,sH]);
	buildIcons();
}
function setCanvasRes(res,setCanvas=true,save=false){
	pxlW=res[0];
	pxlH=res[1];
	
	findPictureAspect(save);
	bootCamera();
	
	if(setCanvas){
		pxlCanvas.width=pxlW;
		pxlCanvas.height=pxlH;
	}
	pxlCamEngine.setPixelRatio(1);//window.devicePixelRatio*mapResPerc);
	pxlCamEngine.setSize(pxlW/mapResPerc, pxlH/mapResPerc);
	pxlCamCamera.aspect=pxlW/pxlH;
	pxlCamCamera.updateProjectionMatrix();
	pxlCamRenderTarget=new THREE.WebGLRenderTarget(pxlW,pxlH,{
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
	
	pxlRenderStack();
}

//////////////////////////////////////

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


//////////////////////////////////////

function mapBootEngine(){
	
	// Rederer
	pxlCamEngine=new THREE.WebGLRenderer({
		canvas: pxlCanvas,
		antialias: true,
		preserveDrawingBuffer:true,
	});
	//pxlCamEngine.autoClear=false;
	pxlCamEngine.setClearColor(0x000000);
	pxlCamEngine.setPixelRatio(1);//window.devicePixelRatio);
	pxlCamEngine.setSize(pxlW/mapResPerc, pxlH/mapResPerc);
	//pxlCamEngine.gammaOutput=true;
	
	pxlCamRenderTarget=new THREE.WebGLRenderTarget(pxlW,pxlH,{
		minFilter:THREE.LinearFilter,
		magFilter:THREE.LinearFilter,
		format:THREE.RGBFormat,
		stencilBuffer:false
	});
	
	//texLoader=new THREE.ImageLoader();
	
	/////////////////////////////////////////////
	
	var aspectRatio=pxlCanvas.width/pxlCanvas.height;
	pxlCamCamera=new THREE.PerspectiveCamera(35,aspectRatio, 1, 3000);
	pxlCamCamera.position.z=130;
	pxlCamCamera.target=new THREE.Vector3(0,0,0);
	pxlCamScene=new THREE.Scene();
	//pxlProcessScene=new THREE.Scene();
	
	var textureList;
	var transformList;
	
	webcamVideo=document.getElementById("webcamVideo");
	webcamVideo.setAttribute("autoplay", "");
	webcamVideo.setAttribute("muted", "");
	webcamVideo.setAttribute("playsinline", "");
	
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