<?PHP
require_once("serverUtil.php");
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
	1+ sizeof($tags) + $tag_array['total_length']+
	1+ sizeof($hiddenTags) + $hiddenTag_array['total_length'];
	
	//content array
	$pkg = array(
			array(
				'type' => TYPE_HEADER,	
				'content' => build_header_for_package($length, 2, 0)
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($email) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $email
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($pwd) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $pwd
			),
			//realname = null
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($realName) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $realName
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($nickName) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $nickName
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $birthday
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => $gender
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($city) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $city
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($state) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $state
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($country) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $country
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($tags)
			),
			array(
					'type' => TYPE_TAG,
					'content' => $tag_array['tag_array']
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($hiddenTags)
			),
			array(
					'type' => TYPE_TAG,
					'content' => $hiddenTag_array['tag_array']
			),
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
				1+ sizeof($tags) + $tag_array['total_length'];
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 2, 1,$session_key)
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($event_name) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $event_name
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $creator_id
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($discription) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $discription
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($city) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $city
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($tags)
			),
			array(
					'type' => TYPE_TAG,
					'content' => $tag_array['tag_array']
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
	1+ sizeof($tags) + $tag_array['total_length'];
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 2, 2,$session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $creator_id
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $event_id
			),
			array(
					'type' => TYPE_TWO_BYTE_INT,
					'content' => strlen($content) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $content
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => $visibility
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($tags)
			),
			array(
					'type' => TYPE_TAG,
					'content' => $tag_array['tag_array']
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $requester
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $type
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $target_user
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($content) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $content
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $requester
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $type
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $target_user
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($content) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $content
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 2, 3, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $requester
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $type
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $target_user
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $event_id
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($content) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $content
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
	4+ $uid_array['total_length'];
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 2, 17, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $creator
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $event_id
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $start_date
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $start_time
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $end_date
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $end_time
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($place) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $place
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($description) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $description
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($uids)
			),
			array(
					'type' => TYPE_UIDS,
					'content' => $uid_array['uid_array']
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
		  			'type' => TYPE_HEADER,
		  			'content' => build_header_for_package($length, 6, 0)
		  		),
				array(
						'type' => TYPE_ONE_BYTE_INT,
						'content' => $loginMode
				),
		  		array(
		  				'type' => TYPE_FOUR_BYTE_INT,
		  				'content' => $account
		  		),
		  		array(
		  				'type' => TYPE_ONE_BYTE_INT,
		  				'content' => strlen($pwd) * 2
		  		),
		  		array(
		  				'type' => TYPE_STRING,
		  				'content' => $pwd
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
			  			'type' => TYPE_HEADER,
			  			'content' => build_header_for_package($length, 6, 0)
			  		),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $loginMode
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($account) *2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $account
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($pwd) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $pwd
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 6, 16, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $uid
			),
	);
	return form_pack($pkg);
}
function view_user($viewer, $viewee, $mode, $session_key, $post_pid=NULL){
	$pkg = array();
	switch ($mode){
		case 0: case 1: case 4: case 18:
			$length = HEADER_LENGTH +
			4+
			4+
			1;
			$pkg = array(
					array(
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 0, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewee
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 0, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewee
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $post_pid
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 1, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $event_id
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 1, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $event_id
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $post_pid
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 0, 2, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $viewer
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $post_uid
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $post_eid
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $post_pid
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 10, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $type
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 10, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $viewer
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $type
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
						'type' => TYPE_HEADER,
						'content' => build_header_for_package($length, 0, 11, $session_key)
				),
				array(
						'type' => TYPE_FOUR_BYTE_INT,
						'content' => $currentUserId
				),
				array(
						'type' => TYPE_ONE_BYTE_INT,
						'content' => $mode
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 0, 11, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $currentUserId
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => 999999
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
		  				'type' => TYPE_HEADER,
		  				'content' => build_header_for_package($length, 0, 11, $session_key)
		  		),
		  		array(
		  				'type' => TYPE_FOUR_BYTE_INT,
		  				'content' => $currentUserId
		  		),
		  		array(
		  				'type' => TYPE_ONE_BYTE_INT,
		  				'content' => $mode
		  		),
		        array(
		    	    	'type' => TYPE_ONE_BYTE_INT,
		    	    	'content' => $option
		        )
		    );
		        break;
	}
	return form_pack($pkg);
}
function search($currentUserId, $search_type, $mode, $keys, 
				$session_key, $location=-1, $option = -1,  $age = -1, $gender=-1){
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
						1+//age
						1;//gender
					$pkg = array(
							array(
									'type' => TYPE_HEADER,
									'content' => build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $currentUserId
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $mode
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $option
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => strlen($keys) * 2
							),
							array(
									'type' => TYPE_STRING,
									'content' => $key
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $location
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $age
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $gender
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
									'type' => TYPE_HEADER,
									'content' => build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $currentUserId
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $mode
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $key
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
									'type' => TYPE_HEADER,
									'content' => build_header_for_package($length, 1, 0, $session_key)
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $currentUserId
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $mode
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => strlen($keys) * 2
							),
							array(
									'type' => TYPE_STRING,
									'content' => $key
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
									'type' => TYPE_HEADER,
									'content' => build_header_for_package($length, 1, 1, $session_key)
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $currentUserId
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $mode
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $option
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => strlen($keys) * 2
							),
							array(
									'type' => TYPE_STRING,
									'content' => $key
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $location
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
									'type' => TYPE_HEADER,
									'content' => build_header_for_package($length, 1, 1, $session_key)
							),
							array(
									'type' => TYPE_FOUR_BYTE_INT,
									'content' => $currentUserId
							),
							array(
									'type' => TYPE_ONE_BYTE_INT,
									'content' => $mode
							),
							array(
									'type' => TYPE_EIGHT_BYTE_INT,
									'content' => $key
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
			1;
			$pkg = array(
					array(
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 1, 1, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $currentUserId
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $mode
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => strlen($keys) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $key
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $location
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
	1+ $update_array['total_length'];
	//content array
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $user
			),
			array(
			'type' => TYPE_ONE_BYTE_INT,
			'content' => sizeof($updates)
			),
			array(
			'type' => TYPE_UPDATE,
			'content' => $update_array['update_array']
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
	1+ $update_array['total_length'];
	//content array
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $user
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $event_id
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($updates)
			),
			array(
					'type' => TYPE_UPDATE,
					'content' => $update_array['update_array']
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
	1+ $update_array['total_length'];
	//content array
	$pkg = array(
			array(
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 3, 0, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $user
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $post_id
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => sizeof($updates)
			),
			array(
					'type' => TYPE_UPDATE,
					'content' => $update_array['update_array']
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 3, 13, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $uid
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $friend_id
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($comment) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $comment
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 3, 14, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $uid
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => $status
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 4, 2, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $uid
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $post_id
			),
			array(
					'type' => TYPE_ONE_BYTE_INT,
					'content' => strlen($content) * 2
			),
			array(
					'type' => TYPE_STRING,
					'content' => $content
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 5, $mode, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $uid
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $target_id
					),
			);
		break;
		case 2: case 3:
			$length = HEADER_LENGTH +
			4+
			8;
			$pkg = array(
					array(
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 5, $mode, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $user
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $target_id
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
					'type' => TYPE_HEADER,
					'content' => build_header_for_package($length, 7, 1, $session_key)
			),
			array(
					'type' => TYPE_FOUR_BYTE_INT,
					'content' => $uid
			),
			array(
					'type' => TYPE_EIGHT_BYTE_INT,
					'content' => $event_id
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 15, 15, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $uid
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $status
					),
			);
		break;
		case 1:
			$length = HEADER_LENGTH +
			4+
			1;
			$pkg = array(
					array(
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 15, 15, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $uid
					),
					array(
							'type' => TYPE_ONE_BYTE_INT,
							'content' => $status
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 12, $mode, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $uid
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $seq_no
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $target_id
					),
					array(
							'type' => TYPE_TWO_BYTE_INT,
							'content' => strlen($content) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $content
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
							'type' => TYPE_HEADER,
							'content' => build_header_for_package($length, 12, $mode, $session_key)
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $uid
					),
					array(
							'type' => TYPE_FOUR_BYTE_INT,
							'content' => $seq_no
					),
					array(
							'type' => TYPE_EIGHT_BYTE_INT,
							'content' => $target_id
					),
					array(
							'type' => TYPE_TWO_BYTE_INT,
							'content' => strlen($content) * 2
					),
					array(
							'type' => TYPE_STRING,
							'content' => $content
					),
			);
			break;
	}
	return form_pack($pkg);
}