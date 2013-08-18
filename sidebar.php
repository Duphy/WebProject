<?php $request = retrieve_current_user_info($_SESSION['uid'], 0, $_SESSION['session_key']);
		    $response = connect_to_server_and_send_message($request);
			// User's information is contained in $retrived_response
			$retrived_response = unpack_pkg($response);
			$friend_list=$retrived_response[1];?>
<?php 
echo '
<script>
	var left_flag = false;
	var right_flag = false;
	var div;

function controlSpan(param){
		if(param==0){
			div = $(".leftspan");
			if(left_flag==false){
				left_flag=true;
				div.animate({
					left: "+=150px",
				},
					500
				);
			}
			else if(left_flag==true){
				left_flag=false;
				div.animate({
					left: "-=150px",
				},
					500
				);
			}
		}
		if(param==1){
			div = $(".rightspan");
			if(right_flag==false){
				right_flag=true;
				$(".friendlist").show();
				div.animate({
					right: "+=150px",
				},
					500
				);
			}
			else if(right_flag==true){
				right_flag=false;
				div.animate({
					right: "-=150px",
				},
					500
				);
		window.setTimeout(function(){$(".friendlist").hide();}, 700);
			}
		}
}
</script>
<div class = "leftspan">
	<div class = "leftButton">
	 <button onclick = "controlSpan(0);">left</button>
 	</div>
	<div class = "setting"><a href = "setting_user_profile.php">profile settings</a></div>
</div>

<div class = "rightspan">
	<div class = "rightButton">
		<button onclick = "controlSpan(1);">right</button>
 	</div>
	<div class = "friendlist">
		<table>
			<tr>';
				foreach ($friend_list as $friend){
					$retrived_response = connect_view_user($friend,4);
					//print_r($retrived_response);
					$friend_name = $retrived_response[1][1][2];
					//echo $friend_name;
				echo '
				<td><img src = "1.jpg"></td>
				<td><a href = "user_page.php?uid='.$retrived_response[1][1][0].'">'.$friend_name.'</p></td>';
			}
			echo '
			</tr>
		</table>
	
	</div>
</div>
';