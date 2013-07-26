<?PHP

require_once("serverUtil.php");
require_once("common_functions.php");


function unpack($raw_pkg){
	$pack = convert_string_to_byte_array($raw_pkg);
	$header = $extract_header($pack);
	$pkg['header']=$header;
	switch ($header['type']){
		case 0:
			$pkg['content'] = unpack_view($pack,$header['subtype']);
		break;
		case 1:
			$pkg['content'] = unpack_search($pack,$header['subtype']);
		break;
		case 2:
			$pkg['content'] = unpack_create($pack,$header['subtype']);
		break;
		case 3:
			$pkg['content'] = unpack_update($pack,$header['subtype']);
		break;
		case 4:
			$pkg['content'] = unpack_reply($pack,$header['subtype']);
		break;
		case 5:
			$pkg['content'] = unpack_delete($pack,$header['subtype']);
		break;
		case 6:
			$pkg['content'] = unpack_validation($pack,$header['subtype']);
		break;
		case 7:
			$pkg['content'] = unpack_quit($pack,$header['subtype']);
		break;
		case 10:
			$pkg['content'] = unpack_suggestion($pack,$header['subtype']);
		break;
		case 12:
			$pkg['content'] = unpack_system_message($pack,$header['subtype']);
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
				'length' => covert_byte_to_int($length),
				'session_key' => covert_byte_to_string($session_key),
				'uid' => covert_byte_to_int($uid),
				'type' => covert_byte_to_int($pkg_type),
				'subtype' => covert_byte_to_int($pkg_subtype),
	);
	return $header;
}

