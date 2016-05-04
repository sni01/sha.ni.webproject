// user submit form to create a new account
// when page is loaded, run all needed functions.
$(document).ready(function(){
	$('#user_login_redirect_create_account_page').click(function(){
		$.ajax({
			type : "GET",
			url : '/register'
		}).done(function(data){
			console.log("Redirect to create account page.");
		});
	});
	$("#user_reg_submit").click(function(){
		var user_info = {
         	       "name"          :       $("#user_reg_name").val(),
               		"email"         :       $("#user_reg_email").val(),
                	"gender"        :       $("#user_reg_gender").val(),
                	"password"      :       $("#user_reg_password").val(),
                	"time"          :       Date.now()
        	};
		// ajax send to user accoutn info to server
		$.ajax({
			type : "POST",
		        url : '/user',
		     	data : user_info,
		        dataType :'json',
		      	encoded : true,
		}).done(function(data){
			onNewUserCreationSuccess(data);
		});
	});
	
	// Upate views when create user call succeeded.
	// Hide form and show "welcome" text div
	function onNewUserCreationSuccess(data) {
		alert(JSON.stringify(data))
		var user_name = data.user_name;
		var user_welcome_div = "<div id='user_reg_welcome'> Welcome to our family:" + user_name + "!</div>";
		$("#user_reg_form").remove();
		$("#user_reg").append(user_welcome_div);
	}

	// log out here means setting session logout attribute to false
	// return 0, already logged out
	// return 1, log out successfully
	$("#user_logout_button").click(function(){
		var request_object = {};
		$.ajax({
			type : "GET",
			url : "/logout",
			data : request_object,
			dataType : 'json',
			encoded : true
		}).done(function(data){
			console.log(data); // return value is number
		});
	});
	
});

