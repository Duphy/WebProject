<?php include_once 'header.php';?>
<title>Profile Setting</title>
</head>
<body>
<?php include_once 'navigator.php';?>
<?php $request = retrieve_current_user_info($_SESSION['uid'], 4, $_SESSION['session_key']);
		    $response = connect_to_server_and_send_message($request);
			// User's information is contained in $retrived_response
			$retrived_response = unpack_pkg($response);
			//echo '<br>Recived pkg</br>'.$retrived_response[1][4];
			//print_r($retrived_response[1]);
			?>
	<div id = "form_area">

		<h1>My Profile and Settings</h1>

		<form action = "database/backend_setting_user_profile.php" method = "post">
			<fieldset>
				<legend>Personalia</legend>
				<label>Email</label>
					<input type = "email" name = "email"><br>
				<label>Nick Name</label>
					<input type = "text" name = "nickname"><br>
				<label>Real Name</label>
					<input type = "text" name = "name"><br>
				<label>Birthday</label>
					<input type = "text" name = "birthday"><br>
				<label>Gender</label>
					<input type = "radio" name = "gender" id = "female" value = 1 checked = "checked" />
					&nbsp;&nbsp;Female&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "male" value = 0/>
					Male&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "others" value = 2/>
					Others
					<br>
				<label>City</label>
					<input type = "text" name = "city"><br>
				<label>State</label>
					<input type = "text" name = "state"><br>
				<label>Country</label>
					<input type = "text" name = "country"><br>
			</fieldset>

			<br>

			<fieldset>
				<legend>Change Password</legend>
				<input type = "password" name = "password_current" placeholder = "Current Password"><br>
				<input type = "password" name = "password_first" placeholder = "New Password"><br>
				<input type = "password" name = "password_reentered" placeholder = "Confirm Password"><br>	
			</fieldset>

			<br>

			<fieldset>
				<legend>About Yourself</legend>
				
				<label>Visible Tags</label>
					<input type = "text" name = "visible_tags"><br>
				<label>Hidden Tags</label>
					<input type = "text" name = "hidden_tags"><br>
				<label>Self Description</label><br>
					<textarea id = "self_description" rows="4" cols="50" name = "self_description"></textarea>
			</fieldset>

			<br>

			<input type = "submit" value = "Save Canges"><br>
			
		</form>

	</div>
<?php include_once 'sidebar.php';?>
</body>

<footer>

</footer>

</html>