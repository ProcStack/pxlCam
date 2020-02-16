
function stepShaderValues(){	
	let deltaX=xyDeltaData.endPos.x-xyDeltaData.startPos.x;
	let deltaY=xyDeltaData.startPos.y-xyDeltaData.endPos.y;
		
	if(effectMode<2){
		//smoothReachDist=runSmartBlur ? Math.max(2, Math.min(smoothReachDistMax, smoothReachDist+deltaX*.002)) : smoothReachDist;
		darkenImageDist=runDarkenImage ? Math.max(0, Math.min(darkenImageDistMax, darkenImageDist+deltaX*.0002)) : darkenImageDist;
		edgeReachDist=runEdgeColor ? Math.max(2, Math.min(edgeReachDistMax, edgeReachDist+deltaY*.002)) : edgeReachDist;
		
		filterShader.uniforms.uEdgeReach.value=edgeReachDist;
		filterShader.uniforms.uDarkenImage.value=darkenImageDist;
	}else{
		hueSatch_rotateHue+=deltaX*.0001;
		hueSatch_flattenMultColor+=deltaY*.0001;
		
		filterShader.uniforms.uFlattenScalar.value=hueSatch_flattenMultColor;
		filterShader.uniforms.uRotateHue.value=hueSatch_rotateHue;
	}
	buildShaderPass();
}

function buildShaderPass(force=false, mult=1){
	filter_smartBlur(mult);
	if(effectMode<2){
		filter_shiftEdgeThickness(force, mult);
	}else{
		filter_shiftHueSaturation(force, mult);
	}
}

