// user submit form to create a new account
// when page is loaded, run all needed functions.
$(document).ready(function(){
	// Check if user is logged in at first
	(function onLoadHomePageCallBack(){
		var logged_in = $("#logged_in").text();
		var name = $("#name").text();
		var email = $("#email").text();
		if(logged_in == "true") {
			prependInfoDiv($("#user_login"), "user_login_status_info", "Welcome Back " + name);
			$("#user_login_form").css('display', 'none');
		}
		else {
			$("#user_login_form").css('display', 'block');
		}
	}());

	(function onLoadRegisterPageCallBack(){
		var logged_in = $("#logged_in").text();
		var name = $("#name").text();
		var email = $("#email").text();
		if(logged_in == "true") {
			prependInfoDiv($("#user_reg"), "user_reg_status_info", "Please log out before register a new account.");
			$("#user_reg_form").css('display', 'none');
		}	
		else {
			// normally render register page
		}
	}());

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
	
	// Upate views when create user call succeeded.
	function onNewUserCreationCallBack(data) {
		var create_status = data.status;
		if (create_status == 0) {
			$("#user_reg_form").css('display', 'none');
    	prependInfoDiv($("#user_reg"), "user_reg_status_info", "Welcome to our family: " + data.name);
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
		var request_object = {};
		ajaxWithJsonData(request_object, "/logout", "GET", logoutCallBack);
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

