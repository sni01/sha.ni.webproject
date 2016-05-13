$(document).ready(function(){
	$("#new_user_verification_link").click(function(){
		var token = $("#new_user_verification_token").text();
		var email = $("#new_user_verification_email").text();

		var jsonData = {
				'email' : email,
				'token' : token
		};
		// Fire off ajax to verify email in account
		$.ajax({
				type : "GET",
				url : "/email_verification",
				data : jsonData,
				encoded : true	
		}).done(function(data){
				console.log("verification message successfully received.");
		}).fail(function(err){
				console.log("ajax network error!");
		});
	})		

});
