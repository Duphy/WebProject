<?php include_once 'header.php';?>

<title>Home page</title>

<style type = "text/css">
	@import url("css/mainpage.css")
</style>

</head>
<body>
<?php include_once 'navigator.php';?>
<!-- header end -->
<div id = "mainbody">
	<div class = "post">
		<div class ="userpanel">
			<a>
				<img src= "a.jpg">
				User Name
			</a>
		</div>
		
		<div class = "date">today</div>
		
		<div class = "postTag">
			<ul>
				<li><a href="#">#HelloWorld</a>
					<ul>
		            	<li><a href="#">#NUS</a></li>
		            	<li><a href="#">#SoC</a></li>
		        	</ul>
		        </li>
		    </ul>
		</div>
		
		<div class = "status">share or post</div>
		
		<div class = "content">
		<p>hello world</p>
		</div>
		
		<div class = "comment">
		<form action = "fake.php" method = "post" enctype = "multipart/form-datd">
			<input type = "text" name = "default_search" placeholder = "Want to say something?"/><br/>
			<input name = "search_button" id = "search_button" type = "submit" value = "comment"/>
		</form>
	</div>
	</div>

</div>
<?php include_once 'sidebar.php';?>

</body>
</html>