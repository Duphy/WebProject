<?php include_once 'header.php';?>

<title>Home page</title>

<style type = "text/css">
	@import url("css/mainpage.css")
</style>

<script>
		  /*array(1,$_POST['name']),
			array(2,$_POST['nickname']),
			array(3,$_POST['birthday']),
			array(4,$_POST['gender']),
			array(5,$_POST['city']),
			array(6,$_POST['state']),
			array(7,$_POST['country']),*/
			
	$(document).ready(function(){
		/*$("#test").click(function(){
			$.ajax({
				url:"database/backend_setting_user_profile.php",
				data:{"name":"qiyue","nickname":"qiyue","birthday":"20131010","gender":"male","city":"xian","state":"shanxi","country":"china"},
				type:"POST",
				success:function(data){
					console.log(data);
					console.log("WTF?fucking successfully la hahahaha!");
				}
			});
		});*/
		$("#postArea").css("width",$("#myModal").width()*0.91);
		console.log("postArea:"+$("#postArea").width());
		console.log("modal:"+$("#myModal").width());
	});	
</script>
	
</head>
<body style = "background-color:#E0E0E0;">
<?php include_once 'navigator.php';?>

<!-- header end -->
	<div class="container-fluid">
		
		<div class="row-fluid">
		   <div class="span1"></div>
		   
		   <div class="span10 row-fluid">
		   	
		      <div class = "span6 left-column">
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Ben Leong</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;">
			      			Because political beliefs are connected to deeply held values, information about politics can be very threatening to your self-image. Imagine coming across information that contradicts everything you’ve ever believed about the efficacy of Medicare, for example. 
			      		</div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span2" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset6 span1"><button class = "btn-small"><i class = "icon-share"></i></button></div>
			      		<div class = "span1"><button class = "btn-small"><i class = "icon-plus-sign"></i></button></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class="accordion" id="reply1" style = "background-color:white;margin-bottom: 0px;">
						  <div class="accordion-group" style = "border:none;">
						    <div class="accordion-heading" style = "text-align: center;">
						      <a class="accordion-toggle" data-toggle="collapse" data-parent="#reply1" href="#collapse1">
						        10 persons with 20 replies
						      </a>
						    </div>
						    <div id="collapse1" class="accordion-body collapse">
						      <div class="accordion-inner">
						      	<ul id = "scroller" style = "max-height:250px;overflow: scroll;">
									<li id="reply1" class = "row-fluid">
										<img class = "span1" src = "img/photo (2).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Ben leong</strong>&nbsp;&nbsp;<font>5:38pm</font>
											</div>
											<div class = "row-fluid">
												<p>Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.</p>
											</div>
										</div>
									</li>
									<li id="reply2" class = "row-fluid">
										<img class = "span1" src = "img/photo.jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>somebody</strong>&nbsp;&nbsp;<font>5:20pm</font>
											</div>
											<div class = "row-fluid">
												<p>The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources. </p>
											</div>
										</div>
									</li>
									<li id="reply3" class = "row-fluid">
										<img class = "span1" src = "img/photo (1).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Harrison</strong>&nbsp;&nbsp;<font>5:10pm</font>
											</div>
											<div class = "row-fluid">
												<p>Watch Pirillo Vlog 492 - The Lord of the LEGO Rings to see Diana up and about again and to help me convince Darth Vader that I still love him. He sure is touchy. </p>
											</div>
										</div>
									</li>
									<li id="reply4" class = "row-fluid">
										<img class = "span1" src = "img/photo (3).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Cherry</strong>&nbsp;&nbsp;<font>5:00pm</font>
											</div>
											<div class = "row-fluid">
												<p>hello this is a new lovely boy!</p>
											</div>
										</div>
									</li>
	                            </ul>
						      </div>
						    </div>
						  </div>
						</div>
			      	</div>
		      	</div>
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;margin-top: 10px;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Ben Leong</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;">
			      			Because political beliefs are connected to deeply held values, information about politics can be very threatening to your self-image. Imagine coming across information that contradicts everything you’ve ever believed about the efficacy of Medicare, for example. 
			      		</div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span2" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset6 span1"><button class = "btn-small"><i class = "icon-share"></i></button></div>
			      		<div class = "span1"><button class = "btn-small"><i class = "icon-plus-sign"></i></button></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class="accordion" id="reply2" style = "background-color:white;margin-bottom: 0px;">
						  <div class="accordion-group" style = "border:none;">
						    <div class="accordion-heading" style = "text-align: center;">
						      <a class="accordion-toggle" data-toggle="collapse" data-parent="#reply2" href="#collapse2">
						        10 persons with 20 replies
						      </a>
						    </div>
						    <div id="collapse2" class="accordion-body collapse">
						      <div class="accordion-inner">
						      	<ul id = "scroller" style = "max-height:250px;overflow: scroll;">
									<li id="reply1" class = "row-fluid">
										<img class = "span1" src = "img/photo (2).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Ben leong</strong>&nbsp;&nbsp;<font>5:38pm</font>
											</div>
											<div class = "row-fluid">
												<p>Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.</p>
											</div>
										</div>
									</li>
									<li id="reply2" class = "row-fluid">
										<img class = "span1" src = "img/photo.jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>somebody</strong>&nbsp;&nbsp;<font>5:20pm</font>
											</div>
											<div class = "row-fluid">
												<p>The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources. </p>
											</div>
										</div>
									</li>
									<li id="reply3" class = "row-fluid">
										<img class = "span1" src = "img/photo (1).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Harrison</strong>&nbsp;&nbsp;<font>5:10pm</font>
											</div>
											<div class = "row-fluid">
												<p>Watch Pirillo Vlog 492 - The Lord of the LEGO Rings to see Diana up and about again and to help me convince Darth Vader that I still love him. He sure is touchy. </p>
											</div>
										</div>
									</li>
									<li id="reply4" class = "row-fluid">
										<img class = "span1" src = "img/photo (3).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Cherry</strong>&nbsp;&nbsp;<font>5:00pm</font>
											</div>
											<div class = "row-fluid">
												<p>hello this is a new lovely boy!</p>
											</div>
										</div>
									</li>
	                            </ul>
						      </div>
						    </div>
						  </div>
						</div>
			      	</div>
		      	</div>
		      	
		      	<!--<div class = "row-fluid" style = "background-color:#FFFFFF;margin-top:20px;height:300px;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset3 span6 offset3"  style = "background-color:#F0F0F0;height:80px;text-align: center"><h1>Ben Leong</h1></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;height:80px;">
			      			Because political beliefs are connected to deeply held values, information about politics can be very threatening to your self-image. Imagine coming across information that contradicts everything you’ve ever believed about the efficacy of Medicare, for example. 
			      		</div>
			      	</div>
		      	</div>
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;margin-top:20px;height:300px;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset3 span6 offset3"  style = "background-color:#F0F0F0;height:80px;text-align: center"><h1>Ben Leong</h1></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;height:80px;">
			      			Because political beliefs are connected to deeply held values, information about politics can be very threatening to your self-image. Imagine coming across information that contradicts everything you’ve ever believed about the efficacy of Medicare, for example. 
			      		</div>
			      	</div>
		      	</div>
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;margin-top:20px;height:300px;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset3 span6 offset3"  style = "background-color:#F0F0F0;height:80px;text-align: center"><h1>Ben Leong</h1></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;height:80px;">
			      			Because political beliefs are connected to deeply held values, information about politics can be very threatening to your self-image. Imagine coming across information that contradicts everything you’ve ever believed about the efficacy of Medicare, for example. 
			      		</div>
			      	</div>
		      	</div>-->
		      	
		      </div>
		      
		      <div class = "span6 right-column">
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Somebody</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;">
			      			The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources.
			      			Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.
			      		</div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span2" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset6 span1"><button class = "btn-small"><i class = "icon-share"></i></button></div>
			      		<div class = "span1"><button class = "btn-small"><i class = "icon-plus-sign"></i></button></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class="accordion" id="reply3" style = "background-color:white;margin-bottom: 0px;">
						  <div class="accordion-group" style = "border:none;">
						    <div class="accordion-heading" style = "text-align: center;">
						      <a class="accordion-toggle" data-toggle="collapse" data-parent="#reply3" href="#collapse3">
						        5 persons with 15 replies
						      </a>
						    </div>
						    <div id="collapse3" class="accordion-body collapse">
						      <div class="accordion-inner">
						      	<ul id = "scroller" style = "max-height:250px;overflow: scroll;">
									<li id="reply1" class = "row-fluid">
										<img class = "span1" src = "img/photo (2).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Ben leong</strong>&nbsp;&nbsp;<font>5:38pm</font>
											</div>
											<div class = "row-fluid">
												<p>Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.</p>
											</div>
										</div>
									</li>
									<li id="reply2" class = "row-fluid">
										<img class = "span1" src = "img/photo.jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>somebody</strong>&nbsp;&nbsp;<font>5:20pm</font>
											</div>
											<div class = "row-fluid">
												<p>The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources. </p>
											</div>
										</div>
									</li>
									<li id="reply3" class = "row-fluid">
										<img class = "span1" src = "img/photo (1).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Harrison</strong>&nbsp;&nbsp;<font>5:10pm</font>
											</div>
											<div class = "row-fluid">
												<p>Watch Pirillo Vlog 492 - The Lord of the LEGO Rings to see Diana up and about again and to help me convince Darth Vader that I still love him. He sure is touchy. </p>
											</div>
										</div>
									</li>
									<li id="reply4" class = "row-fluid">
										<img class = "span1" src = "img/photo (3).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Cherry</strong>&nbsp;&nbsp;<font>5:00pm</font>
											</div>
											<div class = "row-fluid">
												<p>hello this is a new lovely boy!</p>
											</div>
										</div>
									</li>
	                            </ul>
						      </div>
						    </div>
						  </div>
						</div>
			      	</div>
		      	</div>
		      	
		      	<div class = "row-fluid" style = "background-color:#FFFFFF;margin-top: 10px;">
			      	<div class = "row-fluid" style = "margin-top:10px;height:50px;">
			      		<div class = "span3" style = "background-color:#F0F0F0;text-align: center;">Somebody</div>
			      		<div class = "offset7 span2" style = "background-color:#CC0033;color:white;text-align: center;">Tag</div>
			      	</div>
			      	<div class = "row-fluid">
			      		<div class = "offset1 span10 offset1" style = "background-color:#F0F0F0;">
			      			The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources.
			      			Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.
			      		</div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class = "offset1 span2" style = "background-color:#F0F0F0;text-align: center;">Date</div>
			      		<div class = "offset6 span1"><button class = "btn-small"><i class = "icon-share"></i></button></div>
			      		<div class = "span1"><button class = "btn-small"><i class = "icon-plus-sign"></i></button></div>
			      	</div>
			      	<div class = "row-fluid" style = "margin-top:10px;">
			      		<div class="accordion" id="reply4" style = "background-color:white;margin-bottom: 0px;">
						  <div class="accordion-group" style = "border:none;">
						    <div class="accordion-heading" style = "text-align: center;">
						      <a class="accordion-toggle" data-toggle="collapse" data-parent="#reply4" href="#collapse4">
						        5 persons with 15 replies
						      </a>
						    </div>
						    <div id="collapse4" class="accordion-body collapse">
						      <div class="accordion-inner">
						      	<ul id = "scroller" style = "max-height:250px;overflow: scroll;">
									<li id="reply1" class = "row-fluid">
										<img class = "span1" src = "img/photo (2).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Ben leong</strong>&nbsp;&nbsp;<font>5:38pm</font>
											</div>
											<div class = "row-fluid">
												<p>Maszuari Muhammad I had the same problem go to the Amazon site and update your info and then try it again I did that and it worked for me.</p>
											</div>
										</div>
									</li>
									<li id="reply2" class = "row-fluid">
										<img class = "span1" src = "img/photo.jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>somebody</strong>&nbsp;&nbsp;<font>5:20pm</font>
											</div>
											<div class = "row-fluid">
												<p>The reality that malls and consumerism only cater to a small percentage of the population is becoming more and more apparent. Remember—Asia’s economic growth was built on manufacturing and natural resources. </p>
											</div>
										</div>
									</li>
									<li id="reply3" class = "row-fluid">
										<img class = "span1" src = "img/photo (1).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Harrison</strong>&nbsp;&nbsp;<font>5:10pm</font>
											</div>
											<div class = "row-fluid">
												<p>Watch Pirillo Vlog 492 - The Lord of the LEGO Rings to see Diana up and about again and to help me convince Darth Vader that I still love him. He sure is touchy. </p>
											</div>
										</div>
									</li>
									<li id="reply4" class = "row-fluid">
										<img class = "span1" src = "img/photo (3).jpg" style = "border-radius:3px;">
										<div class = "span11">
											<div class = "row-fluid">
												<strong>Cherry</strong>&nbsp;&nbsp;<font>5:00pm</font>
											</div>
											<div class = "row-fluid">
												<p>hello this is a new lovely boy!</p>
											</div>
										</div>
									</li>
	                            </ul>
						      </div>
						    </div>
						  </div>
						</div>
			      	</div>
		      	</div>
		      	
		      </div>
		      
		   </div>  
		   
		   <div class="span1"></div>
		
		</div>
		 
		<!-- Modal -->
		<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		  <div class="modal-header">
		    <h3 id="myModalLabel">Create A New Post</h3>
		  </div>
		  <div class="modal-body">
		  	<textarea rows="5" id = "postArea"></textarea>
		  </div>
		  <div class="modal-footer">
		    <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
		    <button class="btn btn-primary">Submit</button>
		  </div>
		</div>
		
	</div>

<?php include_once 'sidebar.php';?>

</body>
</html>