<?php include_once '../header.php';?>


<?php 
$str = $_SERVER["QUERY_STRING"];

parse_str($str);
	
echo '<div class = "comment">
<form action = "backend_addfriend.php?='.$uid.'" method = "post" enctype = "multipart/form-datd">
<input type = "text" name = "message" placeholder = "Say something to identify yourself?"/><br/>
<input name = "search_button" id = "search_button" type = "submit" value = "comment"/>
</form>
</div>';
$response = connect_request(0, $uid, "hello world");
print_array($response);
?>