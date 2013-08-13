<?php include_once 'header.php';?>

<title>Welcome to Circa!</title>
<style type = "text/css">
	@import url("css/signup.css")
</style>
</head>

<body>

	<div id = "header">
		<div id ="logo">
			<img src = "logo.jpg">
		</div>
		<div id ="login">
			<a href="login.php">Login</a>
		</div>
	</div>

	<div id = "presentation_area">
		<a>Special Features</a>
	</div>

	<div id = "form_area">

		<h1>Sign Up</h1>

		<form action = "database/backend_signup.php" method = "post">

			<input type = "text" name = "nick_name" placeholder = "Nick Name" autofocus><br>
			<input type = "email" name = "email_first" placeholder = "Your Email Address"><br>
			<input type = "email" name = "email_reentered" placeholder = "Reenter Email Address"><br>
			<input type = "password" name = "password_first" placeholder = "Password"><br>
			<input type = "password" name = "password_reentered" placeholder = "Confirm Password"><br>
			<input type = "text" name = "birthday" placeholder = "Birthday"><br>
			<input type = "radio" name = "gender" id = "female" value = "female" checked = "checked" />
					&nbsp;&nbsp;Female&nbsp;&nbsp;
			<input type = "radio" name = "gender" id = "male" value = "male"/>
					Male&nbsp;&nbsp;
			<input type = "radio" name = "gender" id = "others" value = "others"/>
					Others
			<br>
			<input type = "text" name = "city" placeholder = "City"><br>
			<h5>Captcha Embed Here</h5>
			<input type = "checkbox" name = "agreed">I have read and agreed to the <a href = "" target = "_blank">terms of service</a>.<br><br />
			<input type = "submit" value = "Sign Me Up"><br>
		</form>

	</div>

</body>

<footer>

</footer>

</html>