$(document).ready(function(){
	$('#LoginButton').click(function(){
		var proceed = true;
		if($('#inputEmail').val() == ""){
			proceed = false;
			$('#emailGroup').addClass('error');
			$('#emailWarning').show();
		}else{
			proceed = true;
			$('#emailGroup').removeClass('error');
			$('#emailWarning').hide();
		}
		if($('#inputPassword').val() == ""){
			proceed = false;
			$('#passwordGroup').addClass('error');
			$('#passwordWarning').show();
		}else{
			proceed = false;
			$('#passwordGroup').removeClass('error');
			$('#passwordWarning').hide();
		}
		if(proceed){
			//Do send the post request
		}
		return false;
	});
});