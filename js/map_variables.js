var pxlCamCore="pxlCam-core";
var pxlCamEngine,pxlCamGL,pxlCamCamera,pxlCamScene,pxlCamComposer, pxlCamShaderComposer;
var smartBlurShader, filterShader;
var cameraRenderPass,smartBlurShaderPass,filterShaderPass;
var pxlCamRenderTarget;
var mapResPerc=1;//mobile?.25:.5;
var mapAutoQuality=1;
//var loadFullTome=mobile?0:1;
var loadFullTome=0;
var cameraLoading,iconTray;
var alignLines;
var frontFlash;
var takeShotTime=0;
var flashWaitTime=1000;
var useFlash=false;
var useFrontFlash=false;
var flashActive=false;
var delaySaveShot=false;
var verbBlock,verbFPS,verbDeviceRes,verbCurCam,verbCurCamName,verbPrevCamName,verbMaxCam,verbPaused,verbConsole,verbYaw,verbPitch,verbRoll,verbCamRes,verbCurAngle;

var mapProcessScene=null; // mapProcessScene.add(processorObj[0]);
var mapCanvas,mapW,mapH;
var sW=window.innerWidth;
var sH=window.innerHeight;
var mapMouse=new THREE.Vector2();

// ========================================
var mouseX=sW/2;
var mouseY=sH/2;
var xyDeltaData={
	'active':0,
	'mode':0,
	'updated':0,
	'latched':0,
	'latchedAxis':null,
	'dragCount':0,
	'dragTotal':0,
	'startPos':null, //vec2
	'prevDeltaPos':[0,0,0], //vec2
	'endPos':null, //  [x,y] 
	'latchMatrix':null, // Mat4
	'netDistance':[0,0,0], //vec2
	'curDistance':[0,0,0], //vec2
};
var firefox=/Firefox/i.test(navigator.userAgent);
var mouseWheelEvt=(firefox)? "DOMMouseScroll" : "mousewheel" ;
var mouseWheelDelta=0;
var mouseButton=0;
var prevCursor=null;
var IE = document.all?true:false;
var touch =0;
var touchScreen=0;
var startTime=Date.now();
var fpsGrabTime=Date.now()+1000;
var fpsAvg=0;
var fpsCount=0;
var groupList=[];
var geoList=[];
var geoLoadList=[]; // 0 Not loaded, 1 Loaded, 2 Loaded and Processed (Setting Dependants)
var geoLoadListComplete=0;
var geoFunctionList=[];
var lightList=[];
var lightMapList=[];
var mapPause=0;
var runner=-1;
var pi=3.14159265358979;

// ========================================

//Attribute modification callback
// Used for checking videoWidth/videoHeight changes
//  There's got to be a better way....
// DOM Object Mutations support - { 'attributes', 'childList', 'subtree' }
const attrMutationConfig={ attributes:true, childList:false, subtree:false };
const attrMutationCallback=(mutationList,observer)=>{
	for( mutation of mutationList ){
		let type=mutation.type;
		if(type==="attributes"){
			console.log("Attr modded --");
			let mutName=mutation.attributeName;
			let mutVal=mutation.target.getAttribute(mutName);
			console.log(mutName+" -- "+mutVal);
		}
	}
};
const attrObserver=new MutationObserver(attrMutationCallback);

// Ugg, sooooooooooooooo
// 'Exact' returns a higher value than most entries
// {'min', 'max', 'ideal'} be damned for res checking
// Store and run from the higher value
var camSafeRes=[]; // Keep the safe, dispose of the rest!
var camSafeResValid=[];
var curResId=[];
var camOddResList=[
	480,
	640,
	720,
	768,
	900,
	1050,
	1080,
	1200,
	1280,
	1366,
	1440,
	1560,
	1600,
	1680,
	1920,
	2048,
	2160,
	2218,
	2272,
	2460,
	2560,
	2620,
	3280,
	3840,
	4032,
	4656
];

// Eh... I'll figure it out somehow
var camSafeResList=[
	480,
	640,
	720,
	768,
	900,
	1080,
	1200,
	1280,
	1366,
	1560,
	1600,
	1920,
	2160,
	2460,
	3280,
	3840
];
var camResOrigCheckList=[...camOddResList];
//for(var x=0; x<camOddResList.length;++x){
//	camResOrigCheckList.push([camOddResList[x][1],camOddResList[x][0]]);
//}
var camResCheckList=[...camResOrigCheckList];
var camResRunLength=camResOrigCheckList.length;
var camResIttr=0;
var camResChecking=false;
var camCheckCount=0;
var camSafeResFound=false;
var camSafeResBooting=false;
var camSafeResBooted=false;
var camPictureAspect=[1,1];

// ========================================

var texLoader;
var textLoaderArray=[];
var effectMode=0;
var webcamVideo;
var webcamActive=0;
var webcamList=[];
var webcamNameList=[];
var delayLoadCam=false; // Keep false; ticks on once camera boots initially camera on boot
var failedBootCount=0;
var flipHorizontal=false;
var vidTexture;
var vidGeo;
var vidMat;
var vidMesh;
var compensateScale=mobile==1?true:false;
var runSmartBlur=true;
var runDarkenImage=true;
var darkenImageDist=1;
var darkenImageDistMax=4;
var runEdgeColor=true;
var smoothReachDist=5;
var smoothReachDistPrev=0;
var smoothReachDistMax=10;
var edgeReachDist=10;
var edgeReachDistPrev=0;
var edgeReachDistMax=40;

var hueSatch_flattenMultColor=0;
var hueSatch_rotateHue=0;

var phonePoseActive=false;
var phone_ypr=[0,0,0];
var phone_yprDelta=[0,0,0];
var phone_yprInit=[0,0,0];
