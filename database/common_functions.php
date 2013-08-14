<?PHP

/*
*	This file contains all utility functions such as conversion, building headers, etc
*/


function convert_and_append_int_to_byte_array($source_int, &$target_array, $start_index){

    $result = 0;

    for ($i = 3; $i >= 0; $i--)
    {
        $result = (int)($source_int % 256);
        $source_int = (int)($source_int / 256);
        $target_array[$start_index + $i] = pack_to_unsigned_byte($result);
    }
}

function convert_and_append_value_to_byte_array($source_string, $num_of_byte, &$container_array, $start_position){

    if (strlen($source_string) == 0){    
        return;
    }

    $currentChar = '';
    $low = '';
    $high = '';

    $source_array = str_split($source_string);

    for ($i = 0; $i < $num_of_byte / 2; $i++){
        $current_char = _uniord($source_array[$i]);

        $low = pack_to_unsigned_byte((int)$current_char % 256);
        $high = pack_to_unsigned_byte((int)$current_char / 256);

        $container_array[$start_position + 2 * $i] = $high;
        $container_array[$start_position + 2 * $i + 1] = $low;

    }
}

// Used in unpack function
// Convert an byte string of any length to its char string representation
function convert_byte_string_to_string($byte_string){

    $byte_array = convert_byte_string_to_int_array($byte_string);

    $result_string = '';

    for ($i = 0; $i < sizeof($byte_array); $i++){
        $result_string .= chr($byte_array[$i]);
    }

    return $result_string;
}
function convert_byte_to_string($byte_string){
	$byte_array = convert_byte_array_to_int_array($byte_string);
	$result_string = '';

	for ($i = 0; $i < sizeof($byte_array); $i++){
		$result_string .= chr($byte_array[$i]);
	}

	return $result_string;
}
// Used in unpack funciton
// Convert an byte array of length 4 to an integer
function convert_byte_string_to_int($byte_string){

    $byte_array = convert_byte_string_to_int_array($byte_string);

    $result_int = 0;
    for ($i = 0; $i < sizeof($byte_array); $i++){
        $result_int += $byte_array[$i] * pow(256, sizeof($byte_array) - $i - 1); 
    }

    return $result_int;
}
function convert_byte_to_int($byte_string){
	$byte_array = convert_byte_array_to_int_array($byte_string);
	$result_int = 0;

	for ($i = 0; $i < sizeof($byte_array); $i++){
		//$result_int += $byte_array[$i] * pow(256, sizeof($byte_array) - $i - 1);
		$result_int = $result_int*256+$byte_array[$i];
	}
	return $result_int;
}
// Helper function of the above two
function convert_byte_array_to_int_array($byte_string){
	$size = sizeof($byte_string);
	if ($size == 0){
		return array();
	}

	$byte_array = array();

	for($i=0;$i<$size;$i++){
		// ord: Return ASCII value of character
		$byte_array[] = ord($byte_string[$i]);
	}

	return $byte_array;
}
function convert_byte_string_to_int_array($byte_string){

    if (strlen($byte_string) == 0){
        return array();
    }

    $byte_array = array_fill(0, strlen($byte_string), pack_to_unsigned_byte(0));

    for ($i = 0; $i < strlen($byte_string); $i++){
        // ord: Return ASCII value of character
        $byte_array[$i] = ord(substr($byte_string, $i, 1));
    }

    return $byte_array;
}

function pack_to_unsigned_byte($char){
    return pack("C", $char);
}

