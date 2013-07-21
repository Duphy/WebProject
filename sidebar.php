<?php 
echo '
<script>
	var left_flag = false;
	var right_flag = false;
	var div;

function controlSpan(param){
		if(param==0){
			div = $(".leftspan");
			if(left_flag==false){
				left_flag=true;
				div.animate({
					left: "+=150px",
				},
					500
				);
			}
			else if(left_flag==true){
				left_flag=false;
				div.animate({
					left: "-=150px",
				},
					500
				);
			}
		}
		if(param==1){
			div = $(".rightspan");
			if(right_flag==false){
				right_flag=true;
				$(".friendlist").show();
				div.animate({
					right: "+=150px",
				},
					500
				);
			}
			else if(right_flag==true){
				right_flag=false;
				div.animate({
					right: "-=150px",
				},
					500
				);
		window.setTimeout(function(){$(".friendlist").hide();}, 700);
			}
		}
}
</script>
<div class = "leftspan">
	<div class = "leftButton">
	 <button onclick = "controlSpan(0);">left</button>
 	</div>
	<div class = "setting">profile</div>
</div>

<div class = "rightspan">
	<div class = "rightButton">
		<button onclick = "controlSpan(1);">right</button>
 	</div>
	<div class = "friendlist">
		<table>
			<tr>
				<td><img src = "1.jpg"></td>
				<td><p>Alice</p></td>
			</tr>
	
	
		</table>
	
	</div>
</div>

';