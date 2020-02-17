
//////////////////////////////////////

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
	pxlMouse.x=(mouseX/sW)*2 - 1;
	pxlMouse.y=-(mouseY/sH)*2 + 1;
}

function mapOnDown(e){
	e.preventDefault();
	mouseButton=e.which;
	if(inputActive){
		xyDeltaData.active=1;
		xyDeltaData.mode=mouseButton;
		xyDeltaData.startPos=new THREE.Vector2(mouseX,mouseY);
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
		xyDeltaData.dragCount=0;
	}
}
function mapOnMove(e){
	e.preventDefault();
	getMouseXY(e);
	if(inputActive){
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
}
function mapOnUp(e){
	e.preventDefault();
	
	if(inputActive){
		xyDeltaData.dragCount++;
		xyDeltaData.dragTotal+=xyDeltaData.dragCount;
		xyDeltaData.active=0;
		xyDeltaData.latched=0;
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
	}
	setCursor("default");
}
function mapOnExitMode(){
	if(inputActive){
		xyDeltaData.startPos=new THREE.Vector2(0,0);
		xyDeltaData.endPos=new THREE.Vector2(0,0);
		xyDeltaData.dragTotal=1;
		
		xyDeltaData.netDistance[0]=0;
		xyDeltaData.netDistance[1]=0;
		xyDeltaData.netDistance[2]=0;
		xyDeltaData.latchMatrix=null;
		mouseWheelDelta=0;
		pxlCamCameraObjLatchOffset=[0,0];
		pxlCamCameraObjLatchPrev=null;
	}
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
			objRaycast.setFromCamera(pxlMouse,pxlCamCamera);
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

//////////////////////////////////////

function startTouch(e) {
	touchScreen=1;
	var touch = e.touches[0];
	mouseX = touch.pageX;
	mouseY = touch.pageY;
	if(inputActive){
		xyDeltaData.active=1;
		xyDeltaData.mode=mouseButton;
		xyDeltaData.startPos=new THREE.Vector2(mouseX,mouseY);
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
		xyDeltaData.dragCount=0;
	}
}

function doTouch(e) {
	var touch = e.touches[0];
	if(typeof(e.touches[1]) !== 'undefined'){
		var touchTwo = e.touches[1];
	}
	mouseX=touch.pageX;
	mouseY=touch.pageY;
	
	if(inputActive){
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
}
function endTouch(e) {
	var touch = e.touches[0];
	//getMouseXY(e);
	if(inputActive){
		xyDeltaData.dragCount++;
		xyDeltaData.dragTotal+=xyDeltaData.dragCount;
		xyDeltaData.active=0;
		xyDeltaData.latched=0;
		xyDeltaData.endPos=new THREE.Vector2(mouseX,mouseY);
	}
	setCursor("default");
}
