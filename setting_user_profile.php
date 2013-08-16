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
<h2><?php echo $retrived_response[1][2];?></h2>
		<form action = "database/backend_setting_user_profile.php" method = "post">
			<fieldset>
				<legend>Personalia</legend>
				<label>Nick Name</label>
					<input type = "text" name = "nickname" value = "<?php echo $retrived_response[1][2];?>"><br>
				<label>Real Name</label>
					<input type = "text" name = "name" value = "<?php echo $retrived_response[1][1];?>"><br>
				<label>Birthday</label>
					<input type = "text" name = "birthday"value = "<?php echo $retrived_response[1][3]['year'].$retrived_response[1][3]['month'].$retrived_response[1][3]['day'];?>"><br>
				<label>Gender</label>
					<input type = "radio" name = "gender" id = "female" value = 1 
					checked = <?php if($retrived_response[1][8]==1)echo "checked";
								else echo "unchecked";?> />
					&nbsp;&nbsp;Female&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "male" value = 0 
					<?php if($retrived_response[1][8]==0)echo "checked";
								else echo "unchecked";?> />
					Male&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "others" value = 2
					<?php if($retrived_response[1][8]==2)echo "checked";
								else echo "unchecked";?> />
					Others
					<br>
				<label>City</label>
					<input type = "text" name = "city" value = "<?php echo $retrived_response[1][9];?>"><br>
				<label>State</label>
					<input type = "text" name = "state" value = "<?php echo $retrived_response[1][10];?>"><br>
				<label>Country</label>
					<input type = "text" name = "country" value = "<?php echo $retrived_response[1][11];?>"><br>
			</fieldset>

			<br>

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