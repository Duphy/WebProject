
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
					echo "Password is failed to update.<br></br>";
					break;
				case 1:
					echo "Name is failed to update.<br></br>";
					break;
				case 2:
					echo "Nickname is failed to update.<br></br>";
					break;
				case 3:
					echo "Birthday is failed to update.<br></br>";
					break;
				case 4:
					echo "Gender is failed to update.<br></br>";
					break;
				case 5:
					echo "City is failed to update.<br></br>";
					break;
				case 6:
					echo "State is failed to update.<br></br>";
					break;
				case 7:
					echo "Country is failed to update.<br></br>";
					break;
				case 8:
					echo "Tags are failed to add.<br></br>";
					break;
				case 9:
					echo "Tags are failed to delete.<br></br>";
					break;
				case 10:
					echo "Setting is failed to update.<br></br>";
					break;
			}
		}
		else
			$flag = true;
	}
	if($flag)
		echo "<br></br> You have successfully update your profiles. <br></br>";
	
	?>



</body>

<footer> </footer>

</html>
