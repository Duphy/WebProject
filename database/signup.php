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
		
		$gender = $_POST['gender'];
		$gender_code = 0;
		switch ($gender) {
			case 'female':
				$gender_code = 0;
				break;
			
			case 'male':
				$gender_code = 1;
				break;

			case 'others':
				$gender_code = 2;
				break;
		}

		// Need to convert birthday to an integer, e.g. 19911019
		$birthday = (int)$_POST['birthday']; 
 		//original
		//$request = create_new_user( $_POST['email_first'], $_POST['password_first'], $_POST['nick_name'], $birthday, $gender_code, $_POST['city']);
		//test use 
		$request = create_new_user( $_POST['email_first'], $_POST['password_first'], 
				$_POST['nick_name'], $birthday, $gender_code, $_POST['city']);
		// Server and socket is already running by the indluded header

		$response = connect_to_server_and_send_message($request);
		
		$results = unpack_pkg($response);
		print_r($results);
	?>


</body>

<footer>

</footer>

</html>