// Character to unicode:
function _uniord($c) {
    if (ord($c{0}) >=0 && ord($c{0}) <= 127)
        return ord($c{0});
    if (ord($c{0}) >= 192 && ord($c{0}) <= 223)
        return (ord($c{0})-192)*64 + (ord($c{1})-128);
    if (ord($c{0}) >= 224 && ord($c{0}) <= 239)
        return (ord($c{0})-224)*4096 + (ord($c{1})-128)*64 + (ord($c{2})-128);
    if (ord($c{0}) >= 240 && ord($c{0}) <= 247)
        return (ord($c{0})-240)*262144 + (ord($c{1})-128)*4096 + (ord($c{2})-128)*64 + (ord($c{3})-128);
    if (ord($c{0}) >= 248 && ord($c{0}) <= 251)
        return (ord($c{0})-248)*16777216 + (ord($c{1})-128)*262144 + (ord($c{2})-128)*4096 + (ord($c{3})-128)*64 + (ord($c{4})-128);
    if (ord($c{0}) >= 252 && ord($c{0}) <= 253)
        return (ord($c{0})-252)*1073741824 + (ord($c{1})-128)*16777216 + (ord($c{2})-128)*262144 + (ord($c{3})-128)*4096 + (ord($c{4})-128)*64 + (ord($c{5})-128);
    if (ord($c{0}) >= 254 && ord($c{0}) <= 255)    //  error
        return FALSE;
    return 0;
}

// Unicode to character:
function _unichr($o) {
    if (function_exists('mb_convert_encoding')) {
        return mb_convert_encoding('&#'.intval($o).';', 'UTF-8', 'HTML-ENTITIES');
    } else {
        return chr(intval($o));
    }
}

/*
*	Used for construction of headers
*	If $session_key is null (when sign up and log in), then make it a string of eight 0.
*/
function build_header_for_package($length, $type, $stype, $session_key = DUMB_SESSION_KEY)
{	
	
	$pkg = array_fill(0, HEADER_LENGTH, pack_to_unsigned_byte(0));
	
    $counter = 0;
    convert_and_append_int_to_byte_array($length, $pkg, $counter);
    $counter += 4;
    
    // 12 bytes for reserved header
    
    // In the header, 8 bytes are for session key:
    $sKey = str_split($session_key);
  
    for ($i = 0; $i < 8; $i++)
    {	
        $pkg[$counter + $i] = $sKey[$i];
    }
    
   // convert_and_append_int_to_byte_array($session_key, $pkg, $counter);
  /* $k = $session_key;
   if($session_key == DUMB_SESSION_KEY){
   		$k = convert_int_to_byte_array(0,8);
   }
    for($i=0;$i<8;$i++){
    	$pkg[]=$k[$i];
    }
    */
    $counter += 8;

    // In the header, 
    // For web side client, the header[11] should be 1
    // the 8-th byte used for client identification.
    $pkg[$counter] = pack_to_unsigned_byte(1);
    $counter++;

    for ($i = 0; $i < 3; $i++)
    {   
        $pkg[$counter + $i] = pack_to_unsigned_byte(0);
    }

    $counter += 3;

    $pkg[$counter] = pack_to_unsigned_byte($type);
    $counter++;
    $pkg[$counter] = pack_to_unsigned_byte($stype);
    $counter++;
	
    return $pkg;
}

