<?PHP

/*
*   This file contains the $socket connection, send packages, and unpack the result packages
*
*/

require_once("constants.php");
require_once("CTS.php");
require_once("common_functions.php");

function connect_to_server_and_send_message( $msg ){

    /* Turn on implicit output flushing so we see what we're getting
    * as it comes in. 
    */
    ob_implicit_flush(TRUE);

    // set some variables 
    $host = "25.42.79.116";
    $port = 1992;

    // If this is a server, it's also a good idea to use the set_time_limit() function
    // to ensure that PHP doesn't time out and die() while waiting for incoming client connections.
    set_time_limit(100); 

    // create socket 
    $socket = socket_create(AF_INET, SOCK_STREAM, 0) or die("Could not create socket\n"); 

    // bind socket to the specified address and port 
    // Only useful if this is the server
    // $result = socket_bind($socket, $host, $port) or die("Could not bind to socket\n"); 

    // Only need to connect:
    socket_connect($socket, $host, $port) or die("Could not connect to the socket");

    // Write to socket:
    echo '<br></br>';
    echo 'Server Util is sending this package of length ' . strlen($msg) . ': ';

    $msg_array = str_split($msg);
    foreach ($msg_array as $c)
    {
        echo ' ' . ord($c);
    }

    $result = socket_write($socket, $msg, strlen($msg)) or die("Could not write socket\n"); 

    // start listening for connections 
    // specify the number of queued connections to allow as a second parameter (3, in this example)
    // $result = socket_listen($socket, 3) or die("Could not set up socket listener\n"); 

    // accept incoming connections
    // establish incoming connections
    // spawn another socket to handle communication
    // $spawn = socket_accept($socket) or die("Could not accept incoming connection\n"); 

    // With a connection established, the server now waits for the client to send it some input
    // Reads 1 bytes at a time (or until a \r, \n or \0 is received – depending on the value of the optional third parameter

    // The third type parameter to socket_read() can either be 
    // PHP_BINARY_READ, which uses the system read() and is safe for reading binary data (default type as of PHP >= 4.1.0) or
    // PHP_NORMAL_READ in which reading stops at \n or \r (default in PHP <= 4.0.6)ext line of the PHP script.

    $length_string = socket_read($socket, NUM_OF_BYTES_IN_LENGTH) or die("Could not read length value in input\n");

    $length = convert_byte_string_to_int($length_string);

    echo "<br></br>";
    echo "Received length: " . $length;

    // read
    $input = socket_read($socket, $length - NUM_OF_BYTES_IN_LENGTH) or die("Could not read content in input\n");

    echo "<br></br>";
    echo "Received content: ";

    // Print out the content:
    for ($i = 0; $i < $length - NUM_OF_BYTES_IN_LENGTH; $i++){
        echo " " . ord(substr($input, $i, 1));
    }

    socket_close($socket);


    return $input;
}

/*
*   parse the content of the package
*   $package_content: the package without the 4-byte length
*   
*/

