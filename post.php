
<?php include_once 'header.php';?>
<?php 	
	//$response = connect_create_post($event_id, $_POST['post'], $visibility, $_POST['tags']);
	
	$tags = array("Love");
	//$tags = array();
	$response = connect_create_post(0, 'LOVELOVELOVELOVELOVE', 0, $tags);
	print_array($response);
?>