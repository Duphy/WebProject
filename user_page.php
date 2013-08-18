<?php include_once 'header.php';?>

<title>Home page</title>

<style type = "text/css">
	@import url("css/mainpage.css")
</style>


<?php include_once 'navigator.php';?>
<?php 
$str = $_SERVER["QUERY_STRING"];

parse_str($str);
		$user_info = connect_view_user($uid,4);
		$user_event = connect_view_user($uid,1);
		$user_friend = connect_view_user($uid,0);
		$user_tag = connect_view_user($uid,18);
		$user_post = connect_view_user_post_pic($uid,2,MAX_EIGHT_BIT_INT);
		//$user_pic_small
		//$user_pic_large


?>
</head>
<!-- header end -->

<body>
	<div id = mainbody>
		<div id = infobar>
		<?php 
			$name = $user_info[1][1][2];
			$nickname = $user_info[1][1][1];
			$bday = $user_info[1][1][3];
			$gender = $user_info[1][1][4];
			$city = $user_info[1][1][5];
		echo 
			'<div id =name>
				<a href ="user_page.php?id='.$uid.'"><h2>'.$name.'</h2></a>
			</div>
			<div id = info>
				<div id = about>
					<a href ="friend_profile.php?id='.$uid.'">About</a>
				</div>
				<div id = friends>
					<a href ="friend_friendlist.php?id='.$uid.'">Friends</a>
				</div>
				<div id = events>
					<a href ="friend_eventlist.php?id='.$uid.'">Events</a>
				</div>
			</div>
			<div id = post_area>

			</div>
		'
				
			
			
		?>
		
		
		</div>
		<div id = post_area>
		
		</div>
		<div id = event>
		</div>
		
		<div id = friends>
		</div>
	
	
	</div>
</body>