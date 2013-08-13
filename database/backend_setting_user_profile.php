
<?php include_once '../header.php';?>
</head>

<body>

	<div id = "header">
		<div id ="logo">
			<img src = "logo.jpg">
		</div>

	</div>

	<div id = "presentation_area">
		<a>Special Features</a>
	</div>


	<?php
		$updates = array(
				array(1,$_POST['name']),
				array(2,$_POST['nickname']),
				array(3,$_POST['birthday']),
				array(4,$_POST['gender']),
				array(5,$_POST['city']),
				array(6,$_POST['state']),
				array(7,$_POST['country']),		
		);
		
	
	
		$request = update_user( $_SESSION['uid'],$updates,$_SESSION['session_key']);

		$response = connect_to_server_and_send_message($request);
		$pkg = unpack_pkg($response);
		
		
		
		$log_in_response = $pkg[1];
		//echo '<br></br>';
		//print_r($pkg);
		$uid = $pkg[0][2];
		$succeeded = $log_in_response[0];
		$session_key = $log_in_response[1];
		
		$_SESSION['uid'] = $uid;
		$_SESSION['session_key'] = $session_key;

		//echo '<br></br>session_key: ' . $session_key;
		
		
		//<?php
		if ($succeeded == SUCCESSFUL)
		{
			header("Location: ../mainpage.php");			
		}  
		
		else{
			echo "<br>Wrong ID or Passwords</br>";
		}
		?>



</body>

<footer>

</footer>

</html>