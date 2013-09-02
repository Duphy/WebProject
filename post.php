
<?php include_once 'header.php';?>
<?php 	
	//$response = connect_create_post($event_id, $_POST['post'], $visibility, $_POST['tags']);
	
	$tags = array("Love");
	//$tags = array();
	$response = connect_create_post(0, 'LOVELOVELOVELOVE', 0, $tags);
	print_array($response);
	//$arr = array('a' => 1, 'b' => 2, 'c' => 3, 'd' => 4, 'e' => 5);
	if($response[1][0]==1){
		$arr = array(
			'success' => false,
			'reason' => $response[1][1][0]
		);
	}
	else{
		$arr = array(
			'success' => true,
			'uid' => $response[1][1][0],
			'eid' => $response[1][1][1],
			'pid' => $response[1][1][2]
		);
	}
	echo json_encode($arr);
?>