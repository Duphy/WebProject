<?php include_once 'header.php';?>
<title>Profile Setting</title>
</head>
<body>
<?php include_once 'navigator.php';?>

	<div id = "form_area">

		<h1>My Profile and Settings</h1>

		<?php
			require_once('database/serverUtil.php');
			require_once('database/client_request.php');
			$request = view_self();
		?>

		<form>
			<fieldset>
				<legend>Personalia</legend>

				<label>Email</label>
					<input type = "email" name = "email"><br>
				<label>Nick Name</label>
					<input type = "text" name = "nick_name"><br>
				<label>Real Name</label>
					<input type = "text" name = "real_name"><br>
				<label>Birthday</label>
					<input type = "text" name = "birthday"><br>
				<label>Gender</label>
					<input type = "radio" name = "gender" id = "female" value = "female" checked = "checked" />
					&nbsp;&nbsp;Female&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "male" value = "male"/>
					Male&nbsp;&nbsp;
					<input type = "radio" name = "gender" id = "others" value = "others"/>
					Others
					<br>
				<label>City</label>
					<input type = "text" name = "city"><br>
				<label>State</label>
					<input type = "text" name = "State"><br>
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