
<?php include_once 'header.php';?>
<?php 	
	//$response = connect_create_post($event_id, $_POST['post'], $visibility, $_POST['tags']);
	
	$tags = array("NUS","SOC","Singapore","Love");
	//$tags = array();
	$response = connect_create_post(0, 'Test for Helloworld!', 0, $tags);
	print_array($response);
?>