function nextEffect(){
	effectMode=(effectMode+1)%3;
	if(effectMode<2){
		darkenImageDist=1;
		smoothReachDist=5;
		edgeReachDist=10;
	}else{
		smoothReachDist=5;
		hueSatch_flattenMultColor=0;
		hueSatch_rotateHue=0;
	}
	buildShaderPass(true);
}
function findPictureAspect(save=false){
	var aspectMult=[1,1];
	if(!save){
		let res=[sW,sH];
		let safe=[...camSafeRes[webcamActive]];
		safe=mobile&&sH>sW?[safe[1],safe[0]]:safe;
		let resAspect=[sW/sH, sH/sW];
		let safeAspect=[safe[0]/safe[1], safe[1]/safe[0]];
		
		aspectMult[0]=(resAspect[0]>safeAspect[0]) ? 1 : res[0]/(res[1]*safeAspect[0]) ;
		aspectMult[1]=(resAspect[0]>safeAspect[0]) ? res[1]/(res[0]*safeAspect[1]) : 1 ;
	}
	camPictureAspect=[...aspectMult];
	smartBlurShader.uniforms.uResAspectX.value=camPictureAspect[0];
	smartBlurShader.uniforms.uResAspectY.value=camPictureAspect[1];
}
function takeShot(){
	if(useFlash){
		setDeviceFlash(true,true);
	}else{
		saveShot();
	}
}
function saveShot(){
	let r=camSafeRes[webcamActive];
	r=mobile && sH>sW?[r[1],r[0]]:r;
	var cameraRender,cameraCanvas;
	setCanvasRes(r,true,true); // Renders the scene too	
		
	if(phonePoseActive && (Math.abs(phone_ypr[0])<.45 && sH>sW)){
		var curRotCanvas=document.createElement("canvas");
		curRotCanvas.height=camSafeRes[webcamActive][1];
		curRotCanvas.width=camSafeRes[webcamActive][0];

		var curCtx=curRotCanvas.getContext('2d');
		curCtx.clearRect(0,0,curRotCanvas.width,curRotCanvas.height);
		curCtx.save();
		curCtx.translate(curRotCanvas.width*.5, curRotCanvas.height*.5);
		if(flipHorizontal){
			curCtx.rotate(Math.PI*.5 * (flipHorizontal ? -1:1) ); // ##
		}else{
			curCtx.rotate(Math.PI*.5 * (flipHorizontal ? 1:-1) ); // ##
		}
		curCtx.translate(-curRotCanvas.height*.5, -curRotCanvas.width*.5);
		curCtx.drawImage(pxlCanvas,0,0);
		curCtx.restore();
		cameraCanvas=curRotCanvas;
	}else{
		cameraCanvas=pxlCanvas;
	}
	cameraRender=pxlCanvas.toDataURL("image/png");
		
	////////////////////////////////////////////////////
	// Convert png data to blob for direct download
	var blob=atob(cameraRender.split(',')[1]);
	var len=blob.length;
	var arr=new Uint8Array(len);
	for(var x=0; x<len; ++x){
		arr[x]=blob.charCodeAt(x);
	}
	var cameraData=URL.createObjectURL(new Blob([arr]));
  
	////////////////////////////////////////////////////
	// File listing info
	var dt=new Date();
	var timeSuffix="_"+(dt.getMonth()+1)+"-"+dt.getDate()+"-"+dt.getFullYear()+"_"+dt.getHours()+"-"+dt.getMinutes()+"-"+dt.getSeconds();
	let fileName="pxlCam"+timeSuffix+".png";
	//let fileSizeKB=len*0.0009765625;
	//let fileSizeMB=fileSizeKB*0.0009765625;
	let fileSizeKB=toHundreths(len*0.001);
	let fileSizeMB=toHundreths(fileSizeKB*0.001);
	let thumbnailPrompt=fileSizeMB>1?fileSizeMB+" MB":fileSizeKB+" KB";
	thumbnailPrompt+="<br>Edit Below";
	if(verbose) verbConsole.innerHTML="KB - "+fileSizeKB+" | MB - "+fileSizeMB;
	
	let ratio;
	let scalar=[0,0,cameraCanvas.width, cameraCanvas.height];
	if(scalar[3]<scalar[2]){
		ratio=thumbnailCanvas.height/scalar[3];
	}else{
		ratio=thumbnailCanvas.width/scalar[2];
	}
	scalar=[
		(scalar[0]-scalar[2]*.5)*ratio+scalar[2]*.5,
		(scalar[1]-scalar[3]*.5)*ratio+scalar[3]*.5,
		(scalar[2]*.5)*ratio+scalar[2]*.5,
		(scalar[3]*.5)*ratio+scalar[3]*.5
	];
	let tCtx=thumbnailCanvas.getContext("2d");
	tCtx.drawImage(cameraCanvas, ...scalar, 0,0,thumbnailCanvas.width,thumbnailCanvas.height);
	thumbnailCanvas.src=cameraRender;
	
	if(verbose){
		thumbnailText.innerHTML=thumbnailPrompt;
		promptScreen(thumbnailText,true,3);
		promptScreen(thumbnailImage,true);
	}
	
	////////////////////////////////////////////////////
	// Auto download image
	var tempLink=document.createElement("a");
	tempLink.download=fileName;
	tempLink.href=cameraData;
	document.body.appendChild(tempLink);
	tempLink.click();
	document.body.removeChild(tempLink);
	if(flipHorizontal){
		filterShader.uniforms.uFlipHorizontal.value=true;
	}
	setCanvasRes([sW,sH]); // Renders the scene too
	
	setDeviceFlash(false, false);
	
}

function filter_smartBlur(mult=1){
	smartBlurShader=new THREE.ShaderMaterial({
		uniforms:{
			"tDiffuse":{type:"t",value:0,texture:null},
			"uResScaleX":{type:"f",value:1/sW},
			"uResScaleY":{type:"f",value:1/sH},
			"uResAspectX":{type:"f",value:camPictureAspect[0]},
			"uResAspectY":{type:"f",value:camPictureAspect[1]},
		},
		vertexShader:webcamVertex(),
		fragmentShader:webcamFragment_smartBlur(parseInt(smoothReachDist*mult))
	});
	smartBlurShader.uniforms.tDiffuse.value=vidTexture;
}

