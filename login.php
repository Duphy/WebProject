<?php include_once 'header.php';?>

</head>
<body>

	<div id = "header"> </div>

	<div id = "presentation_area"> </div>

	<div id = "form_area">

		<h1>Log In</h1>

		<form action = "database/login.php" method = "post">

			<input type = "text" name = "email" placeholder = "Email Address" autofocus><br>
			<input type = "password" name = "password" placeholder = "Password"><a href = "">Forget Password</a><br>
			<input type = "submit" value = "Log Me In"><br>
			
		</form>

	</div>

</body>

<footer>
</footer>

</html>