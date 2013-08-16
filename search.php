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
				<input type="text" name="search_content" placeholder="search" /><br />
				<input name="search_button" id="search_button" type="submit" />
			
		<div class="search_option">
			<input type="checkbox" name="search_people" value= "people" checked /> &nbsp;&nbsp;People&nbsp;&nbsp;
			<input type="checkbox" name="search_post" value= "post" /> &nbsp;&nbsp;Posts&nbsp;&nbsp;
			<input type="checkbox" name="search_event" value= "event" /> &nbsp;&nbsp;Events&nbsp;&nbsp;
			<br></br>
			<input type="radio" name ="search_mode" value = 0 checked/> &nbsp;&nbsp;By Keywords&nbsp;&nbsp;
			<input type="radio" name ="search_mode" value = 1 /> &nbsp;&nbsp;By id&nbsp;&nbsp;
			<input type="radio" name ="search_mode" value = 2/> &nbsp;&nbsp;By email&nbsp;&nbsp;
			<br></br>
			<input type="checkbox" name ="match_option_name" value = "name" checked /> &nbsp;&nbsp;Name&nbsp;&nbsp;
			<input type="checkbox" name ="match_option_tag" value = "tag" checked /> &nbsp;&nbsp;Tags&nbsp;&nbsp;
			<br></br>
			<input type="checkbox" name ="match_option_user" value = "user"  /> &nbsp;&nbsp;User&nbsp;&nbsp;
			<input type="checkbox" name ="match_option_event" value = "event" /> &nbsp;&nbsp;Event&nbsp;&nbsp;
			<br></br>
			<p>From age:</p>
			<input type="text" name ="age_lower_bound" /><br />
			<p>To:</p>
			<input type="text" name ="age_upper_bound" /><br />
			<input type="checkbox" name ="gender_male" value = "male" checked/> &nbsp;&nbsp;Male&nbsp;&nbsp;
			<input type="checkbox" name ="gender_female" value = "female" checked/> &nbsp;&nbsp;Female&nbsp;&nbsp;
			<input type="checkbox" name ="gender_other" value = "other" checked/> &nbsp;&nbsp;Other&nbsp;&nbsp;
			<br></br>
			<input type="radio" name ="match_location" value = 0 checked/> &nbsp;&nbsp;Local&nbsp;&nbsp;
			<input type="radio" name ="match_location" value = 1 /> &nbsp;&nbsp;Global&nbsp;&nbsp;
		</div>
		</form>
		</div>
	</div>
	
	<?php include_once 'sidebar.php';?>
</body>

<footer> </footer>

</html>
