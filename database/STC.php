<?PHP

require_once("service.php");
require_once("common_functions.php");


function unpack_pkg($raw_pkg){
	$pack = convert_string_to_byte_array($raw_pkg);
	$header = $extract_header($pack);
	$package[0]=$header;
	switch ($header[3]){
		case 0:
			$package[1] = unpack_view($pack,$header[4]);
		break;
		case 1:
			$package[1] = unpack_search($pack,$header[4]);
		break;
		case 2:
			$package[1] = unpack_create($pack,$header[4]);
		break;
		case 3:
			$package[1] = unpack_update($pack,$header[4]);
		break;
		case 4:
			$package[1] = unpack_reply($pack,$header[4]);
		break;
		case 5:
			$package[1] = unpack_delete($pack,$header[4]);
		break;
		case 6:
			$package[1] = unpack_validation($pack,$header[4]);
		break;
		case 7:
			$package[1] = unpack_quit($pack,$header[4]);
		break;
		case 10:
			$package[1] = unpack_suggestion($pack,$header[4]);
		break;
		case 12:
			$package[1] = unpack_system_message($pack,$header[4]);
		break;
	}
	return $pkg;
}
function extract_header($pack){
	$pointer = 0;
	$length=readBytes($pack,$pointer,2);
	//byte 0 - 11 are reserved headers
	$session_key=readBytes($pack,$pointer,8);
	//byte 12 - 15 is user
	$uid = readBytes($pack,$pointer,4);
	$pkg_type = readBytes($pack,$pointer,1);
	$pkg_subtype = readBytes($pack,$pointer,1);
	$header=array(
				covert_byte_to_int($length),
				covert_byte_to_string($session_key),
				covert_byte_to_int($uid),
				covert_byte_to_int($pkg_type),
				covert_byte_to_int($pkg_subtype),
	);
	return $header;
}