function filter_shiftEdgeThickness(force=false, mult=1){
	if( parseInt(edgeReachDist) != edgeReachDistPrev || force){
		edgeReachDistPrev=parseInt(edgeReachDist);
		
		filterShader=new THREE.ShaderMaterial({
			uniforms:{
				"tDiffuse":{type:"t",value:0,texture:null},
				"uResScaleX":{type:"f",value:1/sW},
				"uResScaleY":{type:"f",value:1/sH},
				"uResAspectX":{type:"f",value:camPictureAspect[0]},
				"uResAspectY":{type:"f",value:camPictureAspect[1]},
				"uCompensateScale":{type:"b",value:compensateScale},
				"uFlipHorizontal":{type:"b",value:flipHorizontal},
				"uEdgeMode":{type:"i",value:effectMode},
				"uEdgeReach":{type:"i",value:parseInt(edgeReachDist)},
				"uDarkenImage":{type:"f",value:darkenImageDist}
			},
			vertexShader:webcamVertex(),
			fragmentShader:webcamFragment_colorEdge( parseInt(edgeReachDist*mult) )
		});
		filterShader.uniforms.tDiffuse.value=pxlCamRenderTarget.texture;
		filterShader.uniforms.uDarkenImage.value=darkenImageDist;
		buildComposer();
	}
}

function filter_shiftHueSaturation(force=false){
	if( parseInt(edgeReachDist) != edgeReachDistPrev || force){
		edgeReachDistPrev=parseInt(edgeReachDist);
		
		filterShader=new THREE.ShaderMaterial({
			uniforms:{
				"tDiffuse":{type:"t",value:0,texture:null},
				"uResScaleX":{type:"f",value:1/sW},
				"uResScaleY":{type:"f",value:1/sH},
				"uResAspectX":{type:"f",value:camPictureAspect[0]},
				"uResAspectY":{type:"f",value:camPictureAspect[1]},
				"uCompensateScale":{type:"b",value:compensateScale},
				"uFlipHorizontal":{type:"b",value:flipHorizontal},
				"uFlattenScalar":{type:"f",value:hueSatch_flattenMultColor},
				"uRotateHue":{type:"f",value:hueSatch_rotateHue}
			},
			vertexShader:webcamVertex(),
			fragmentShader:webcamFragment_hueSatch()
		});
		filterShader.uniforms.tDiffuse.value=pxlCamRenderTarget.texture;
		
		buildComposer();
	}
}

function buildComposer(){
	pxlCamComposer = new THREE.EffectComposer(pxlCamEngine, pxlCamRenderTarget);
	//pxlCamComposer = new THREE.RenderPass(pxlCamEngine, pxlCamRenderTarget);
	
	cameraRenderPass=new THREE.RenderPass(pxlCamScene,pxlCamCamera);
	smartBlurShaderPass=new THREE.ShaderPass(smartBlurShader,pxlCamRenderTarget.texture);
	smartBlurShaderPass.clear=false;
	//smartBlurShaderPass.material.transparent=true;
	pxlCamComposer.addPass(smartBlurShaderPass);
	//filterShaderPass.renderToScreen=true;
	
	pxlCamShaderComposer= new THREE.EffectComposer(pxlCamEngine);
	filterShaderPass=new THREE.ShaderPass(filterShader,pxlCamCamera);
	filterShaderPass.clear=false;
	//filterShaderPass.material.transparent=true;
	
	pxlCamShaderComposer.addPass(filterShaderPass);
	filterShaderPass.renderToScreen=true;
}

function webcamVertex(){
	return `
	varying vec3 pos;
	varying vec2 vUv;
	void main(){
		vUv=uv;
		vec4 modelViewPosition=modelViewMatrix * vec4(position, 1.0);
		gl_Position = projectionMatrix*modelViewPosition;
	}`;
}

