<?php
	$mobile=0;
	$verbose=0;
	$todoList=<<<EOT
==================================================================
EOT;

	if(isset($_GET['v'])){
		if(is_numeric($_GET['v'])){
			$verbose=$_GET['v'];
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
	$t=time();
?>
<html>
<head>
</head>
<!--
Created by Kevin Edzenga; September 2019 -- 
If you are digging around in the source, I'm glad others out there do that!
-->
<meta name="viewport" content="width=device-width, initial-scale=.85, user-scalable=no"></meta>
<script src="js/map_three.min.js"></script>
<script src="js/EffectComposer.js"></script>
<script src="js/CopyShader.js"></script>
<script src="js/RenderPass.js"></script>
<script src="js/ShaderPass.js"></script>

<!-- <script src="js/dat.gui.min.js"></script> -->
<!-- <script src="js/stats.min.js"></script> -->

<!-- Metal Asylum Local Javascript - map javascript files -->
<script>
var mobile=<?php echo $mobile; ?>;
var verbose=!!<?php echo $verbose; ?>;
var mapToDoList=`<?php echo $todoList; ?>`;
</script>
<script src="js/map_variables.js?q=<?php echo $t; ?>"></script>
<script src="js/map_boot.js?q=<?php echo $t; ?>"></script>
<script src="js/map_coreScripts.js?q=<?php echo $t; ?>"></script>
<script src="js/map_deviceScripts.js?q=<?php echo $t; ?>"></script>
<script src="js/map_shaderScripts.js?q=<?php echo $t; ?>"></script>

<style>
BODY{
	margin:0px;
	padding:0px;
	background-color:#000000;
	user-select:none;
	touch-action:none;
	font-family:Tahoma;
}
.iconTray{
	width:100%;
	position:fixed;
	bottom:0%;
	left:0px;
	z-index:50;
}
.iconParent{
	margin:auto;
	text-align:center;
	font-size:350%;
	color:#fff;
	filter: drop-shadow(0px 0px 4px #000);
}
.icon{
	margin:10px;
	display:inline;
	visibility:visible;
}
.larger{
	font-size:1300%;
}
.verboseBlock{
	position:absolute;
	top:0px;
	left:0px;
	z-index:15;
	color:#ffffff;
	display:none;
	width:100%;
	filter: drop-shadow(0px 0px 4px #000);
}

.cameraLoadingBlock{
	//background-color:#000;
	position:fixed;
	top:0px;
	left:0px;
	width:100%;
	height:100%;
	overflow:hidden;
	z-index:10;
}
.cameraLoadingText{
	width:100%;
	filter: drop-shadow(0px 0px 4px #000);
	font-size:220%;
	font-family:Tahoma;
	color:#ffffff;
	text-align:center;
	position:fixed;
	top:35%;
	left:50%;
	transform:translate(-50%,-50%);
}
.header{
	margin-bottom:10px;
}
.detect{
	font-size:70%;
}
.sub{
	font-size:55%;
	font-style:italic;
}

.fader{
	transition: opacity 1s, filter 1s;
}
.visOn{
	filter:alpha(opacity=100);
	opacity:1.0;
}
.visOff{
	filter:alpha(opacity=0);
	opacity:0.0;
}
</style>

<body onLoad="boot();">
<div id="verbose" class="verboseBlock">
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
</div>
<video id="webcamVideo" style="position:absolute; top:0px;left:0px;z-index:10;display:none;"></video>
<video id="webcamResChecker" style="position:absolute; top:0px;left:0px;z-index:9;display:none;"></video>
<canvas id="pxlCam-core" style="touch-action:none;"></canvas>

<table id="iconTray" cellpadding=0 cellscaping=0 border=0 width="100%" class="iconTray"><tr>
	<td class="iconParent"><div id="icon-nextEffect" class="icon" onClick="nextEffect();">…</div>
		<!-- <br><br><div id="icon-toggleScaling" class="icon" onClick="toggleScaling();">‡</div></td> -->
	<td class="iconParent larger"><div id="icon-saveShot" class="icon" onClick="saveShot();">o</div></td>
	<!-- <td class="icon"><div id="icon-rotatePicture" class="icon" onClick="rotatePicture();">↻</div></td> -->
	<td class="iconParent"><div id="icon-nextCamera" class="icon" style="visibility:hidden;" onClick="nextCamera();">»</div></td>
</tr></table>

<div id="cameraLoadingBlock" class="cameraLoadingBlock visOff">
	<div id="cameraLoadingText" class="cameraLoadingText">
		<span class="header"> Loading <span id="curLoadingCam">Camera</span></span>
		<br><span class="detect">[- Finding camera info -]</span>
		<br><span class="sub">( Occurs once per camera )</span>
	</div>
</div>

</body>
</html>