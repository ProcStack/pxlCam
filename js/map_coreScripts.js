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
function setThumbnailPosition(){
	let nCam=document.getElementById('icon-nextCamera');
	let nBottom=nCam.style.bottom+nCam.offsetHeight;
	let tBlock=document.getElementById('thumbnailBlock');
	tBlock.style.bottom=nBottom;
}
function nullToggle(obj){
	let canvas=obj.getElementsByTagName('canvas');
	if(canvas.length>0 && obj.hasAttribute("draw")){
		canvas=canvas[0];
		let draw=obj.getAttribute("draw");
		drawIcon(canvas, draw, [canvas.width, canvas.height] );
	}
}
function drawIcon(can, draw, size){
	let points=[];
	let curLine=[];
	let fill=false;
	let runNull=false
	if(draw=="blank"){
		return;
	}else if(draw=="mode"){
		curLine=[.42,.27, .5,.42, .58,.27];
		points.push(curLine);
		curLine=[.42,.27, .5,.38, .58,.27];
		points.push(curLine);
		curLine=[.27,.44, .32,.44, .5,.56, .68,.44, .73,.44];
		points.push(curLine);
		curLine=[.17,.62, .25,.62, .5,.72, .75,.62, .83,.62];
		points.push(curLine);
		curLine=[.17,.62, .25,.625, .5,.73, .75,.625, .83,.62];
		points.push(curLine);
	}else if(draw=="alignLines"){
		let sl=.03;
		curLine=[.35+sl,.22, .35-sl,.79];
		points.push(curLine);
		curLine=[.65+sl,.2, .65-sl,.77];
		points.push(curLine);
		sl=.01;
		curLine=[.22,.35+sl, .79,.35-sl];
		points.push(curLine);
		curLine=[.19,.65+sl, .77,.65-sl];
		points.push(curLine);
	}else if(draw=="flash"){
		if(!useFlash) runNull=true;
		curLine=[.61,.13, .68,.51, .47,.68, .52,.87];
		points.push(...curLine);
		curLine=[.39,.65, .52,.5, .31,.18];
		points.push(...curLine);
		points=[[...points]];
		fill=true;
	}else if(draw=="nextCam"){
		curLine=[.33,.3, .48,.5, .33,.7, .41,.5];
		points.push(curLine);
		curLine=[.51,.25, .71,.5, .51,.75, .61,.5];
		points.push(curLine);
		fill=true;
	}else{
		runNull=true;
	}
	points.map((pts,x)=>{
		pts=pts.map((val,c)=>val*size[c%2]);
		drawLine(can,pts,3,"#fff",fill,!x);
	});
	if(runNull){
		points=[]
		curLine=[.2,.25, .8,.75];
		points.push(curLine);
		curLine=[.2,.75, .8,.25];
		points.push(curLine);
		points.map((pts,x)=>{
			pts=pts.map((val,c)=>val*size[c%2]);
			drawLine(can,pts,3,"#b55",false,false);
		});
	}
}
function drawLine(canvas,points,width,color,fill,clear){
	let hex=color;
	let draw=canvas.getContext('2d');
	if(clear) draw.clearRect(0,0,canvas.width,canvas.height);
	
	draw.beginPath();
	draw.strokeStyle=hex;
	draw.lineWidth=width;
	draw.moveTo(points[0],points[1]);
	for(var x=2; x<(points.length); x+=2){
		draw.lineTo(points[x],points[x+1]);
	}
	if(fill){
		draw.closePath();
		draw.fillStyle=hex;
		draw.fill();
	}else{
		draw.strokeStyle=hex;
		draw.lineJoin = "round";
		draw.lineCap = "round";
		draw.stroke();
	}
}


function setAlignLines(){
	let curMode=parseInt(alignLines.getAttribute("displayMode"));
	curMode=(curMode+1)%4;
	alignLines.setAttribute("displayMode",curMode);
	let html='';
	let lines=curMode==1?2:7;
	let faded=curMode==1?false:true;
	
	if(curMode==0) return alignLines.innerHTML=html;
	
	if(curMode<=2){ // Eh, messing around with other ways to write things. Efficient? no clue
		Array(lines*2).fill(['1px','100%',100,0]).map((a,x)=>{
			a=x%2?[a[1],a[0],a[3],a[2]]:a;
			let bar=parseInt(x*.5+1);
			let left=(bar/(lines+1)) * a[2];
			let top=(bar/(lines+1)) * a[3];
			html+="\n<div class='alignLines "+(bar%2&&faded?"alignFaintLines":"alignMainLines")+"' ";
			html+="style='width:"+a[0]+";height:"+a[1]+";";
			html+="top:"+top+"%;left:"+left+"%;'></div>";
		});
	}else if(curMode==3){
		let size=Math.min(sW,sH)*.4;
		html="\n<div class='alignBoxBlock alignBox' style='width:"+size+"px;height:"+size+"px;'></div>";
		size*=.25;
		html+="<div class='alignBoxBlock alignInnerCircle' style='width:"+size+"px;height:"+size+"px;'>";
		html+="<div class='alignInnerUpper' style='width:"+size+"px;height:"+(size*.5)+"px;'></div>";
		html+="<div class='alignInnerLower' style='width:"+size+"px;height:"+(size*.5)+"px;'></div>";
		html+="</div>";
	}
	alignLines.innerHTML=html;
}


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

function pxlRender(){
	runner++;
	var curTime=Date.now();
	let delta=(curTime-clockTime);
	if(runSmartBlur){
		if(delta/30<.7){
			runSmartBlur=false;
			buildShaderPass(true);
		}
	}
	if(verbose){
		verbPaused.innerText=webcamVideo.paused?"PAUSED":"PLAYING";
		fpsCount++;
		if(curTime>fpsGrabTime){
			verbFPS.innerText=delta+" ms - "+fpsAvg+" fps average" ;
			
			fpsGrabTime=curTime+1000;
			fpsAvg=fpsAvg==0?fpsCount: (fpsAvg*2+fpsCount)*.33333333333333;
			fpsAvg=(fpsAvg+"").substr(0,5);
			fpsCount=0;
		}
	}
	clockTime=curTime;
	
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
	
	checkFadeOutList();
	
	if(delaySaveShot && useFlash && curTime>takeShotTime){
		delaySaveShot=false;
		saveShot();
	}else{
		if(camSafeResFound){
			pxlRenderStack();
		}
	}
	
	if(!pxlPause){
		requestAnimationFrame(pxlRender);
	}
}

function pxlRenderStack(){
	pxlCamComposer.render();
	pxlCamShaderComposer.render();
}