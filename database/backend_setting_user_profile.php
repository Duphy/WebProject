
<?php include_once '../header.php';?>
</head>

<body>

	<div id="header">
		<div id="logo">
			<img src="logo.jpg">
		</div>

	</div>

	<div id="presentation_area">
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
	//print_byte_array($response,sizeof($response));
	$pkg = unpack_pkg($response);
	$flag =false;
	foreach ($pkg as $e){
		if($e[1]==1){
			switch ($e[0]){
				case 0:
					echo json_encode("Password is failed to update.");
					break;
				case 1:
					echo json_encode("Name is failed to update.");
					break;
				case 2:
					echo json_encode("Nickname is failed to update.");
					break;
				case 3:
					echo json_encode("Birthday is failed to update.");
					break;
				case 4:
					echo json_encode("Gender is failed to update.");
					break;
				case 5:
					echo json_encode("City is failed to update.");
					break;
				case 6:
					echo json_encode("State is failed to update.");
					break;
				case 7:
					echo json_encode("Country is failed to update.");
					break;
				case 8:
					echo json_encode("Tags are failed to add.");
					break;
				case 9:
					echo json_encode("Tags are failed to delete.");
					break;
				case 10:
					echo json_encode("Setting is failed to update.");
					break;
			}
		}
		else
			$flag = true;
	}
	if($flag)
		echo json_encode("You have successfully update your profiles.");
	
	//TODO:echo json
	//$arr = array('a' => 1, 'b' => 2, 'c' => 3, 'd' => 4, 'e' => 5);

	//echo json_encode($arr);
	
	//$request = retrieve_current_user_info($_SESSION['uid'], 4, $_SESSION['session_key']);
	//$response = connect_to_server_and_send_message($request);
	// User's information is contained in $retrived_response
	//$retrived_response = unpack_pkg($response);
	//print_array($retrived_response);
	?>



</body>

<footer> </footer>

</html>
