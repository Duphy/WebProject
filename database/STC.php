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
	$pointer += 4;
	$session_key=readBytes($pack,$pointer,8);
	$pointer += 8;
	//byte 12 - 15 is user
	$uid = readBytes($pack,$pointer,4);
	$pointer+=4;
	$pkg_type = readBytes($pack,$pointer,1);
	$pointer+=1;
	$pkg_subtype = readBytes($pack,$pointer,1);
	$pointer+=1;
	$header=array(
				'length' => covert_byte_to_int($length),
				'session_key' => covert_byte_to_string($session_key),
				'uid' => covert_byte_to_int($uid),
				'type' => covert_byte_to_int($pkg_type),
				'subtype' => covert_byte_to_int($pkg_subtype),
	);
	return $header;
}
function process_friendsets($pack,&$pointer){
	$friends=array();
	$num_friends = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	for($i=0;i<$num_friends;$i++){
		$friends[]=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$pointer+=UID_LENGTH;
	}
	return $friends;
}
function process_eventsets($pack,&$pointer){
	$events=array();
	$num_events = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	for($i=0;i<$num_friends;$i++){
		$events[]=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$pointer+=EVENTID_LENGTH;
	}
	return $events;
}

function process_postsets($pack,&$pointer){
	$postings=array();
	$num_postings = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	for($i=0;i<$num_postings;$i++){
		$sets=array();
		$sets['uid']=covert_byte_to_int(readBytes($pack,$pointer,UID_LENGTH));
		$pointer+=UID_LENGTH;
		$sets['eid']=covert_byte_to_int(readBytes($pack,$pointer,EVENTID_LENGTH));
		$pointer+=EVENTID_LENGTH;
		$sets['pid']=covert_byte_to_int(readBytes($pack,$pointer,POSTID_LENGTH));
		$pointer+=POSTID_LENGTH;
		$postings[]=$sets;
	}
	return $postings;
}
function process_tags($pack,&$pointer){
	$num_tags = covert_byte_to_int(readBytes($pack,$pointer,4));
	$tags = array();
	$pointer+=4;
	for($i=0;$i<$num_tags;$i++){
		$tag_length = covert_byte_to_int(readBytes($pack,$pointer,1));
		$pointer++;
		$tags[]= covert_byte_to_string(readBytes($pack,$pointer,$tag_length));
		$pointer+=$tag_length;
	}
	return $tags;
}
function process_user_simple_other_pack($pack,&$pointer){
	$results=array();
	$results['uid'] = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	$nickname_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	$results['nickname'] = covert_byte_to_string(readBytes($pack,$pointer,$nickname_length));
	$pointer+=$nickname_length;
	$name_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	$results['name'] = covert_byte_to_string(readBytes($pack,$pointer,$name_length));
	$pointer+=$name_length;
	$birthday = covert_byte_to_int(readBytes($pack,$pointer,4));
	$results['birthday'] = convertBday($birthday);
	$pointer+=4;
	$results['gender'] = covert_byte_to_int(readBytes($pack,$pointer,1));
	$pointer+=1;
	$city_length = covert_byte_to_int(readBytes($pack,$pointer,4));
	$pointer+=4;
	$results['city'] = covert_byte_to_string(readBytes($pack,$pointer,$city_length));
	$pointer+=$city_length;

	$results['tags']=process_tags($pack,$pointer);
	
	$results['common_friends']=process_friendsets($pack,$pointer);
	
	//picture not done
	
	return $results;
}
function process_circatag_pack($pack,&$pointer){
	$pkg=array();
	
}
function unpack_view($pack,$subtype){
	$pointer = HEADER_LENGTH;
	$pkg = array();
	switch ($subtype){
		case 0://view user
			$viewee = covert_byte_to_int(readBytes($pack,$pointer,4));
			$pkg['viewee'] = $viewee; 
			$pointer+=4;
			$mode = covert_byte_to_int(readBytes($pack,$pointer,1));
			$pointer+=1;
			switch ($mode){
				case 0:
					$pkg["friends"]=process_friendsets($pack,$pointer);
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
		break;
		case 2:
		break;
	}
	return $pkg;
}
function unpack_search($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_create($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_update($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_reply($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_delete($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_validation($pack,$subtype){
	$pointer = HEADER_LENGTH;
	return $pkg;
}
function unpack_quit($pack,$subtype){
	$pointer = HEADER_LENGTH;
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
function readBytes($array, $pointer, $length){
	$results=array();
	for($i=$pointer;i<$pointer+$length;$i++){
		$results[]=$array[$i];
	}
	return $results;
}