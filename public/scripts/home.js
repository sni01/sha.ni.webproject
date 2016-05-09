// user submit form to create a new account
// when page is loaded, run all needed functions.
$(document).ready(function(){
	// Check if user is logged in at first
	ajaxWithJsonData({}, "/", "GET", onLoadHomePageCallBack);

	function onLoadHomePageCallBack(data){
		var logged_in = $("#logged_in").text();
		var name = $("#name").text();
		var email = $("#email").text();
		console.log(name);
		if(logged_in == "true") {
			prependInfoDiv($("#user_login"), "user_login_status_info", "Welcome Back " + name);
			$("#user_login_form").css('display', 'none');
		}
		else {
			$("#user_login_form").css('display', 'block');
		}
	}

	// Redirect to create account page
	$('#redirect_create_account_page').click(function(){
		//ajaxWithJsonData({}, "/register", "GET", null);
	});

	$("#user_reg_submit").click(function(){
		var logged_in = $("#logged_in").text();
		if (logged_in == 'true') {
			alert("please logout before create new account");
			return;
		}
		var user_info = {
				"name" :	$("#user_reg_name").val(),
        "email"	: $("#user_reg_email").val(),
        "gender" : $("#user_reg_gender").val(),
        "password" : $("#user_reg_password").val(),
        "time" : Date.now()
    };
		// ajax send to user accoutn info to server
		ajaxWithJsonData(user_info, "/user", "POST", onNewUserCreationSuccess);
	});
	
	// Upate views when create user call succeeded.
	// Hide form and show "welcome" text div
	function onNewUserCreationSuccess(data) {
		var status = data.status;
		if (status == 0) {
			$("#user_reg_form").remove();
    	prependInfoDiv($("user_reg"), "user_reg_status_info", "Welcome to our family: " + data.name);
		}
		else if (status == 2) {
			prependInfoDiv($("user_reg"), "user_reg_status_info", "This email has already been used.");	
		}
		else{}
	}

	$("#user_login_button").click(function(){
		var login_info = {};
		login_info.email = $("#user_login_email").val(); 
		login_info.password = $("#user_login_password").val();
		ajaxWithJsonData(login_info, "/login", "POST", loginCallBack);
	});

	// Update views after user login
	function loginCallBack(data) {
		var user_status = data.status;
		if (user_status == 0) {
			// password incorrect
			$("#user_login_form").css('display', 'none');
			prependInfoDiv($("#user_login"), "user_login_status_info", "Welcome Back " + data.name);
		}
		else if (user_status == 1) {
			// user not exists
			prependInfoDiv($("#user_login"), "user_login_status_info","Password Error");
		}
		else {
			// login
			prependInfoDiv($("#user_login"), "user_login_status_info","User Account doesn't exist");	
		}
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
		$("#user_login_status_info").remove();
		$("#user_login_form").css('display', 'block');
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

