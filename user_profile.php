<?php include_once 'header.php';?>
<title>Profile</title>
<style type = "text/css">
	@import url("css/user_profile.css")
</style>
</head>
<body>
<?php include_once 'navigator.php';?>
<?php $request = retrieve_current_user_info($_SESSION['uid'], 4, $_SESSION['session_key']);
		    $response = connect_to_server_and_send_message($request);
			// User's information is contained in $retrived_response
			$retrived_response = unpack_pkg($response);
			//echo '<br>Recived pkg</br>'.$retrived_response[1][4];
?>
			
<div id = "mainbody">
	<div class ="basic">
		<h2>Basic Information</h2>
		<table>
			<tr>
				<td><p>Gender: </p></td>
				<td><p>
			<?php print_gender($retrived_response[1][8]);?></p></td>
			</tr>
			<tr>
				<td>Birthday: </td>
				<td><p><?php 
				print_date($retrived_response[1][3]);
				?>
			</tr>
			<tr>
				<td>UID: </td>
				<td><p><?php 
				print_date($retrived_response[1][3]);
				?>
			</tr>
		</table>
	</div>
	<div class = "place">
		<h2>Places</h2>
		<table>
			<tr>
				<td><p>City:    </p></td>
				<td><p><?php echo $retrived_response[1][9];?></p></td>
			</tr>
			<tr>
				<td><p>State:    </p></td>
				<td><p><?php echo $retrived_response[1][10];?></p></td>
			</tr>
			<tr>
				<td><p>Country:    </p></td>
				<td><p><?php echo $retrived_response[1][11];?></p></td>
			</tr>
		</table>
	</div>
	<div class = "contact">
		<h2>Contact Information</h2>
		<table>
			<tr>
				<td><p>Phone: </p></td>
				<td><p>88888888</p></td>
			</tr>
			<tr>
				<td><p>Email: </p></td>
				<td><p>cs@circatag</p></td>
			</tr>
			<tr>
				<td><p>Website: </p></td>
				<td><a href = "www.circatag.com">www.circatag.com</a></td>
			</tr>
		</table>
	</div>
	<div class = "employment">
		<h2>Works and Education</h2>
		<table>
			<tr>
				<td><img src = "http://www.nus.edu.sg/identity/logo/images/nus-hlogo-color.gif"></td>
				<td><a href="www.nus.edu.sg">National University of Singapore</a></td>
			</tr>
			</table>
	</div>
	<div class = "tags">
		<div class = "visibleTags">
			<h2>Visible Tags</h2>
			<p>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			</p>
		</div>
		<div class = "hiddenTags">
			<h2>Hidden Tags</h2>
			<p>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			<br>
			</p>
			
		</div>
	</div>
</div>
<?php include_once 'sidebar.php';?>
</body>
</html>