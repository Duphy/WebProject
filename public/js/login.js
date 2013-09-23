$(document).ready(function(){
	$('#LoginButton').click(function(){
		var proceed = true;
		var email = $('#inputEmail').val();
		var password = $('#inputPassword').val();
		if(email == ""){
			proceed = false;
			$('#emailGroup').addClass('error');
			$('#emailWarning').show();
		}else{
			proceed = true;
			$('#emailGroup').removeClass('error');
			$('#emailWarning').hide();
		}
		if(password == ""){
			proceed = false;
			$('#passwordGroup').addClass('error');
			$('#passwordWarning').show();
		}else{
			proceed = true;
			$('#passwordGroup').removeClass('error');
			$('#passwordWarning').hide();
		}
		console.log("email:" + email);
		console.log("password:" + password);
		if(proceed){
			//Do send the post request
			data = {};
			data.email = email;
			data.password = password;
			$.ajax({
				url:"/doLogin",
				data:JSON.stringify(data),
				type:"POST",
				contentType: 'application/json',
				success:function(data){
					//do something
					alert("yeah!");
					console.log('reach inside');
					console.log(data);
				}
			});
		}
		return false;
	});
});