function webcamFragment_smartBlur(smoothReach){
	var retFrag= `
		precision mediump float;
		uniform sampler2D	tDiffuse;
		uniform float		uResAspectX;
		uniform float		uResAspectY;
		uniform float		uResScaleX;
		uniform float		uResScaleY;

		varying vec2		vUv;
		
		#define SB_CHEAP 0
		vec3 smartBlurRGB(sampler2D tex, vec2 uv, vec2 dist, float thresh){
			#if (SB_CHEAP == 1)
				const int runCount=4;
				vec2 runDir[runCount];
				runDir[0]=vec2(1.0, 0.0);
				runDir[1]=vec2(0.0, 1.0);
				runDir[2]=vec2(-1.0, 0.0);
				runDir[3]=vec2(0.0, -1.0);
			#else
				const int runCount=8;
				vec2 runDir[runCount];
				runDir[0]=vec2(1.0, 0.0);
				runDir[1]=vec2(1.0, 1.0);
				runDir[2]=vec2(0.0, 1.0);
				runDir[3]=vec2(-1.0, 1.0);
				runDir[4]=vec2(-1.0, 0.0);
				runDir[5]=vec2(-1.0, -1.0);
				runDir[6]=vec2(0.0, -1.0);
				runDir[7]=vec2(1.0, -1.0);
			#endif
			float perc;
			float curPerc=1.0;
			vec2 curUV;
			vec3 origCd=texture2D(tex,uv).rgb;
			vec3 curCd;
			vec3 retCd=origCd;
			float invThresh=1.0/(1.0-thresh);
			float delta;
			float threshTrigger=1.0;
			for(int s=0; s<runCount; ++s){
				for(int r=1; r<`+smoothReach+`; ++r){
					perc=1.0-(float(r)/`+smoothReach+`.0);
					curUV=uv+runDir[s]*(dist*float(r));
					curCd=texture2D(tex,curUV).rgb;
					perc=max(0.0, 1.0-length(origCd-curCd))*perc;
					delta=length(origCd-curCd);
					delta=delta>thresh ? (delta-thresh)*invThresh : 0.0 ;
					//perc*=delta*threshTrigger;
					perc*=threshTrigger;
					
					retCd+=curCd.rgb*perc;
					curPerc+=perc;
					
					threshTrigger=threshTrigger>0.0 && delta<thresh ? threshTrigger : 0.0;
				}
			}
			return retCd/curPerc;
		}
		
		float greyscale(vec3 curCd){
			return 0.2126*curCd.r + 0.7152*curCd.g + 0.0722*curCd.b;
		}
		void main( void ){
			vec2 uv = vUv;
			uv=(uv-.5)*vec2(uResAspectX,uResAspectY)+.5;
			
			vec4 Cd=texture2D(tDiffuse,uv);
			vec4 smartBlurCd=vec4( smartBlurRGB(tDiffuse, uv, vec2(uResScaleX,uResScaleY), .1), 1.0);
			Cd=smartBlurCd;
			
			gl_FragColor=Cd;
		}`;
	
	return retFrag;
}

