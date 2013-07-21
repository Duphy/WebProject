<?php include_once '../header.php';?>

</head>

<body>

	<div id = "header">
		<div id ="logo">
			<img src = "logo.jpg">
		</div>
		<div id ="login">
			<a href="login.html">Login</a>
		</div>
	</div>

	<div id = "presentation_area">
		<a>Special Features</a>
	</div>


	<?php

		$request = login( LOG_IN_WITH_EMAIL, $_POST['email'], $_POST['password']);

		$response = connect_to_server_and_send_message($request);

		$log_in_response = unpack_package($response);

		// TODO store these values to $_SESSION
		$uid = $log_in_response['uid'];
		$succeeded = $log_in_response['succeeded'];
		$session_key = $log_in_response['session_key'];

		$_SESSION['uid'] = $uid;
		$_SESSION['session_key'] = $session_key;

		echo '<br></br>UID: ' . $uid;
		echo '<br></br>succeeded: ' . $succeeded;
		echo '<br></br>session_key: ' . $session_key;


		if ($succeeded == SUCCESSFUL){
			$request = retrieve_current_user_info($uid, 4, $session_key);
			$response = connect_to_server_and_send_message($request);
			
			// User's information is contained in $retrived_response
			$retrived_response = unpack_package($response);
		}
	?>


</body>

<footer>

</footer>

</html>