// user submit form to create a new account
// when page is loaded, run all needed functions.
$(document).ready(function(){
	$("#user_reg_submit").click(function(){
		var user_info = {
				"name" :	$("#user_reg_name").val(),
        "email"	: $("#user_reg_email").val(),
        "gender" : $("#user_reg_gender").val(),
        "password" : $("#user_reg_password").val(),
        "time" : Date.now()
    };
		// ajax send to user accoutn info to server
		ajaxWithJsonData(user_info, "/user", "POST", onNewUserCreationCallBack);
	});

	// prepended status div for reset password page
	(function onLoadResetPasswordCallBack(){
		var status = $("#name").text();
		if(status != 0){
			prependInfoDiv($("#reset_password_div"), "reset_password_status", "something went wrong!");
		}
	}());
	
	// Upate views when create user call succeeded.
	function onNewUserCreationCallBack(data) {
		var create_status = data.status;
		if (create_status == 0) {
    	prependInfoDiv($("#user_reg"), "user_reg_status_info", "We send out a verification email to " + data.email);
		}
		else if (create_status == 1) {
			prependInfoDiv($("#user_reg"), "user_reg_status_info", "This email has already been used.");	
		}
		else if (create_status == 2) {
			prependInfoDiv($("#user_reg"), "user_reg_status_info", "This email is waiting for verification.");
		}
		else if (create_status == 9) {
			prependInfoDiv($("#user_reg"), "user_reg_status_info", "Database Error");
		}
		else {}
	}

	$("#user_login_button").click(function(){
		var login_info = {};
		login_info.email = $("#user_login_email").val(); 
		login_info.password = $("#user_login_password").val();
		ajaxWithJsonData(login_info, "/login", "POST", loginCallBack);
	});

	/* 
 	 * Update views after user login
	 * 0 : success
	 * 1 : account doesn't exist
	 * 2 : waiting for verification
	 * 3 : password incorrect
	 * 9 : database error
	 */
	function loginCallBack(data) {
		var login_status = data.status;
		if (login_status == 0) {
			$("#user_login_form").css('display', 'none');
			prependInfoDiv($("#user_login"), "user_login_status_info", "Welcome Back " + data.name);
		}
		else if (login_status == 1) {
			prependInfoDiv($("#user_login"), "user_login_status_info", "No existing account " + data.email);
		}
		else if (login_status == 2) {
			prependInfoDiv($("#user_login"), "user_login_status_info","Account " + data.email + "needed verification");
		}
		else if (login_status == 3) {
			prependInfoDiv($("#user_login"), "user_login_status_info", "Password Incorrect");
		}
		else if (login_status == 9){
			prependInfoDiv($("#user_login"), "user_login_status_info", "Database Error");
		}
		else {}
	}

	
	/* return 0, already logged out
	 * return 1, log out successfully
	 */
	$("#user_logout_button").click(function(){
		ajaxWithJsonData(null, "/logout", "GET", logoutCallBack);
	});
	
	/*
 	 * Update views back to login form after logout
 	 */
	function logoutCallBack(data) {
		// Recover login form
		$("#user_login_status_info").remove();
		$("#user_login_form").css('display', 'block');

		// Recover register form
		$("#user_reg_status_info").remove();
		$("#user_reg_form").css('display', 'block');
	}
	/*
 	 * Start Reset Password Process
   */
	$("#reset_password_init").click(function(){
		ajaxWithJsonData(null, "/reset_password", "GET", resetPasswordInitCallBack);
	});
	
	function resetPasswordInitCallBack(result){
		var parent = $("#info_section");
		while (parent.hasChildNodes()) {
    	parent.removeChild(node.lastChild);
		}
		prependInfoDiv(parent, "status_message", result.info);
	}

	/*
 	 * Reset Password Form Submission
   */
	$("#reset_password_button").click(function(){
		// firstly check two passwords are the same
		var password1 = $("#reset_password_1").val();
		var password2 = $("#reset_password_2").val();
		if(password1 != password2){
			$("#reset_password_status_info").remove();
			prependInfoDiv($("#reset_password_div"), "reset_password_status", "two passwords do not match.");
			return;
		}
		
		console.log($("#reset_password_email").text());	
		// send POST method
		var jsonData = {
				'email' : $("#reset_password_email").text(),
				'token' : $("#reset_password_token").text(),
				'password' : password1
		};
		ajaxWithJsonData(jsonData, '/reset_password', 'POST', resetPasswordCallBack);
	});

	function resetPasswordCallBack(result){
		if($("#reset_password_status_info")) $("#reset_password_status_info").remove();
		prependInfoDiv($("#reset_password_div"), "reset_password_status_info", result.info);

		// Hide Reset Form
		$("#reset_password_form").css('display', 'none');
	}
	
	/*
 	 * jsonData : data send out as json object
 	 * url : destination
 	 * type : type of Http methods
 	 * callback : function after ajax finishes, default pass data as params
 	 */
	function ajaxWithJsonData(jsonData, url, type, callback){
		$.ajax({
			type : type,
			url : url,
			data : jsonData,
			encoded : true
		}).done(function(data){
			console.log(data);
			if (callback) callback(data);
		}).fail(function(err){
			console.log("ajax network error!");
		});
	}
	
 /*
 	* Prepend Info div in Element
 	*/
	function prependInfoDiv(parentElem, id, content) {
		var prependedDiv = $('#' + id);
		if (prependedDiv.length > 0) {
				prependedDiv.text = content;
		}
		else {
				prependedDiv = "<div id=" + id + ">" + content + "</div>";
    parentElem.prepend(prependedDiv);
		}
	}
});

