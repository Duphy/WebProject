<?php include_once 'header.php';?>

<title>Home page</title>

<style type = "text/css">
	@import url("css/mainpage.css")
</style>

</head>
<body>
<?php include_once 'navigator.php';?>

<!-- header end -->
<div id = "mainbody">
	<div class = "post">
	<?php 
		$post_uid=1235770;
		$post_eid=0;
		$post_pid=20;
		//$post_uid=1235767;
		//$post_eid=0;
		//$post_pid=13;
		//die();
		$response = connect_view_post($post_uid, $post_eid, $post_pid);
	//print_array($response);
	?>
		<div class ="userpanel">
			<a>
				<img src= "a.jpg">
				<?php $retrived_response = connect_view_user($post_uid,4);
					$friend_name = $retrived_response[1][1][2];
					echo $friend_name;
					?>
			</a>
		</div>
		
		<div class = "date"><?php print_date($response[1][3])?></div>
		<div class = "time"><?php print_time($response[1][4])?></div>
		<div class = "postTag">
			<?php print_tags($response[1][7]);?>
		</div>
		
		<div class = "status">share or post</div>
		
		<div class = "content">
		<p><?php echo $response[1][5]?></p>
		</div>
		<div class = "reply">
			<?php 
			foreach ($response[1][8] as $reply){
				if($reply[2]==$response[1][1])
					echo '<a href = "user_page.php?uid='.$reply[1].'" target="_blank"><p>'.$reply[3].'</a> says: </p>';
				else 
					echo '<a href = "user_page.php?uid='.$reply[1].'" target="_blank"><p>'.$reply[3].
						'</a> replies <a href = "user_page.php?uid='.$reply[2].'" target="_blank">'
						.$reply[4].'</a>: </p>';
				echo $reply[5];
				echo "<br></br>";
				print_date($reply[6]);
				print_time($reply[7]);
			}
		?>
		</div>
		<div class = "comment">
		<form action = "fake.php" method = "post" enctype = "multipart/form-datd">
			<input type = "text" name = "default_search" placeholder = "Want to say something?"/><br/>
			<input name = "search_button" id = "search_button" type = "submit" value = "comment"/>
		</form>
	</div>
	</div>

</div>
<?php include_once 'sidebar.php';?>

</body>
</html>