function webcamFragment_colorEdge(edgeReach){
	
	var retFrag= `
		precision mediump float;
		uniform sampler2D	tDiffuse;
		uniform float		uResAspectX;
		uniform float		uResAspectY;
		uniform float		uResScaleX;
		uniform float		uResScaleY;
		uniform bool		uCompensateScale;
		uniform bool		uFlipHorizontal;
		uniform float		uDarkenImage;
		
		uniform int			uEdgeMode;
		uniform int			uEdgeReach;

		varying vec2		vUv;

		#define FE_CHEAP 0
		float findEdgesRGB(sampler2D tex, const vec2 uv, vec2 dist, float thresh){
			#if (FE_CHEAP == 1)
				const int runCount=4;
				vec2 runDir[runCount];
				runDir[0]=vec2(1.0, 0.0);
				runDir[1]=vec2(0.0, 1.0);
				runDir[2]=vec2(-1.0, 0.0);
				runDir[3]=vec2(0.0, -1.0);
			#else
				const int runCount=8;
				vec2 runDir[runCount];
				runDir[0]=vec2(1.0, 0.0);
				runDir[1]=vec2(1.0, 1.0);
				runDir[2]=vec2(0.0, 1.0);
				runDir[3]=vec2(-1.0, 1.0);
				runDir[4]=vec2(-1.0, 0.0);
				runDir[5]=vec2(-1.0, -1.0);
				runDir[6]=vec2(0.0, -1.0);
				runDir[7]=vec2(1.0, -1.0);
			#endif
			float perc;
			float curPerc=1.0;
			vec2 curUV;
			vec3 origCd=texture2D(tex,uv).rgb;
			vec3 curCd;
			vec3 retCd=origCd;
			float edgeValue=0.0;
			float delta;
			float invThresh=1.0/(1.0-thresh);
			for(int s=0; s<runCount; ++s){
				for(int r=1; r<`+edgeReach+`; ++r){
					perc=1.0-(float(r)/`+edgeReach+`.0);
					curUV=uv+runDir[s]*(dist*float(r));
					curCd=texture2D(tex,curUV).rgb;
					delta=min(1.0, length( origCd-curCd));
					delta=delta>thresh ? (delta-thresh)*invThresh : 0.0 ;
					edgeValue+=delta*perc;
					curPerc+=perc;
				}
			}
			return edgeValue/curPerc;
		}
		
		float greyscale(vec3 curCd){
			return 0.2126*curCd.r + 0.7152*curCd.g + 0.0722*curCd.b;
		}
		void main( void ){
			vec2 uv = vUv;
			uv.x=uFlipHorizontal ? 1.0-uv.x : uv.x;
			
			vec4 Cd=texture2D(tDiffuse,uv);
			vec4 curCd=texture2D(tDiffuse,uv);
			
			float edges= findEdgesRGB(tDiffuse, uv, vec2(uResScaleX,uResScaleY),.1);
			edges= min(1.0, edges*10.0);
			edges= uEdgeMode==1 ? 1.0-edges : edges;
			float darkenBlend=max(0.0, (uDarkenImage-2.0))*.5;
			darkenBlend*=darkenBlend;
			float greyScaled=mix( greyscale(Cd.rgb*uDarkenImage), 1.0, darkenBlend);
			Cd.rgb=mix( vec3(greyScaled), Cd.rgb, edges );


			gl_FragColor=Cd;
		}`;
	
	return retFrag;
}

function webcamFragment_hueSatch(){
	
	// I've written up RGB->HSV->RGB conversion in the past,
	//   But in no way is it optimized for OpenGL
	// I'll convert it eventually, for now I'm using some open source conversion
	//
	// RGB conversion from -
	// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
	
	var retFrag= `
		precision mediump float;
		uniform sampler2D	tDiffuse;
		uniform float		uResAspectX;
		uniform float		uResAspectY;
		uniform float		uResScaleX;
		uniform float		uResScaleY;
		uniform bool		uCompensateScale;
		uniform bool		uFlipHorizontal;

		uniform float		uFlattenScalar;
		uniform float		uRotateHue;
		
		varying vec2		vUv;
		
		
		vec3 rgb2hsv(vec3 c){
			vec4 K = vec4(0.0, `+(-1.0 / 3.0)+`, `+(2.0 / 3.0)+`, -1.0);
			vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
			vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

			float d = q.x - min(q.w, q.y);
			float e = 1.0e-10;
			return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
		}

		vec3 hsv2rgb(vec3 c){
			vec4 K = vec4(1.0, `+(2.0 / 3.0)+`, `+(1.0 / 3.0)+`, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		float greyscale(vec3 curCd){
			return 0.2126*curCd.r + 0.7152*curCd.g + 0.0722*curCd.b;
		}
		void main( void ){
			vec2 uv = vUv;
			uv.x=uFlipHorizontal ? 1.0-uv.x : uv.x;
			
			vec4 Cd=texture2D(tDiffuse,uv);
			vec4 curCd=texture2D(tDiffuse,uv);

			float greyscaleHueCd=greyscale(Cd.rgb);
			vec3 hsvCd=rgb2hsv( Cd.rgb );
			//hsvCd.r=hsvCd.r+uRotateHue;
			float flatten=sin((hsvCd.g-.5)*uFlattenScalar*.5+.5);
			hsvCd.r=(flatten+uRotateHue) + (hsvCd.b*.75+.25);
			//hsvCd.b*=1.0-flatten*.5;
			//hsvCd.b=hsvCd.r + hsvCd.b;
			hsvCd.g+=hsvCd.b;
			vec3 rgbCd=hsv2rgb(hsvCd);
			Cd.rgb=mix( rgbCd, Cd.rgb, greyscaleHueCd);
			gl_FragColor=Cd;
		}`;
	
	return retFrag;
}

