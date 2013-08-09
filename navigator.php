<?php $request = retrieve_current_user_info($_SESSION['uid'], 4, $_SESSION['session_key']);
		    $response = connect_to_server_and_send_message($request);
			// User's information is contained in $retrived_response
			$retrived_response = unpack_pkg($response);?>
			
<?php 
echo '
<div class = "header">
	<script>
		$(document).ready(function(){
			var initialTop = 0;
		$(".friendlist").hide();
			$(window).scroll(function(event){
				var st = $(document).scrollTop();
				if (st > initialTop){
					$(".tagbar").hide();
					$(".navigator").hover(function(){
						$(".tagbar").show();
						},function(){});
					$(".headerTab").hover(function(){
						$(".tagbar").show();
						},function(){});
					$(".tagbar").hover(function(){},
						function(){
						if(st > initialTop){
					//	console.log(st);
						timer = window.setTimeout(function(){
							$(".tagbar").hide();}, 500);
						}//if
						else{
							$(".tagbar").show();
						}
					});//hover
				}//if
				else{
					$(".tagbar").show();
				}
			});//scroll
	 	});//ready
	</script>
	<div class = "navigator">
		<div class = "headerTab" id = "home">
			<a href="signup.php">Circa</a>
		</div>
		<div class = "headerTab" id = "user">
			<a href="user_profile.php">';echo $retrived_response[1][2].'</a>
		</div>
		<div class = "links">
			<div class = "headerTab" id = "naviActivity">
				<a href = "mainpage.php">Activity</a>
			</div>
			<div class = "headerTab" id = "naviEvent">	
				<a href = "event.php">Event</a>
			</div>
		</div>
		<div class = "headerTab" id = "notification">
			<a href = "localhost">Notification</a>	
		</div>
	</div>

	<div class = "searchbar">
		<form action = "fake.php" method = "post" enctype = "multipart/form-datd">
			<input type = "text" name = "default_search" placeholder="search" /><br/>
			<input name = "search_button" id = "search_button" type = "submit"/>
		</form>
	</div>

	<div class = "tagbar">
		<div class = "tagLinks">
			<div class = "headerTab" id = "tagbarAll">
				<a href = "localhost">All</a>
			</div>
			<div class = "headerTab" id = "tagbarFriend">	
				<a href = "localhost">Friend</a>
			</div>
			<div class = "headerTab" id = "tagbarNUS">	
				<a href = "localhost">NUS</a>
			</div>
		</div>
	</div>
</div>
';