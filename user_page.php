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


?>
<!-- header end -->


</body>