function form_pack($param){
	$result = array();
	foreach ($param as $new){
		//echo '<br></br>New content: ' . print_r($new[1], true) . ' and current result length is: ' . sizeof($result);
		switch($new[0]){
			case TYPE_HEADER:{
				$result = merge_array((array)$result, (array)$new[1]);
				//echo '<br></br>After merge: <pre>' . print_r($result, true) . '</per>';
				break;
			}
			case TYPE_STRING:{
				if ($new[1] != NULL){
					//echo '<br></br>TYPE_STRING, the size is: ' . sizeof(convert_string_to_byte_array($new[1]));
					$result = merge_array($result, convert_string_to_byte_array($new[1]));
				}
				break;
			}
			case TYPE_ONE_BYTE_INT:{
				$result[] = pack_to_unsigned_byte($new[1]);
				break;
			}
			case TYPE_TWO_BYTE_INT:{
				$result = merge_array($result, convert_int_to_byte_array($new[1],2));
				break;
			}
			case TYPE_FOUR_BYTE_INT:{
				$result = merge_array($result, convert_int_to_byte_array($new[1],4));
				break;
			}
			case TYPE_EIGHT_BYTE_INT:{
				$result = merge_array($result, convert_int_to_byte_array($new[1],8));
				break;
			}
			case TYPE_TAG:{
				if($new[1]!= NULL){
				$result = merge_array($result, $new[1]);
				}
				break;
			}
			case TYPE_UIDS:{
				if($new[1]!= NULL){
					$result = merge_array($result, $new[1]);
				}
				break;
			}
			case TYPE_UPDATE:{
				if($new[1]!= NULL){
					$result = merge_array($result, $new[1]);
				}
				break;
			}
			default:{
				echo 'Wrong type in param: ' . $new[0];
			}
		}
	}
	return convert_byte_array_to_string($result);
	//return $result;
}
function convert_int_to_byte_array($source_int,$num_bytes){
	$temp = 0;
	$output_array = array();
	for ($i = $num_bytes-1; $i >= 0; $i--){
		$temp = (int)($source_int % 256);
		$source_int = (int)($source_int / 256);
		$output_array[$i] = pack_to_unsigned_byte($temp);
	}
	return $output_array;
}
function merge_array($result,$array){
	//for($i=sizeof($array)-1;$i>=0;$i--){
	for($i=0;$i<=sizeof($array)-1;$i++){
	$result[] = $array[$i];
	}
	return $result;
}
function convert_string_to_byte_array($content){
	$num_of_bytes = strlen($content) * 2;
	if ($num_of_bytes == 0){
		return;
	}
	$currentChar = '';
	$low = '';
	$high = '';
	
	$output_array = array_fill(0, $num_of_bytes, 0);
	$source_array = str_split($content);
	
	for ($i = 0; $i < $num_of_bytes / 2; $i++){
		$current_char = _uniord($source_array[$i]);
	
		$low = pack_to_unsigned_byte((int)$current_char % 256);
		$high = pack_to_unsigned_byte((int)$current_char / 256);
	
		$output_array[2 * $i] = $high;
		$output_array[2 * $i + 1] = $low;
	
	}
	return $output_array;
}
function convert_byte_array_to_string($pkg){
	$pkg_string = '';
	foreach ($pkg as $c){
		$pkg_string .= $c;
	}
	return $pkg_string;
}

function build_tagArray($tags){
	$results=array();
	$length=0;
	if(sizeof($tags)>0){
		foreach ($tags as $element){
			$tag_length = strlen($element) *2;
			$length += $tag_length;
			$results = merge_array($results,pack_to_unsigned_byte($tag_length));
			$results = merge_array($results,convert_string_to_byte_array($element));
		}
	}
	$output = array(
			$length,
			$results
	);
	return $output;
}
function build_uidArray($uids){
	$results=array();
	$length=0;
	if(sizeof($uids)>0){
		foreach ($uids as $element){
			$uid_length = 4;
			$length += $uid_length;
			$results = merge_array($results,convert_int_to_byte_array($element, 4));
		}
	}
	$output = array(
			$length,
			$results
	);
	return $output;
}
//$updates = array(
//				array(
//				'type'
//				'content'
//           )
//			)
function build_updateArray($updates){
	$results=array();
	$length=0;
	$skip=0;
	if(sizeof($updates)>0){
		foreach ($updates as $element){
			switch ($element[0]){
				case 0: case 1: case 2: case 5: case 6: case 7: case 8: case 9:
					$content_length = 1+strlen($element[1]) * 2;
					$length += $content_length+1;
					$results = merge_array($results, pack_to_unsigned_byte($content_length));
					$results = merge_array($results, convert_string_to_byte_array($element[1]));
					break;
				case 3:
					$length += 4;
					$results = merge_array($results,convert_int_to_byte_array($element[1],4));
					break;
				case 4:
					$length += 1;
					$results = merge_array($results,pack_to_unsigned_byte($element[1]));
					break;
				case 10:
					$length += 2;
					$results = merge_array($results,convert_int_to_byte_array($element[1],2));
					break;
				case 11: case 12:
					$length += 4;
					$results = merge_array($results,convert_int_to_byte_array($element[1],4));
					break;
			}
		}
	}
	$output = array(
			$length,
			$results
	);
	return $output;
}
function print_byte_array($input,$length){
	echo"<br></br>";
	for ($i = 0; $i < $length; $i++){
		echo " " . ord($input[$i]);
	}
}