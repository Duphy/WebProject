<?php include_once 'header.php';?>

<title>Home page</title>

<style type = "text/css">
	@import url("css/mainpage.css")
</style>

</head>
<body>
<?php include_once 'navigator.php';?>
<?php 
$str = $_SERVER["QUERY_STRING"];

parse_str($str);
$request = view_user($_SESSION['uid'],$uid, 4, $_SESSION['session_key']);
					$response = connect_to_server_and_send_message($request);
						// User's information is contained in $retrived_response
					$user_info = unpack_pkg($response);
$request = view_user($_SESSION['uid'],$uid, 4, $_SESSION['session_key']);
					$response = connect_to_server_and_send_message($request);
					// User's information is contained in $retrived_response
					$user_info = unpack_pkg($response);

?>
<!-- header end -->


</body>