function unpack_view($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0://view user
			$viewee = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg[0] = $viewee; 
			$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
			switch ($mode){
				case 0:
					$pkg[1]=process_uidsets($pack,$pointer);
				break;
				case 1:
					$pkg[1]=process_eventsets($pack,$pointer);	
				break;
				case 2:
					$pkg[1]=process_postsets($pack,$pointer);
				break;
				case 4:
					$pkg[1]=process_user_simple_other_pack($pack,$pointer);
				break;
				case 18:
					$pkg[1]=process_circatag_pack($pack,$pointer);
				break;
			}
		break;
		case 1:
			$eid = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg[0] = $eid;
			$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
			switch ($mode){
				case 0:
					$pkg[1]=process_uidsets($pack,$pointer);
				break;
				case 2:
					$pkg[1]=process_postsets($pack,$pointer);
				break;
				case 4:
					$pkg[1]=process_event_simple_other_pack($pack,$pointer);
				break;
				case 5:
					$pkg[1]=process_uidsets($pack,$pointer);
				break;
				case 6:
					$pkg[1]=process_setting_pack($pack,$pointer);
				break;
				case 4:
					$pkg[1]=process_schedule_pack($pack,$pointer);
				break;
				case 18:
					$pkg[1]=process_circatag_pack($pack,$pointer);
				break;
			}
		break;
		case 2:
			$pkg[0] = process_posting_display_other_pack($pack,$pointer);
		break;
		case 10:
			$pkg[0]=process_postsets($pack,$pointer);
		break;
		case 11:
			$pkg[0] = process_viewself($pack, $pointer);
		break;
	}
	return $pkg;
}
function unpack_search($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0://view user
			$pkg[0]=process_uidsets($pack,$pointer);
		break;
		case 1:
			$pkg[0]=process_eventsets($pack,$pointer);
		break;
		case 2:
			$pkg[0]=process_postsets($pack,$pointer);
		break;
	}
	return $pkg;
}
function unpack_create($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg[0] = covert_byte_to_int(readBytes($pack,$pointer,1));
	switch ($subtype){
		case 0://view user
			switch ($pkg[0]){
				case 0:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 1:
			switch ($pkg[0]){
				case 0:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}		
		break;
		case 2:
			switch ($pkg[0]){
				case 0:
					$sets=array();
					$sets[0]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
					$sets[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
					$sets[2]=covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
					$pkg[1]=$sets;
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}	
		break;
		case 3:
			switch ($pkg[0]){
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 17:
			switch ($pkg[0]){
				case 0:
					$sets=array();
					$sets[0]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
					$sets[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
					$sets[2]=covert_byte_to_int(readBytes($pack,$pointer,SID_LENGTH));
					$pkg[1]=$sets;
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
	}
	return $pkg;
}
function unpack_update($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0:
			$pkg[0]=process_updates($pack,$pointer);
		break;
		case 1:
			$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg[1]=process_updates($pack,$pointer);
		break;
	}
	return $pkg;
}
function unpack_reply($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 2:
			$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg[2]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg[3]=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg[4]=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
	}
	return $pkg;
}
function unpack_delete($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0:
			$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg[2]=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
		case 2:
			$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg[2]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg[3]=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg[4]=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
		case 22:
			$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			//will update later
			$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg[2]=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg[3]=covert_byte_to_int(readBytes($pack,$pointer,RID_LENGTH));
			$pkg[4]=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
	}
	return $pkg;
}
function unpack_validation($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,1));
	switch ($subtype){
		case 0:
			switch ($pkg[0]){
				case 0:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,8));
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 16:
			switch ($pkg[0]){
				case 0:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
				break;
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 20: case 21:
			switch ($pkg[0]){
				case 1:
					$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
	}
	return $pkg;
}
function unpack_quit($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$pkg[1]=covert_byte_to_int(readBytes($pack,$pointer,1));
	return $pkg;
}
function unpack_suggestion($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_system_message($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function readBytes($array, &$pointer, $length){
	$results=array();
	for($i=$pointer;i<$pointer+$length;$i++){
		$results[]=$array[$i];
	}
	$pointer+=$length;
	return $results;
}
function process_uidsets($pack,&$pointer){
	$uid=array();
	$num_uid = covert_byte_to_int(readBytes($pack,$pointer,4));
	for($i=0;i<$num_uid;$i++){
		$uid[]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	}
	return $uid;
}
function process_eventsets($pack,&$pointer){
	$events=array();
	$num_events = covert_byte_to_int(readBytes($pack,$pointer,4));
	for($i=0;i<$num_friends;$i++){
		$events[]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	}
	return $events;
}

function process_postsets($pack,&$pointer){
	$postings=array();
	$num_postings = covert_byte_to_int(readBytes($pack,$pointer,4));
	for($i=0;i<$num_postings;$i++){
		$sets=array();
		$sets[0]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$sets[1]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$sets[2]=covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
		$postings[]=$sets;
	}
	return $postings;
}
function process_reply($pack,&$pointer){
	$results = array();
	/*4 # replies, <Reply (4 rid, 4 replier_uid,
	 *4 reply_to_uid, 1 reply_content_len, ? reply_content,
			*4 reply_date, 4 reply_time, 1 visibility)>
	*/
	$num_length =4;
	$num_reply = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	for($i=0;$i<$num_reply;$i++){
		$reply = array();
		$reply[0] = covert_byte_to_int(readBytes($pack,$pointer,RID_LENGTH));
		$reply[1]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$reply[2]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$content_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$reply[3] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
		$reply[4] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
		$reply[5] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
		$reply[6] = covert_byte_to_int(readBytes($pack,$pointer,1));
		$results[]=$reply;
	}
	return $results;
}
function process_tags($pack,&$pointer, $num_length){
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$tags = array();
	for($i=0;$i<$num_tags;$i++){
		$tag_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$tags[]= covert_byte_to_string(readBytes($pack,$pointer,$tag_length));
	}
	return $tags;
}
function process_weighted_tags($pack,&$pointer, $num_length){
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$tags = array();
	for($i=0;$i<$num_tags;$i++){
		$temp = array();
		$tag_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$temp[0]= covert_byte_to_string(readBytes($pack,$pointer,$tag_length));
		$temp[1] = covert_byte_to_int(readBytes($pack,$pointer,8));
		$tags[] = $temp; 
	}
	return $tags;
}
function process_user_simple_other_pack($pack,&$pointer){
	$results=array();
	$results[0] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$nickname_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results[1] = covert_byte_to_string(readBytes($pack,$pointer,$nickname_length));
	$name_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results[2] = covert_byte_to_string(readBytes($pack,$pointer,$name_length));
	$birthday = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results[3] = process_to_date($birthday);
	$results[4] = covert_byte_to_int(readBytes($pack,$pointer,1));
	$city_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[5] = covert_byte_to_string(readBytes($pack,$pointer,$city_length));

	$results[6]=process_tags($pack,$pointer,4);

	$results[7]=process_friendsets($pack,$pointer);

	//picture not done

	return $results;
}
function process_event_simple_other_pack($pack,&$pointer){
	$results=array();
	$results[0] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$name_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results[1] = covert_byte_to_string(readBytes($pack,$pointer,$name_length));
	$results[2] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$description_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[3] = covert_byte_to_string(readBytes($pack,$pointer,$description_length));
	$results[4]=process_tags($pack,$pointer,4);
	$city_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[5] = covert_byte_to_string(readBytes($pack,$pointer,$city_length));
	$results[6] = covert_byte_to_int(readBytes($pack,$pointer,4));

	//honors not done

	return $results;
}
function process_setting_pack($pack,&$pointer){
	$num_lenght =1;
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$pkg = array();
	for($i=0;$i<$num_tags;$i++){
		$setting = array();
		$setting[0] = covert_byte_to_int(readBytes($pack,$pointer,1));
		$setting[1]= covert_byte_to_int(readBytes($pack,$pointer,1));
		$pkg[]=$setting;
	}
	return $pkg;
}

function process_schedule_pack($pack,&$pointer){
	/*
	 4 uid, 8 eid, 4 sid,
	4 start_date, 4 start_time,
	4 end_date, 4 end_time,
	1 place_len, ? place
	1 description_len, ?description
	4 #with_users {always 0 for now}
	*/
	$results=array();
	$results[0] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$results[1] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$results[2] = covert_byte_to_int(readBytes($pack,$pointer,SID_LENGTH));
	$results[3] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results[4] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results[5] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results[6] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$location_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[7] = covert_byte_to_string(readBytes($pack,$pointer,$location_length));
	$description_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[8] = covert_byte_to_string(readBytes($pack,$pointer,$description_length));
	$results[9] = covert_byte_to_int(readBytes($pack,$pointer,4));
	return $results;
}

function process_posting_display_other_pack($pack,&$pointer){
	/*Posting_Display_Other_Packet: 8 posting_id, 4 poster_uid,
	 * 8 event_eid, 4 post_date, 4 post_time
	2 content_len, ? content, 1 visibility,
	4 #tags, <Tag (1 tag_len, ? tag)>
	4 # replies, <Reply (4 rid, 4 replier_uid, 4 reply_to_uid,
			1 reply_content_len, ? reply_content,
			4 reply_date, 4 reply_time, 1 visibility)>
	*/
	$results = array();
	$results[0] = covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
	$results[1] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$results[2] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$results[3] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results[4] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$content_length = covert_byte_to_int(readBytes($pack,$pointer,2));
	$results[5] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
	$results[6] = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results[7] = process_tags($pack,$pointer,4);
	$results[8] = process_reply($pack,$pointer);

	return $results;
}
function process_circatag_pack($pack,&$pointer){
	$pkg=array();
	$pkg[0]=covert_byte_to_int(readBytes($pack,$pointer,1));
	$pkg[1] = process_weighted_tags($pack,$pointer);
	return $pkg;
}
function process_to_date($ints){
	$date['year'] = $ints / 10000;
	$int %= 10000;
	$date['month'] = $ints / 100;
	$date['day'] = $ints % 100;
	return $date;
}
function process_to_time($ints){
	$time['hour'] = $ints / 10000;
	$int %= 10000;
	$time['minute'] = $ints / 100;
	$time['second'] = $ints % 100;
	return $time;
}
function process_viewself($pack, &$pointer){
	$pkg = array();
	$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
	switch ($mode){
		case 0:
			$pkg[0]=process_uidsets($pack,$pointer);
			break;
		case 1:
			$pkg[0]=process_eventsets($pack,$pointer);
			break;
		case 2:
			$pkg[0]=process_postsets($pack,$pointer);
			break;
		case 4:
			$pkg[0]=process_user_simple_other_pack($pack,$pointer);
			break;
		case 6:
			$pkg[0]=process_setting_pack($pack,$pointer);
			break;
		case 17:
			$pkg[0]=process_schedule_pack($pack,$pointer);
			break;
		case 18:
			$pkg[0]=process_circatag_pack($pack,$pointer);
			break;
	}
	return $pkg;
}
function process_updates($pack, &$pointer){
	$num_length=1;
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$result = array();	
	for($i=0;$i<$num_tags;$i++){
		$tags = array();
		$tags[0]= covert_byte_to_string(readBytes($pack,$pointer,1));
		$tags[1] = covert_byte_to_int(readBytes($pack,$pointer,8));
		$result[] = $tags;
	}
	return $result;
}
function process_notification($pack, &$pointer){
	$num_length=4;
	$num_msg = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$msg = array();
	for($i=0;$i<$num_tags;$i++){
		$msg[0]= covert_byte_to_string(readBytes($pack,$pointer,1));
		$msg[1]= covert_byte_to_string(readBytes($pack,$pointer,4));
		$msg[2] = covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
		$msg[3] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$msg[4] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$msg[5]= covert_byte_to_string(readBytes($pack,$pointer,1));
		$content_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$msg[6] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
	}
	return $msg;
}