<?php
require_once ('database/service.php');
// if (session_status() != PHP_SESSION_ACTIVE){
// 	// !isset($_SESSION['session_started']) ||	$_SESSION['session_started'] != TRUE
//session_save_path ("session");
//ini_set('session.gc_probability', 1);
session_start();
// 	$_SESSION['session_started'] = TRUE;
// 	echo '<br></br>Session Started!';
// } else{
// 	echo 'session started already!';
// }

echo '
<!DOCTYPE html>
<html lang = "en">
<head>

	<meta charset="utf-8" />
	<link rel="stylesheet" href="css/style.css"/>

	<!--[if lt IE 9]>
	   <script>
			var e = ("abbr,article,aside,audio,canvas,datalist,details," + "figure,footer,header,hgroup,mark,menu,meter,nav,output," + "progress,section,time,video").split(', ');
			     for (var i = 0; i < e.length; i++) {
			       document.createElement(e[i]);
	     	}
	   </script>
				
	<![endif]-->
	<link href = "css/bootstrap-responsive.min.css" rel = "stylesheet">
	<link href = "css/bootstrap.min.css" rel = "stylesheet">
	<script src = "javascript/jquery-1.10.1.min.js"></script>
	<script src = "javascript/bootstrap.min.js"></script>	
	';
