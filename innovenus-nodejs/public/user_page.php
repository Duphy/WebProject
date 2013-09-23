<?php include_once 'header.php';?>

<title>Home page</title>

<?php include_once 'navigator.php';?>
<?php 
$str = $_SERVER["QUERY_STRING"];

parse_str($str);
		$user_info = connect_view_user($uid,4);
		$user_event = connect_view_user($uid,1);
		$user_friend = connect_view_user($uid,0);
		//$user_tag = connect_view_user($uid,18);
		$user_post = connect_view_user_post_pic($uid,2,MAX_EIGHT_BIT_INT);
		//$user_pic_small
		//$user_pic_large


?>
</head>
<!-- header end -->

<body>
	<div id = "mainbody" style="margin-left:auto;margin-right:auto;margin-top:45px;width:80%">
		<div id="infobar" class="hero-unit">
		<?php 
			$name = $user_info[1][1][2];
			$nickname = $user_info[1][1][1];
			$bday = $user_info[1][1][3];
			$gender = $user_info[1][1][4];
			$city = $user_info[1][1][5];
			$user_tag = $user_info[1][1][6];
			$common_friends = $user_info[1][1][7];
		echo 
			'<div id ="profile">
				<div id ="name">
					<a href ="user_page.php?id='.$uid.'"><h1><em>'.$name.'</em></h1></a>
				</div>
				<div id = "profile_tags">
					';
				//print_array($user_tag);
				print_tags($user_tag);
				echo'
				</div>
			</div>
			<div id = "info">
				<ul>
				<li><div id = "about">
					<a href ="user_profile.php?id='.$uid.'">About</a>
				</div></li>
				<li><div id = "friends">
					<a href ="user_friend.php?id='.$uid.'">Friends</a>
				</div></li>
				<li><div id = "events">
					<a href ="user_event.php?id='.$uid.'">Events</a>
				</div></li>
				</ul>
			</div>
			<div id = "post_area">

			</div>
		'
				
			
			
		?>
		
		</div>
		<div id = event>
		</div>
		
		<div id = common_friends>
		</div>
	
	
	</div>
</body>