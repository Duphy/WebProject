<?php

require_once("constants.php");
require_once("CTS.php");
require_once("common_functions.php");
require_once("STC.php");
function connect_to_server_and_send_message($msg, $socket = NULL){

	$should_close_socket = TRUE;

	if ($socket == NULL){
		// Socket is not passed in, meaning that it's used once only. 
		// So we create one, and close it after use
		$socket = connect_to_server_and_return_socket();
		$should_close_socket = TRUE;
		//echo 'Created new socket<br></br>';
	}
	else{
		// Socket is passed in, meaning that it will be used in the future.
		// So se don't need a new one. And don't close it after use.
		//echo 'Reused old socket<br></br>';
		$should_close_socket = FALSE;
	}
	
	// Write to socket:
	//echo '<br></br>';
	//echo 'Server Util is sending this package of length ' . strlen($msg) . ': ';

	$msg_array = str_split($msg);
	/*foreach ($msg_array as $c)
		echo ' ' . ord($c);
*/
	$result = socket_write($socket, $msg, strlen($msg)) or die("Could not write socket\n");

	// start listening for connections
	// specify the number of queued connections to allow as a second parameter (3, in this example)
	// $result = socket_listen($socket, 3) or die("Could not set up socket listener\n");

	// accept incoming connections
	// establish incoming connections
	// spawn another socket to handle communication
	// $spawn = socket_accept($socket) or die("Could not accept incoming connection\n");

	// With a connection established, the server now waits for the client to send it some input
	// Reads 1 bytes at a time (or until a \r, \n or \0 is received depending on the value of the optional third parameter

	// The third type parameter to socket_read() can either be
	// PHP_BINARY_READ, which uses the system read() and is safe for reading binary data (default type as of PHP >= 4.1.0) or
	// PHP_NORMAL_READ in which reading stops at \n or \r (default in PHP <= 4.0.6)ext line of the PHP script.
	//die("read here");
	$length_string = socket_read($socket, NUM_OF_BYTES_IN_LENGTH) or die("Could not read length value in input\n");
	$length = convert_byte_string_to_int($length_string);

	//echo "<br></br>";
	//echo "Received length: " . $length;

	// read
	$input = socket_read($socket, $length - NUM_OF_BYTES_IN_LENGTH) or die("Could not read content in input\n");

	//echo "<br></br>";
	//echo "Received content: ";

	// Print out the content:
	//for ($i = 0; $i < $length - NUM_OF_BYTES_IN_LENGTH; $i++)
	//	echo " " . ord(substr($input, $i, 1));
	//

	if ($should_close_socket){
		socket_close($socket);
		//echo 'Socket closed' . '<br></br>';
	} else{
		//echo 'Socket remain open' . '<br></br>';
	}

	return $input;
}


function connect_to_server_and_return_socket(){
	
	/* Turn on implicit output flushing so we see what we're getting
	 * as it comes in.
	*/
	ob_implicit_flush(TRUE);

	// set some variables
	$host = "25.40.107.250";
	$port = 1992;

	// If this is a server, it's also a good idea to use the set_time_limit() function
	// to ensure that PHP doesn't time out and die() while waiting for incoming client connections.
	set_time_limit(10);

	// create socket
	$socket = socket_create(AF_INET, SOCK_STREAM, 0) or die("Could not create socket\n");

	// bind socket to the specified address and port
	// Only useful if this is the server
	// $result = socket_bind($socket, $host, $port) or die("Could not bind to socket\n");

	// Only need to connect:
	socket_connect($socket, $host, $port) or die("Could not connect to the socket");

	return $socket;
}
