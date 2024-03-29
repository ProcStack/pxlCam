<?php
	$mobile=0;
	$verbose=0;
	$todoList=<<<EOT
==================================================================
As of March 8th, 2020 -
 - Added a self contained browser cookie management system
 - Store found camera names and resolutions into browser cookies
 - Switched deviceOrientation to accelerometerWithGravity to calculate photo rotation
To-Dos-
 - Figure out why wide camera lenses don't load
 - Build Camera Class - 'pxlCam_deviceScripts.js' functions
     Video Media listings
     Auto-camera res finder
 - Build Menu Class - For easier bootstrapping in the future
     Nested menus with back buttons
     Auto generated fade css classes
 - Add cookies to find website crashes to reduce quality on load
 - Add javascript worker
     Faster canvas processing
     ImageData to Blob conversion for download
==================================================================
EOT;

	if(isset($_GET['v'])){
		if(is_numeric($_GET['v'])){
			$verbose=$_GET['v']==1?"true":"false";
		}
	}
	if(isset($_GET['m'])){
		if(is_numeric($_GET['m'])){
			$mobile=$_GET['m'];
		}
	}else{
		$useragent=$_SERVER['HTTP_USER_AGENT'];
		$mobile=0;
		if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4))){
			$mobile=1;
		}
	}
	$mobile=$mobile==1?"true":"false";
	$t=time();
?>
<!DOCTYPE>
<html lang="en">
<!--
Created by Kevin Edzenga; February/March 2020 -- 
If you are digging around in the source, I'm glad others do too!

To-Dos-
<?php echo $todoList; ?>

Things of importance --
pxlCam_boot.js
  Contains pxlCookieManager(); a user-side cookie management system
    Read, Write, Exists, Is-Equal-To Variable, Convert arrays and nested arrays to string
pxlCam_mouseTouch.js
  Contains an isolated mouse and touch controller class
  Maintains current/previous positions
  Calculates mouse velocity
  Evalutates desired functions as per mouseDown/touchStart, mouseDrag/touchMove, mouseUp/touchEnd
pxlCam_deviceScripts.js
  Contains webcam/video media functions to find maximum camera resolutions
  Stores a safe display resolution near the screen resolution and all found resolutions, with fall back to 640x480 should all else fail
pxlCam_coreScripts.js
  UI element building through resolution dependant icons using canvas elements and draws the icons dynamically
  Currently no support for external images to be displayed
pxlCam_shaderScripts.js
  All ThreeJS OpenGL shaders stored here
  ThreeJS composer options
  Convert and save a given canvas with a function, see `takeShot()`
-->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"></meta>
<meta name='theme-color' content='#383838'>
<title>pxlCam :: A Filtered World</title>
<meta name="description" content="Reality seen through the filter of technology.  Colorized tinctures for a new view of life.">
<meta name="keywords" content="camera,cam,filter,filters,ar,augmented,reality,webgl,opengl,threejs,experiment,create,fun,web,app,free">
<meta name="author" content="Kevin Edzenga">
<meta name="ROBOTS" content="INDEX, NOFOLLOW">

<link rel="stylesheet" href="pxlCamStyle.css?q=<?php echo $t; ?>">
<script src="js/pxlCam_three.min.js"></script>
<script src="js/EffectComposer.js"></script>
<script src="js/CopyShader.js"></script>
<script src="js/RenderPass.js"></script>
<script src="js/ShaderPass.js"></script>

<!-- <script src="js/dat.gui.min.js"></script> -->
<!-- <script src="js/stats.min.js"></script> -->

<!-- Metal Asylum Local Javascript - map javascript files -->
<script>
var mobile=<?php echo $mobile; ?>;
var verbose=<?php echo $verbose; ?>;
var mapToDoList=`<?php echo $todoList; ?>`;
</script>
<script src="js/pxlCam_variables.js?q=<?php echo $t; ?>"></script>
<script src="js/pxlCam_boot.js?q=<?php echo $t; ?>"></script>
<script src="js/pxlCam_mouseTouch.js?q=<?php echo $t; ?>"></script>
<script src="js/pxlCam_coreScripts.js?q=<?php echo $t; ?>"></script>
<script src="js/pxlCam_deviceScripts.js?q=<?php echo $t; ?>"></script>
<script src="js/pxlCam_shaderScripts.js?q=<?php echo $t; ?>"></script>

</head>
<body onLoad="init();">
<div id="verbose" class="verboseBlock"></div>

<video id="webcamVideo" style="position:absolute; top:0px;left:0px;z-index:10;display:none;"></video>
<canvas id="pxlCam-core" style="touch-action:none;"></canvas>

<div id="iconTray" class="iconTray">
	<div id="icon-nextEffect" class="iconParent iconMode drop" onClick="nextEffect();" draw="mode" scale="1"></div>
	<div id="icon-alignLines" class="iconParent iconAlignLines drop" onClick="setAlignLines();" draw="alignLines" scale=".65"></div>
	<div id="icon-flash" class="iconParent iconFlash drop" onClick="toggleFlash(this);" draw="flash" scale=".65"></div>
	<div id="icon-saveShot" class="iconParent iconTakePhoto drop large" onClick="takeShot();" scale="1">
		<div id="icon-saveShotInnerBorder" class="iconTakePhotoInnerBorder"></div>
		<div id="icon-saveShotInner" class="iconTakePhotoInner"></div>
		<div id="icon-saveShotInnerDot" class="iconTakePhotoInnerDot"></div>
	</div>
	<div id="icon-nextCamera" class="iconParent iconNextCamera drop" onClick="nextCamera();" draw="nextCam" scale="1"></div>
	<?php if($verbose){ ?><div id="icon-nextRes" class="iconParent iconNextRes drop" onClick="verbFunction();" draw="nextRes" scale="1"></div><?php } ?>
</div>

<div id="cameraLoadingBlock" class="cameraLoadingBlock visOff">
	<div id="cameraLoadingText" class="cameraLoadingText">
	</div>
</div>

<div id="alignLines" class="alignLines" displayMode=0></div>

<div id="frontFlash" class="frontFlash"></div>

<div id="thumbnailBlock" class="thumbnailBlock">
	<div id="thumbnailText" class="thumbnailText visOff"></div>
	<div id="thumbnailImage" class="thumbnailImage visOff" onclick="openMenu('photoBinMenu');" draw="blank" scale="1"></div>
</div>

<div id="menuBlock" class="menuBlock visOff">
	<div id="menuExit" class="menuExit" onclick="closeActiveMenu(true);"></div>
	<div id="photoBinMenu" class="photoBinMenu menuParent visOff"></div>
</div>

</body>
</html>