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
		ajaxWithJsonData(user_info, "/user", "POST", onNewUserCreationSuccess, errorHandler);
	});
	
	// Upate views when create user call succeeded.
	// Hide form and show "welcome" text div
	function onNewUserCreationSuccess(data) {
		var user_name = data.user_name;
		var user_welcome_div = "<div id='user_reg_welcome'> Welcome to our family:" + user_name + "!</div>";
		$("#user_reg_form").remove();
		$("#user_reg").append(user_welcome_div);
	}

	$("#user_login_button").click(function(){
		var login_info = {};
		login_info.email = $("#user_login_button").val();
		login_info.password = $("#user_login_password").val();
		ajaxWithJsonData(login_info, "/login", "POST", loginCallBack, errorHandler);
	});

	// Update views after user login
	function loginCallBack(data) {
		var user_status = data.status;
		if (status == 1) {
			// password incorrect
			alert("you are login");
		}
		else if (status == 2) {
			// user not exists
			alert("password is incorrect");
		}
		else {
			// login
			alert("user account not exists");
		}
		var user_name = data.name;
                var user_welcome_back_div = "<div id='user_reg_welcome'> Welcome Back " + user_name + "!</div>";
                $("#user_login_form").css('display', 'none');
                $("#user_login").append(user_welcome_back_div);
	}
	
	// TODO: view update
	// Incorrect response
	function loginErrorHandler(err) {
		alert(err);
	}

	/* return 0, already logged out
	 * return 1, log out successfully
	 */
	$("#user_logout_button").click(function(){
		var request_object = {};
		ajaxWithJsonData(request_data, "/logout", "GET", null, errorHandler);
	});
	
	/*
 	 * Update views back to login form after logout
 	 */
	function logoutCallback(data) {
	
	}
	
	/*
 	 * jsonData : data send out as json object
 	 * url : destination
 	 * type : type of Http methods
 	 * callback : function after ajax finishes, default pass data as params
 	 */
	function ajaxWithJsonData(jsonData, url, type, callback, errorHandler){
		$.ajax({
			type : "POST",
			url : url,
			data : jsonData,
			encoded : true
		}).done(function(data){
			console.log(data);
			if (callback) callback(data);
		}).fail(function(err){
			errorHandler(err);
		});
        }

	/*
 	 * TODO: add more fancy view updates
 	 * show alert for now
 	 */
	function errorHandler(error) {
		alert(error);
	}
		
});

