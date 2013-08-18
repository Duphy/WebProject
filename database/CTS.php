<?PHP
require_once("service.php");
require_once("common_functions.php");

function create_new_user($email, $pwd, $nickName, $birthday, $gender, $city,
		$realName = NULL, $state = NULL, $country = NULL,
		$tags = NULL, $hiddenTags = NULL){
	//processing the tags and hiddentags
	$tag_array = build_tagArray($tags);
	$hiddenTag_array = build_tagArray($hiddenTags);
	//count the content size
	$length = HEADER_LENGTH +
	1+strlen($email) * 2+
	1+strlen($pwd) * 2+
	1+strlen($realName) * 2+
	1+strlen($nickName) * 2+
	4+1+
	1+strlen($city) * 2+
	1+strlen($state) * 2+
	1+strlen($country) * 2+
	1+ sizeof($tags) + $tag_array[0]+
	1+ sizeof($hiddenTags) + $hiddenTag_array[0];

	//content array
	$pkg = array(
			array(
				 TYPE_HEADER,
				 build_header_for_package($length, 2, 0)
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($email) * 2
			),
			array(
					TYPE_STRING,
					$email
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($pwd) * 2
			),
			array(
					TYPE_STRING,
					$pwd
			),
			//realname = null
			array(
					TYPE_ONE_BYTE_INT,
					strlen($realName) * 2
			),
			array(
					TYPE_STRING,
					$realName
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($nickName) * 2
			),
			array(
					TYPE_STRING,
					$nickName
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$birthday
			),
			array(
					TYPE_ONE_BYTE_INT,
					$gender
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($city) * 2
			),
			array(
					TYPE_STRING,
					$city
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($state) * 2
			),
			array(
					TYPE_STRING,
					$state
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($country) * 2
			),
			array(
					TYPE_STRING,
					$country
			),
			array(
			TYPE_ONE_BYTE_INT,
			sizeof($tags)
			),
			array(
			TYPE_TAG,
			$tag_array[1]
			),
			array(
			TYPE_ONE_BYTE_INT,
			sizeof($hiddenTags)
			),
			array(
			TYPE_TAG,
			$hiddenTag_array[1]
			)
	);

	return form_pack($pkg);
}
function create_event($event_name, $creator_id, $description, $city, $tags, $session_key){
	$tag_array = build_tagArray($tags);
	$length = HEADER_LENGTH +
	1+strlen($event_name) * 2+
	4+
	1+strlen($descripton) * 2+
	1+strlen($city) * 2+
	1+ sizeof($tags) + $tag_array[[0]];
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 2, 1,$session_key)
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($event_name) * 2
			),
			array(
					TYPE_STRING,
					$event_name
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$creator_id
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($discription) * 2
			),
			array(
					TYPE_STRING,
					$discription
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($city) * 2
			),
			array(
					TYPE_STRING,
					$city
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($tags)
			),
			array(
					TYPE_TAG,
					$tag_array[[1]]
			),
	);

	return form_pack($pkg);

}
function create_posting($creator_id, $event_id, $content, $visibility, $tags, $session_key){
	$tag_array = build_tagArray($tags);
	$length = HEADER_LENGTH +
	4+//creator id
	8+//event id
	2+strlen($content) * 2+
	1+//visibility
	1+ sizeof($tags) + $tag_array[[0]];
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 2, 2,$session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$creator_id
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$event_id
			),
			array(
					TYPE_TWO_BYTE_INT,
					strlen($content) * 2
			),
			array(
					TYPE_STRING,
					$content
			),
			array(
					TYPE_ONE_BYTE_INT,
					$visibility
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($tags)
			),
			array(
					TYPE_TAG,
					$tag_array[[1]]
			),
	);

	return form_pack($pkg);
}
function create_request($requester, $type, $target_user, $content, $session_key, $event_id=NULL){
	$pkg = array();
	switch ($type){
		case 0:
			$length = HEADER_LENGTH +
			4+1+
			4+
			1+strlen($content) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$requester
					),
					array(
							TYPE_ONE_BYTE_INT,
							$type
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$target_user
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($content) * 2
					),
					array(
							TYPE_STRING,
							$content
					),
			);
			break;
		case 1:
			$length = HEADER_LENGTH +
			4+1+
			8+
			1+strlen($content) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$requester
					),
					array(
							TYPE_ONE_BYTE_INT,
							$type
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$target_user
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($content) * 2
					),
					array(
							TYPE_STRING,
							$content
					),
			);
			break;
		case 2:
			$length = HEADER_LENGTH +
			4+1+
			4+
			8+
			1+strlen($content) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$requester
					),
					array(
							TYPE_ONE_BYTE_INT,
							$type
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$target_user
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$event_id
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($content) * 2
					),
					array(
							TYPE_STRING,
							$content
					),
			);
			break;
	}
	return form_pack($pkg);
}
function create_schedule($creator, $event_id, $start_date, $start_time, $end_date, $end_time,
		$place, $description, $uids, $session_key){
	$pkg = array();
	$uid_array = build_uidArray($uids);
	$length = HEADER_LENGTH +
	4+
	8+
	4+4+
	4+4+
	1+strlen($place) * 2;
	1+strlen($description) * 2+
	4+ $uid_array[[0]];
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 2, 17, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$creator
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$event_id
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$start_date
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$start_time
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$end_date
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$end_time
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($place) * 2
			),
			array(
					TYPE_STRING,
					$place
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($description) * 2
			),
			array(
					TYPE_STRING,
					$description
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($uids)
			),
			array(
					TYPE_UIDS,
					$uid_array[[1]]
			),
	);
	return form_pack($pkg);
}
function login($loginMode, $account, $pwd){
	$pkg = array();
	switch ($loginMode){
		case 0:
			$length = HEADER_LENGTH +
			1+4+
			1+strlen($pwd) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 6, 0)
					),
					array(
						 TYPE_ONE_BYTE_INT,
						 $loginMode
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$account
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($pwd) * 2
					),
					array(
							TYPE_STRING,
							$pwd
					),
			);
			break;
		case 1:
			$length = HEADER_LENGTH +
			1+
			1+strlen($account) * 2+
			1+strlen($pwd) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 6, 0)
					),
					array(
							TYPE_ONE_BYTE_INT,
							$loginMode
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($account) *2
					),
					array(
							TYPE_STRING,
							$account
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($pwd) * 2
					),
					array(
							TYPE_STRING,
							$pwd
					),
			);
			break;
	}
	return form_pack($pkg);
}
function logout($uid, $session_key){
	$length = HEADER_LENGTH +
	4;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 6, 16, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$uid
			),
	);
	return form_pack($pkg);
}
function view_user($viewer, $viewee, $mode, $session_key, $pid_localdate=NULL, $localtime =NULL){
	$pkg = array();
	switch ($mode){
		case 0: case 1: case 4: case 18:
			$length = HEADER_LENGTH +
			4+
			4+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 0, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewee
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					)
			);
			break;
		case 2:
			$length = HEADER_LENGTH +
			4+
			4+
			1+
			8;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 0, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewee
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$pid_localdate
					)
			);
			break;
			case 23: case 24:
				$length = HEADER_LENGTH +
				4+
				4+
				1+
				8;
				$pkg = array(
						array(
								TYPE_HEADER,
								build_header_for_package($length, 0, 0, $session_key)
						),
						array(
								TYPE_FOUR_BYTE_INT,
								$viewer
						),
						array(
								TYPE_FOUR_BYTE_INT,
								$viewee
						),
						array(
								TYPE_ONE_BYTE_INT,
								$mode
						),
						array(
								TYPE_FOUR_BYTE_INT,
								$pid_localdate
						),
						array(
								TYPE_FOUR_BYTE_INT,
								$localtime
						)
				);
				break;
	}
	return form_pack($pkg);
}
function view_event($viewer, $event_id, $mode, $session_key, $post_pid=NULL){
	$pkg = array();
	switch ($mode){
		case 0: case 4: case 5: case 17: case 18:
			$length = HEADER_LENGTH +
			4+
			8+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 1, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$event_id
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					)
			);
			break;
		case 2:
			$length = HEADER_LENGTH +
			4+
			8+
			1+
			8;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 1, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$event_id
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$post_pid
					)
			);
			break;
	}
	return form_pack($pkg);
}
function view_posting($viewer, $post_uid, $post_eid, $post_pid, $session_key){
	$pkg = array();
	$length = HEADER_LENGTH +
	4+
	4+
	8+
	8;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 0, 2, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$viewer
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$post_uid
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$post_eid
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$post_pid
			),
	);
	return form_pack($pkg);
}
function mass_view_posting($viewer, $mode, $type, $session_key, $post_id=NULL){
	$pkg = array();
	switch ($mode){
		case 0:
			$length = HEADER_LENGTH +
			4+
			1+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 10, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_ONE_BYTE_INT,
							$type
					)
			);
			break;
		case 2:
			$length = HEADER_LENGTH +
			4+
			8+
			1+
			8;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 10, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$viewer
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_ONE_BYTE_INT,
							$type
					),

			);
			break;
	}
	return form_pack($pkg);
}
function retrieve_current_user_info($currentUserId, $mode, $session_key, $option = -1){
	$pkg = array();
	switch ($mode){
		case 0: case 1: case 4: case 6:
			$length = HEADER_LENGTH +
			4+
			1;
			$pkg = array(
					array(
						 TYPE_HEADER,
						 build_header_for_package($length, 0, 11, $session_key)
					),
					array(
						 TYPE_FOUR_BYTE_INT,
						 $currentUserId
					),
					array(
						 TYPE_ONE_BYTE_INT,
						 $mode
					)
			);
			break;
		case 2:
			$length = HEADER_LENGTH +
			4+
			1+
			8;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 11, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$currentUserId
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							999999
					)
			);
			break;
		case 17: case 18:
			$length = HEADER_LENGTH +
			4+
			1+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 0, 11, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$currentUserId
					),
					array(
							TYPE_ONE_BYTE_INT,
							$mode
					),
					array(
							TYPE_ONE_BYTE_INT,
							$option
					)
			);
			break;
	}
	return form_pack($pkg);
}
function search($currentUserId, $search_type, $mode, $keys,
		$session_key, $location=-1, $option = -1,  $age_lower_bound = -1, $age_upper_bound=-1,$gender=-1){
	$pkg = array();
	switch ($search_type){
		case 0://search user
			switch ($mode){
				case 0://by filter
					$length = HEADER_LENGTH +
					4+
					1+//mode
					1+//option
					1+strlen($keys) * 2+//filter length
					1+//location
					2+//age
					1;//gender
					$pkg = array(
							array(
									TYPE_HEADER,
									build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$currentUserId
							),
							array(
									TYPE_ONE_BYTE_INT,
									$mode
							),
							array(
									TYPE_ONE_BYTE_INT,
									$option
							),
							array(
									TYPE_ONE_BYTE_INT,
									strlen($keys) * 2
							),
							array(
									TYPE_STRING,
									$keys
							),
							array(
									TYPE_ONE_BYTE_INT,
									$location
							),
							array(
									TYPE_ONE_BYTE_INT,
									$age_lower_bound
							),
							array(
									TYPE_ONE_BYTE_INT,
									$age_upper_bound
							),
							array(
									TYPE_ONE_BYTE_INT,
									$gender
							),
					);
					break;
				case 1://by id
					$length = HEADER_LENGTH +
					4+
					1+
					4;
					$pkg = array(
							array(
									TYPE_HEADER,
									build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$currentUserId
							),
							array(
									TYPE_ONE_BYTE_INT,
									$mode
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$keys
							),
					);
					break;
				case 2://by email
					$length = HEADER_LENGTH +
					4+
					1+//mode
					1+strlen($keys) * 2;//email
					$pkg = array(
							array(
									TYPE_HEADER,
									build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$currentUserId
							),
							array(
									TYPE_ONE_BYTE_INT,
									$mode
							),
							array(
									TYPE_ONE_BYTE_INT,
									strlen($keys) * 2
							),
							array(
									TYPE_STRING,
									$keys
							),
					);
					break;
			}
			break;
		case 1://search event
			switch ($mode){
				case 0://by filter
					$length = HEADER_LENGTH +
					4+
					1+//mode
					1+//option
					1+strlen($keys) * 2+//filter length
					1;//location
					$pkg = array(
							array(
									TYPE_HEADER,
									build_header_for_package($length, 1, 1, $session_key)
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$currentUserId
							),
							array(
									TYPE_ONE_BYTE_INT,
									$mode
							),
							array(
									TYPE_ONE_BYTE_INT,
									$option
							),
							array(
									TYPE_ONE_BYTE_INT,
									strlen($keys) * 2
							),
							array(
									TYPE_STRING,
									$keys
							),
							array(
									TYPE_ONE_BYTE_INT,
									$location
							),
					);
					break;
				case 1://by id
					$length = HEADER_LENGTH +
					4+
					1+
					8;
					$pkg = array(
							array(
									TYPE_HEADER,
									build_header_for_package($length, 1, 1, $session_key)
							),
							array(
									TYPE_FOUR_BYTE_INT,
									$currentUserId
							),
							array(
									TYPE_ONE_BYTE_INT,
									$mode
							),
							array(
									TYPE_EIGHT_BYTE_INT,
									$keys
							),
					);
					break;
			}
			break;
		case 2://search posting
			$length = HEADER_LENGTH +
			4+
			1+
			1+strlen($keys) * 2+//filter
			1+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 1, 2, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$currentUserId
					),
					array(
							TYPE_ONE_BYTE_INT,
							0
					),
					array(
							TYPE_ONE_BYTE_INT,
							strlen($keys) * 2
					),
					array(
							TYPE_STRING,
							$keys
					),
					array(
							TYPE_ONE_BYTE_INT,
							$location
					),
					array(
							TYPE_ONE_BYTE_INT,
							$option
					),
			);
			break;
	}
	return form_pack($pkg);
}
function update_user($user, $updates, $session_key){
	$update_array = build_updateArray($updates);
	//count the content size
	$length = HEADER_LENGTH +
	4+
	1+ $update_array[0];
	//content array
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$user
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($updates)
			),
			array(
					TYPE_UPDATE,
					$update_array[1]
			),
	);
	return form_pack($pkg);
}
function update_event($user, $event_id, $updates, $session_key){
	$update_array = build_updateArray($updates);
	//count the content size
	$length = HEADER_LENGTH +
	4+
	8+
	1+ $update_array[[0]];
	//content array
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$user
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$event_id
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($updates)
			),
			array(
					TYPE_UPDATE,
					$update_array[[1]]
			),
	);
	return form_pack($pkg);
}
function update_posting($user, $post_id, $updates, $session_key){
	$update_array = build_updateArray($updates);
	//count the content size
	$length = HEADER_LENGTH +
	4+
	8+
	1+ $update_array[[0]];
	//content array
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$user
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$post_id
			),
			array(
					TYPE_ONE_BYTE_INT,
					sizeof($updates)
			),
			array(
					TYPE_UPDATE,
					$update_array[[1]]
			),
	);
	return form_pack($pkg);
}
function update_friend_commnet($uid, $friend_id, $comment, $session_key) {
	$length = HEADER_LENGTH +
	4+
	4+
	1+strlen($comment) * 2;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 3, 13, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$uid
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$friend_id
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($comment) * 2
			),
			array(
					TYPE_STRING,
					$comment
			),
	);
	return form_pack($pkg);
}
function update_status($uid, $status, $session_key) {
	$length = HEADER_LENGTH +
	4+
	1;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 3, 14, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$uid
			),
			array(
					TYPE_ONE_BYTE_INT,
					$status
			),
	);
	return form_pack($pkg);
}
function reply_posting($uid, $post_id, $content, $session_key) {
	$length = HEADER_LENGTH +
	4+
	8+
	1+strlen($content) * 2;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 4, 2, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$uid
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$post_id
			),
			array(
					TYPE_ONE_BYTE_INT,
					strlen($content) * 2
			),
			array(
					TYPE_STRING,
					$content
			),
	);
	return form_pack($pkg);
}
function delete($mode, $uid, $target_id, $session_key){
	switch ($mode){
		case 0:
			$length = HEADER_LENGTH +
			4+
			4;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 5, $mode, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$uid
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$target_id
					),
			);
			break;
		case 2: case 3:
			$length = HEADER_LENGTH +
			4+
			8;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 5, $mode, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$user
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$target_id
					),
			);
			break;
	}
	return form_pack($pkg);
}
function quit($uid, $event_id, $session_key){
	$length = HEADER_LENGTH +
	4+
	8;
	$pkg = array(
			array(
					TYPE_HEADER,
					build_header_for_package($length, 7, 1, $session_key)
			),
			array(
					TYPE_FOUR_BYTE_INT,
					$uid
			),
			array(
					TYPE_EIGHT_BYTE_INT,
					$event_id
			),
	);
	return form_pack($pkg);
}
function reply($mode, $uid, $status, $session_key,$seq_no=NULL){
	//not done for 10 0...14

	switch ($mode){
		case 0: case 2:
			$length = HEADER_LENGTH +
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 15, 15, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$uid
					),
					array(
							TYPE_ONE_BYTE_INT,
							$status
					),
			);
			break;
		case 1:
			$length = HEADER_LENGTH +
			4+
			1;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 15, 15, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$uid
					),
					array(
							TYPE_ONE_BYTE_INT,
							$status
					),
			);
			break;
	}
	return form_pack($pkg);
}
function system_message($mode, $uid, $seq_no, $target_id, $content, $session_key){
	switch ($mode){
		case 0:
			$length = HEADER_LENGTH +
			4+
			4+
			4+
			2+strlen($content) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 12, $mode, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$uid
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$seq_no
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$target_id
					),
					array(
							TYPE_TWO_BYTE_INT,
							strlen($content) * 2
					),
					array(
							TYPE_STRING,
							$content
					),
			);
			break;
		case 1:
			$length = HEADER_LENGTH +
			4+
			4+
			8+
			2+strlen($content) * 2;
			$pkg = array(
					array(
							TYPE_HEADER,
							build_header_for_package($length, 12, $mode, $session_key)
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$uid
					),
					array(
							TYPE_FOUR_BYTE_INT,
							$seq_no
					),
					array(
							TYPE_EIGHT_BYTE_INT,
							$target_id
					),
					array(
							TYPE_TWO_BYTE_INT,
							strlen($content) * 2
					),
					array(
							TYPE_STRING,
							$content
					),
			);
			break;
	}
	return form_pack($pkg);
}