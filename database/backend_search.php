<?php include_once 'header.php';?>
<title>Search</title>
</head>
<body>
	<?php include_once 'navigator.php';?>

	<h3>Search</h3>

	<div class="search_field">
		<div class="search_bar">
			<form action="database/backend_search.php" method="post"
				enctype="multipart/form-datd">
				<input type="text" name="default_search" placeholder="search" /><br />
				<input name="search_button" id="search_button" type="submit" />
			</form>
		</div>
		<div class="search_option">
			<input type="checkbox" name="search_content" value= "people"/> &nbsp;&nbsp;People&nbsp;&nbsp;
			<input type="checkbox" name="search_content" value= "post"/> &nbsp;&nbsp;Posts&nbsp;&nbsp;
			<input type="checkbox" name="search_content" value= "event"/> &nbsp;&nbsp;Events&nbsp;&nbsp;
			<br></br>
			<input type="radio" name ="search_mode" value = "id"> &nbsp;&nbsp;By id&nbsp;&nbsp;
			<input type="radio" name ="search_mode" value = "filter"/> &nbsp;&nbsp;By Keywords&nbsp;&nbsp;
			<input type="radio" name ="search_mode" value = "email"/> &nbsp;&nbsp;By email&nbsp;&nbsp;
			<br></br>
			<input type="checkbox" name ="match_option" value = "name"/> &nbsp;&nbsp;Name&nbsp;&nbsp;
			<input type="checkbox" name ="match_option" value = "tag"/> &nbsp;&nbsp;Tags&nbsp;&nbsp;
		</div>
	</div>
	
	<h3>Search Results</h3>
	<?php 
	//search($currentUserId, $search_type, $mode, $keys,$session_key, $location=-1, $option = -1,  $age = -1, $gender=-1)
	switch ($_POST("search_mode")){
		case "id":
			$mode = 1;
			break;
		case "filter":
			$mode = 0;
			break;
		case "email":
			$mode = 2;
			break;
	}
	if ($_POST("match_option")=="name"){
		$option = 1;
	}
	else if($_POST("match_option")=="tag"){
		$option = 2;
	}
	else{
		$option = 0;
	}
	
	
	$request = search();
	
	
	
	
	?>




	<div class="searchresults">

		<div id="profile photo">
			<img
				src="https://lh3.googleusercontent.com/-QzyS5Mtzh2s/AAAAAAAAAAI/AAAAAAAAAAA/u9rVtEolGdU/s46-c-k-no/photo.jpg">
		</div>

		<div id="name">Ben Leong</div>

		<div id="tags">Computer | Japanese Food | Sweet Stuff | Photography</div>

		<div id="location">Singapore</div>

		<div id="add_friend">
			<a href="">Add Friend</a>
		</div>

	</div>
	<?php include_once 'sidebar.php';?>
</body>

<footer> </footer>

</html>