function unpack_view($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0://view user
			$viewee = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg['viewee'] = $viewee; 
			$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
			switch ($mode){
				case 0:
					$pkg["friends"]=process_uidsets($pack,$pointer);
				break;
				case 1:
					$pkg["events"]=process_eventsets($pack,$pointer);	
				break;
				case 2:
					$pkg["posts"]=process_postsets($pack,$pointer);
				break;
				case 4:
					$pkg['users']=process_user_simple_other_pack($pack,$pointer);
				break;
				case 18:
					$pkg['tags']=process_circatag_pack($pack,$pointer);
				break;
			}
		break;
		case 1:
			$eid = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg['eid'] = $eid;
			$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
			switch ($mode){
				case 0:
					$pkg["members"]=process_uidsets($pack,$pointer);
				break;
				case 2:
					$pkg["posts"]=process_postsets($pack,$pointer);
				break;
				case 4:
					$pkg['users']=process_event_simple_other_pack($pack,$pointer);
				break;
				case 5:
					$pkg["managers"]=process_uidsets($pack,$pointer);
				break;
				case 6:
					$pkg['event_setting']=process_setting_pack($pack,$pointer);
				break;
				case 4:
					$pkg['schedules']=process_schedule_pack($pack,$pointer);
				break;
				case 18:
					$pkg['tags']=process_circatag_pack($pack,$pointer);
				break;
			}
		break;
		case 2:
			$pkg['post'] = process_posting_display_other_pack($pack,$pointer);
		break;
		case 10:
			$pkg['posts']=process_postsets($pack,$pointer);
		break;
		case 11:
			$pkg['viewself'] = process_viewself($pack, $pointer);
		break;
	}
	return $pkg;
}
function unpack_search($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0://view user
			$pkg["friends"]=process_uidsets($pack,$pointer);
		break;
		case 1:
			$pkg["events"]=process_eventsets($pack,$pointer);
		break;
		case 2:
			$pkg["posts"]=process_postsets($pack,$pointer);
		break;
	}
	return $pkg;
}
function unpack_create($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg['status'] = covert_byte_to_int(readBytes($pack,$pointer,1));
	switch ($subtype){
		case 0://view user
			switch ($pkg['status']){
				case 0:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
				break;
				case 1:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 1:
			switch ($pkg['status']){
				case 0:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
				break;
				case 1:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}		
		break;
		case 2:
			switch ($pkg['status']){
				case 0:
					$sets=array();
					$sets['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
					$sets['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
					$sets['pid']=covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
					$pkg["content"]=$sets;
				break;
				case 1:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}	
		break;
		case 3:
			switch ($pkg['status']){
				case 1:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 17:
			switch ($pkg['status']){
				case 0:
					$sets=array();
					$sets['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
					$sets['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
					$sets['sid']=covert_byte_to_int(readBytes($pack,$pointer,SID_LENGTH));
					$pkg["content"]=$sets;
				break;
				case 1:
					$pkg["content"]=covert_byte_to_int(readBytes($pack,$pointer,1));
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
			$pkg['updates']=process_updates($pack,$pointer);
		break;
		case 1:
			$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg['updates']=process_updates($pack,$pointer);
		break;
	}
	return $pkg;
}
function unpack_reply($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 2:
			$pkg['poster_uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg['reply_to_uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg['pid']=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
	}
	return $pkg;
}
function unpack_delete($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0:
			$pkg['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
		case 2:
			$pkg['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg['pid']=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
		case 22:
			$pkg['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
			//will update later
			$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
			$pkg['pid']=covert_byte_to_int(readBytes($pack,$pointer,PID_LENGTH));
			$pkg['rid']=covert_byte_to_int(readBytes($pack,$pointer,RID_LENGTH));
			$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
		break;
	}
	return $pkg;
}
function unpack_validation($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
	switch ($subtype){
		case 0:
			switch ($pkg['status']){
				case 0:
					$pkg['session_key']=covert_byte_to_int(readBytes($pack,$pointer,8));
				break;
				case 1:
					$pkg['reason']=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 16:
			switch ($pkg['status']){
				case 0:
					$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
				break;
				case 1:
					$pkg['reason']=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
		case 20: case 21:
			switch ($pkg['status']){
				case 1:
					$pkg['reason']=covert_byte_to_int(readBytes($pack,$pointer,1));
				break;
			}
		break;
	}
	return $pkg;
}
function unpack_quit($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	$pkg['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$pkg['status']=covert_byte_to_int(readBytes($pack,$pointer,1));
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
		$sets['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$sets['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$sets['pid']=covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
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
		$reply['rid'] = covert_byte_to_int(readBytes($pack,$pointer,RID_LENGTH));
		$sets['replier_uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$sets['reply_to_uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$content_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$results['content'] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
		$results['reply_date'] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
		$results['reply_time'] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
		$results['visibility'] = covert_byte_to_int(readBytes($pack,$pointer,1));
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
		$tag_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$tags['tags']= covert_byte_to_string(readBytes($pack,$pointer,$tag_length));
		$tags['weight'] = covert_byte_to_int(readBytes($pack,$pointer,8));

	}
	return $tags;
}
function process_user_simple_other_pack($pack,&$pointer){
	$results=array();
	$results['uid'] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$nickname_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results['nickname'] = covert_byte_to_string(readBytes($pack,$pointer,$nickname_length));
	$name_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results['name'] = covert_byte_to_string(readBytes($pack,$pointer,$name_length));
	$birthday = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results['birthday'] = process_to_date($birthday);
	$results['gender'] = covert_byte_to_int(readBytes($pack,$pointer,1));
	$city_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['city'] = covert_byte_to_string(readBytes($pack,$pointer,$city_length));

	$results['tags']=process_tags($pack,$pointer,4);

	$results['common_friends']=process_friendsets($pack,$pointer);

	//picture not done

	return $results;
}
function process_event_simple_other_pack($pack,&$pointer){
	$results=array();
	$results['eid'] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$name_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results['name'] = covert_byte_to_string(readBytes($pack,$pointer,$name_length));
	$results['creater'] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$description_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['description'] = covert_byte_to_string(readBytes($pack,$pointer,$description_length));
	$results['tags']=process_tags($pack,$pointer,4);
	$city_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['city'] = covert_byte_to_string(readBytes($pack,$pointer,$city_length));
	$results['ratings'] = covert_byte_to_int(readBytes($pack,$pointer,4));

	//honors not done

	return $results;
}
function process_setting_pack($pack,&$pointer){
	$num_lenght =1;
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$pkg = array();
	for($i=0;$i<$num_tags;$i++){
		$setting = array();
		$setting['index'] = covert_byte_to_int(readBytes($pack,$pointer,1));
		$tags['value']= covert_byte_to_int(readBytes($pack,$pointer,1));
		$pkg[]=$tags;
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
	$results['uid'] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$results['eid'] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$results['sid'] = covert_byte_to_int(readBytes($pack,$pointer,SID_LENGTH));
	$results['start_date'] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results['start_time'] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results['end_date'] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results['end_time'] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$location_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['place'] = covert_byte_to_string(readBytes($pack,$pointer,$location_length));
	$description_length = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['description'] = covert_byte_to_string(readBytes($pack,$pointer,$description_length));
	$results['num_collaborators'] = covert_byte_to_int(readBytes($pack,$pointer,4));
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
	$results['pid'] = covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
	$results['uid'] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
	$results['eid'] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
	$results['post_date'] = process_to_date(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$results['post_time'] = process_to_time(covert_byte_to_int(readBytes($pack,$pointer,4)));
	$content_length = covert_byte_to_int(readBytes($pack,$pointer,2));
	$results['content'] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
	$results['visibility'] = covert_byte_to_int(readBytes($pack,$pointer,1));
	$results['tags'] = process_tags($pack,$pointer,4);
	$results['reply'] = process_reply($pack,$pointer);

	return $results;
}
function process_circatag_pack($pack,&$pointer){
	$pkg=array();
	$pkg['opt']=covert_byte_to_int(readBytes($pack,$pointer,1));
	$pkg['tags'] = process_weighted_tags($pack,$pointer);
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
			$pkg["friends"]=process_uidsets($pack,$pointer);
			break;
		case 1:
			$pkg["events"]=process_eventsets($pack,$pointer);
			break;
		case 2:
			$pkg["posts"]=process_postsets($pack,$pointer);
			break;
		case 4:
			$pkg['users']=process_user_simple_other_pack($pack,$pointer);
			break;
		case 6:
			$pkg['user_setting']=process_setting_pack($pack,$pointer);
			break;
		case 17:
			$pkg['schedules']=process_schedule_pack($pack,$pointer);
			break;
		case 18:
			$pkg['tags']=process_circatag_pack($pack,$pointer);
			break;
	}
	return $pkg;
}
function process_updates($pack, &$pointer){
	$num_length=1;
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$tags = array();
	for($i=0;$i<$num_tags;$i++){
		$tags['attribute']= covert_byte_to_string(readBytes($pack,$pointer,1));
		$tags['status'] = covert_byte_to_int(readBytes($pack,$pointer,8));
	}
	return $tags;
}
function process_notification($pack, &$pointer){
	$num_length=4;
	$num_msg = covert_byte_to_int(readBytes($pack,$pointer,$num_length));
	$msg = array();
	for($i=0;$i<$num_tags;$i++){
		$msg['mode']= covert_byte_to_string(readBytes($pack,$pointer,1));
		$msg['seq']= covert_byte_to_string(readBytes($pack,$pointer,4));
		$msg['pid'] = covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
		$msg['uid'] = covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$msg['eid'] = covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$msg['action']= covert_byte_to_string(readBytes($pack,$pointer,1));
		$content_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$msg['msg'] = covert_byte_to_string(readBytes($pack,$pointer,$content_length));
	}
	return $msg;
}