function unpack_package($package_content){
    
    $position_pointer = 0;
    
    //byte 0 - 11 are reserved headers
    $position_pointer += 12;

    //byte 12 - 15 is user
    $UID = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;

    // if (!isset($currentUserId) && $UID != $currentUserId)
    // {
    //     echo "Received a package not belong to me!";
    //     return;
    // }

    //byte 16 is the type of the pkg
    // 0 for view results, 1 for search results, 2 for create, 3 for update, 4 for reply, 5 for delete, 6 for validation,
    // 7 for quit, 10 system messages, 12 instant message
    $pkg_type = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;

    //byte 17 is the subtype of the pkg
    // 0 for user, 1 for event, 2 for posting, 3 for request, 4 tags, 5 notification, 6 new features,
    // 10 for posting mass view, 11 for self, 13 user comments, 14 status, 
    // 15 polling, 16 logout, 17 schedule, 18 circatags
    $pkg_subtype = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;

    echo "<br></br>";
    echo "Package UID: " . $UID . ", and pkg_type is: " . $pkg_type . ", and sub_type is: " . $pkg_subtype;

    switch ($pkg_type)
    {   
        // View results:
        case 0:
            {
                switch ($pkg_subtype)
                {   
                    // For User:
                    case 0:
                        {
                            $sub_type = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                            $position_pointer++;
                            switch ($sub_type2)
                            {   
                                // Friends
                                case 0:
                                    {
                                        break;
                                    }

                                // Event
                                case 1:
                                    {
                                        break;
                                    }

                                // Posting
                                case 2:
                                    {
                                        break;
                                    }

                                // Info. User_Simple_Other_Pack
                                case 4:
                                    {   
                                        unpack_stranger_info($package_content, $position_pointer);
                                        break;
                                    }
                                
                                // Circatag_Pack
                                case 18:
                                    {
                                        break;
                                    }

                                default:
                                    {   
                                        echo 'sub_type2 undefined: ' . $sub_type2;
                                        break;
                                    }
                            }
                            break;
                        }
                    case 1:
                        {
                            break;
                        }
                    case 2:
                        {
                            break;
                        }
                    case 10:
                        {
                            break;
                        }
                    case 11:
                        {   // subtype2 {0 for friends, 1 for event, 2 for posting, 4 for info, 6 settings, 17 for schedule, 18 for circatag}
                            $sub_type2 = convert_byte_string_to_int(substr($package_content, $position_pointer , 1));
                            $position_pointer++;
                            switch ($sub_type2)
                            {
                                case 0:
                                    {
                                        $numOfFriends = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                        $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                                        $friendList = array();
                                        $currentFriend;
                                        for ($i = 0; $i < $numOfFriends; $i++)
                                        {
                                            $currentFriend = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                            $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                                            $friendList[] = $currentFriend;
                                        }

                                        break;
                                    }
                                case 1:
                                    {
                                        break;
                                    }
                                case 2:
                                    {
                                        break;
                                    }
                                case 4:
                                    {
                                        echo "Received current user's information!";
                                        unpack_self_info($package_content, $position_pointer);
                                        break;
                                    }
                                case 6:
                                    {
                                        echo "Received current user's settings!";
                                        $numOfSettings = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                        $position_pointer++;
                                        $settings = array();
                                        for ($i = 0; $i < $numOfSettings; $i++)
                                        {
                                            $settings[] = convert_byte_string_to_int(substr($package_content, $position_pointer + $i, 1));
                                        }
                                        break;
                                    }
                                case 17:
                                    {
                                        break;
                                    }
                                case 18:
                                    {
                                        break;    
                                    }
                                default:
                                    {
                                        break;
                                    }
                            }
                            
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }
        
        // Search results:
        case 1:
            {
                switch ($pkg_subtype)
                {
                    case 0:
                        {
                            $searchResult = array();
                            $numOfUser = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                            $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                            $currentResult;
                            for ($i = 0; $i < $numOfUser; $i++)
                            {
                                $currentResult = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                                $searchResult[] = $currentResult;
                            }
                            break;
                        }
                    case 1:
                        {
                            break;
                        }
                    case 2:
                        {
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }
        // Create
        case 2:
            {
                switch ($pkg_subtype)
                {
                    case 0:
                        {
                            if (convert_byte_string_to_int(substr($package_content, $position_pointer, 1)) == 0)
                            {
                                echo "Create successful!";
                                $position_pointer++;
                                unpack_create_new_user_feedback(SUCCESSFUL, convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH)));
                            }
                            else
                            {   
                                echo "Create failed";
                                unpack_create_new_user_feedback(FAILED, convert_byte_string_to_int(substr($package_content, $position_pointer, 1)));
                            }
                            break;
                        }
                    case 1:
                        {
                            break;
                        }
                    case 2:
                        {
                            break;
                        }
                    case 3:
                        {
                            $mode = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                            $position_pointer++;

                            switch ($mode)
                            {
                                case 0:
                                    {
                                        $requestee = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                        $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                                        $succeeded = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                        $position_pointer++;
                                        if ($succeeded == 0)
                                        {

                                        }
                                        else
                                        {
                                            $reason = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                        }
                                        break;
                                    }
                                case 1:
                                    {
                                        break;
                                    }
                                case 2:
                                    {
                                        break;
                                    }
                                default:
                                    {
                                        break;
                                    }
                            }
                            break;
                        }
                    case 12:
                        {
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }
        // Request
        case 3:
            {
                break;
            }
        // Tags
        case 4:
            {
                break;
            }
        // Notification
        case 5:
            {
                break;
            }
        // New Features
        case 6:
            {
                switch ($pkg_subtype)
                {
                    case 0:
                        {   
                            return unpack_and_return_login_feedback($package_content, $position_pointer, $UID);                            
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }
        // Quit
        case 7:
            {
                break;
            }
        // System Messages
        case 10:
            {
                switch ($pkg_subtype)
                {
                    case 0:
                        {
                            break;
                        }
                    case 1:
                        {
                            break;
                        }
                    case 4:
                        {
                            break;
                        }
                    case 5:
                        {   
                            $numOfNotif = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                            $position_pointer += NUM_OF_BYTES_IN_LENGTH;
                            for ($i = 0; $i < $numOfNotif; $i++)
                            {
                                $subType2 = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                $position_pointer++;

                                $seqNum = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                $position_pointer += NUM_OF_BYTES_IN_LENGTH;

                                $requester = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                $position_pointer += NUM_OF_BYTES_IN_LENGTH;

                                //$requestEvent = convertBytesToUInt64(package_content, position_pointer);
                                $position_pointer += 8;

                                //$requestPost = convertBytesToUInt64(package_content, position_pointer);
                                $position_pointer += 8;

                                $action = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                $position_pointer++;

                                $msgLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                $position_pointer++;
                                $msg = convert_byte_string_to_string(substr($package_content, $position_pointer, $msgLength));

                                switch ($subType2)
                                {
                                    case 0:
                                        {
                                            switch ($action)
                                            {
                                                case 0:
                                                    {
                                                        //$message = ;
                                                        break;
                                                    }
                                                case 1:
                                                    {
                                                        break;
                                                    }
                                                case 2:
                                                    {
                                                        break;
                                                    }
                                                default:
                                                    {

                                                        break;
                                                    }
                                            }
                                            break;
                                        }
                                    case 1:
                                        {
                                            break;
                                        }
                                    case 2:
                                        {
                                            break;
                                        }
                                    case 4:
                                        {
                                            break;
                                        }
                                    case 5:
                                        {
                                            break;
                                        }
                                    case 8:
                                        {
                                            break;
                                        }
                                    default:
                                        {
                                            break;
                                        }
                                }
                            }

                            break;
                        }
                    case 6:
                        {
                            break;
                        }
                    case 15:
                        {
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }

        // Instant Message
        case 12:
            {
                switch ($pkg_subtype)
                {
                    case 0:
                        {
                            $direction = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                            $position_pointer++;

                            switch ($direction)
                            {
                                case 0:
                                    {
                                        $seq = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));

                                        break;
                                    }
                                case 1:
                                    {
                                        $senderId = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
                                        $position_pointer += NUM_OF_BYTES_IN_LENGTH;

                                        //$contentLength = convertBytesToUInt16(package_content, position_pointer);
                                        $position_pointer += 2;

                                        $msg = convert_byte_string_to_string(substr($package_content, $position_pointer, $contentLength));
                                        $position_pointer += $contentLength;

                                        // date is an integer
                                        $date = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                        $position_pointer += NUM_OF_BYTES_IN_LENGTH;

                                        // time is an integer as well
                                        $time = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
                                        $position_pointer += NUM_OF_BYTES_IN_LENGTH;

                                        break;
                                    }
                                default:
                                    {
                                        break;
                                    }
                            }
                            break;
                        }
                    case 1:
                        {
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
                break;
            }

        
        default:
            echo 'The pkg_type is undefined: ' . $pkg_type;
            break;
    }
}

// Unpack User_Simple_Other_Pack
function unpack_stranger_info($package_content, $position_pointer){
    
    // $content is an associative array
    $content = array();
    $content["uid"] = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH)); 
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;

    $nickName_length = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["nickName"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $nickName_length));
    $position_pointer += $nickName_length;

    $name_length = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["name"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $nameLength));
    $position_pointer += $name_length;

    $birthday = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    $bday = $birthday / 10000;
    $birthday %= 10000;
    $bday += "/";
    $bday += birthday / 100;
    $bday += "/";
    $bday += birthday % 100;
    $content["birthday"] = $bday;
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;

    $gender = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    
    $gd;
    
    if ($gender == 0)
    {
        $gd = "Female";
    }
    else if ($gender == 1)
    {
        $gd = "Male";
    }
    else
    {
        $gd = "Others";
    }

    $position_pointer++;
    $content["gender"] = $gd;

    $cityLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["city"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $cityLength));
    $position_pointer += $cityLength;

    $content['position_pointer'] = $position_pointer;

    $numOfSharedTags = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;
    $sharedTags = "";
    $currentTag;
    $currentTagLength;

    for ($i = 0; $i < $numOfSharedTags; $i++)
    {
        $currentTagLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
        $position_pointer++;
        $currentTag = convert_byte_string_to_string(substr($package_content, $position_pointer, $currentTagLength));
        $sharedTags += $currentTag;
        $sharedTags += " ";
        $position_pointer += $currentTagLength;
    }

    $content["sharedTags"] = $sharedTags;

    $numOfCommonFriend = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    echo "There are " . $numOfCommonFriend . " common friends";
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;
    $commonFriends = "";
    $currentFriend;
    
    for ($i = 0; $i < $numOfCommonFriend; $i++)
    {
        $currentFriend = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
        $position_pointer += NUM_OF_BYTES_IN_LENGTH;
        $commonFriends += $currentFriend;
        $commonFriends += " ";
    }
    
    $content["commonFriends"] = $commonFriends;

    $content["thumbnail"] = "unknown!";

    echo '<pre>' . print_r($content, true) . '</pre>';
}

function unpack_create_new_user_feedback($is_successful, $uid_or_fail_reason){
    if ($is_successful == SUCCESSFUL){
        echo 'Succeeded, UID: ' . $uid_or_fail_reason;
    }
    else {
        echo 'Failed reason: ' . $uid_or_fail_reason;
    }
}
 
function unpack_self_info($package_content, $position_pointer){

    // $content is an associative array
    $content = array();
    $content["uid"] = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH)); 
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;

    $name_length = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["name"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $name_length));
    $position_pointer += $name_length;

    $nickName_length = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["nickName"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $nickName_length));
    $position_pointer += $nickName_length;

    $birthday = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    echo 'Birthday is: ' . $birthday;
    $bday = $birthday / 10000;
    $birthday %= 10000;
    $bday += "/";
    $bday += $birthday / 100;
    $bday += "/";
    $bday += $birthday % 100;
    $content["birthday"] = $bday;
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;

    $numOfTags = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;
    $tags = "";
    $currentTag;
    $currentTagLength;
    
    for ($i = 0; $i < $numOfTags; $i++)
    {
        $currentTagLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
        $position_pointer++;
        $currentTag = convert_byte_string_to_string(substr($package_content, $position_pointer, $currentTagLength));
        $tags += $currentTag;
        $tags += " ";
        $position_pointer += $currentTagLength;
    }

    $content["tags"] = $tags;

    $numOfHTags = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;
    $hTags = "";
    $currentHTag;
    $currentHTagLength;
    for ($i = 0; $i < $numOfHTags; $i++)
    {
        $currentHTagLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
        $position_pointer++;
        $currentHTag = convert_byte_string_to_string(substr($package_content, $position_pointer, $currentHTagLength));
        $hTags += $currentHTag;
        $hTags += " ";
        $position_pointer += $currentHTagLength;
    }

    $content["hiddenTags"] = $hTags;

    $rating = convert_byte_string_to_int(substr($package_content, $position_pointer, NUM_OF_BYTES_IN_LENGTH));
    $position_pointer += NUM_OF_BYTES_IN_LENGTH;
    $content["rating"] = $rating;

    $numOfHonors = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $honors = "";
    for ($i = 0; $i < $numOfHonors; $i++)
    {
        $honors += convert_byte_string_to_string(substr($package_content, $position_pointer, 1));
        $honors += " ";
        $position_pointer++;
    }
    $content["honors"] = $honors;

    $gender = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    
    $gd;
    
    if ($gender == 0)
    {
        $gd = "Female";
    }
    else if ($gender == 1)
    {
        $gd = "Male";
    }
    else
    {
        $gd = "Others";
    }

    $position_pointer++;
    $content["gender"] = $gd;

    $cityLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["city"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $cityLength));
    $position_pointer += $cityLength;


    $stateLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["state"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $stateLength));
    $position_pointer += $stateLength;

    $countryLength = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
    $position_pointer++;
    $content["country"] = convert_byte_string_to_string(substr($package_content, $position_pointer, $countryLength));
    $position_pointer += $countryLength;

    $content["thumbnail"] = "unknown!";
    
    $content['position_pointer'] = $position_pointer;

    echo '<pre>' . print_r($content, true) . '</pre>';
}

function unpack_and_return_login_feedback($package_content, $position_pointer, $UID){
    
    $succeeded = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));

    $position_pointer++;
    
    if ($succeeded == SUCCESSFUL)
    {
        $session_key = array_fill(0, SESSION_KEY_LENGTH, pack_to_unsigned_byte(0));
        
        for ($i = 0; $i < SESSION_KEY_LENGTH; $i++){
            $session_key[$i] = convert_byte_string_to_int(substr($package_content, $position_pointer, 1));
            echo '<br></br>' . $session_key[$i];
            $position_pointer++;
        }
              
        echo "Current session key set: ";
        $session_key_string = '';
        for ($i = 0; $i < SESSION_KEY_LENGTH; $i++)
        {
            $session_key_string .= chr($session_key[$i]);
        }

        return array(
            'session_key' => $session_key_string,
            'succeeded' => $succeeded,
            'uid' => $UID
        );

    }

    else
    {
        echo "Login Failed";

        return array(
            'session_key' => '',
            'succeeded' => $succeeded,
            'uid' => $UID
        );
    }
}
