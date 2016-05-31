// Requirement from other javascript files
var constants = require('./constants.js');
var response = require('./response.js');
var sessionHelper = require('./session.js');
var util = require('./util.js');
var dbService = require('./db_service.js');
var emailService = require('./email.js');
var randToken = require('rand-token');
var publicConstants = require('./../public/scripts/constants.js');

// Import functions
var getCreateUserResponse = response.getCreateUserResponse;
var getUserLoginResponse = response.getUserLoginResponse;
var getLogoutResponse = response.getLogoutResponse;
var getEmailVerificationResponse = response.getEmailVerificationResponse;
var getStartResetPasswordResponse = response.getStartResetPasswordResponse;
var getContinueResetPasswordResponse = response.getContinueResetPasswordResponse;
var getFinishResetPasswordResponse = response.getFinishResetPasswordResponse;

// Session functions
var getUserSession = sessionHelper.getUserSession;
var updateUserLoginSession = sessionHelper.updateUserLoginSession;
 
// Util functions
var isEmpty = util.isEmpty;

// Database Service functions
var getUserFromTable = dbService.getUserFromTable;
var deleteUserFromTable = dbService.deleteUserFromTable;
var putUserIntoTable = dbService.putUserIntoTable;
var updateUserInfo = dbService.updateUserInfo;

// Email funtions
var sendEmailVerification = emailService.sendEmailVerification;
var sendResetPasswordEmail = emailService.sendResetPasswordEmail;

/*
 * Create New User, return create status
 * 1. check duplicate account
 * 2. check verified status
 * 3. create new account
 */
exports.startNewUserCreation = function startNewUserCreation(req, res) {
	console.log(req.body.email);
	try {
	  var params = {
				table : constants.PERM_USER_TABLE,
				email : req.body.email
		};
		getUserFromTable(params, req, res, getUserCallBack);
	}
	catch (ex) {
		getCreateUserResponse(9, req, res);
	}
}

/*
 *  Check Duplicate and verifying account
 */
function getUserCallBack(result, req, res) {
	if (result == constants.DATABASE_ERROR) {
		getCreateUserResponse(9, req, res);
		return;
	}
	if (!isEmpty(result)) {
		// Duplicated Email, status == 1
		getCreateUserResponse(1, req, res);
		return;		
	}
	var params = {
			table : constants.TEMP_USER_TABLE,
			email : req.body.email
	};
	getUserFromTable(params, req, res, getTempUserCallBack);
}

function getTempUserCallBack(result, req, res) {
	if (result == constants.DATABASE_ERROR) {
		getCreateUserResponse(9, req, res);
		return;
	}	
	if (!isEmpty(result)) {
		// Email is being verified, status == 2
		getCreateUserResponse(2, req, res);
		return;
	}
	var req_data = req.body;
	var user = {};
  user.email = req_data.email;
  user.name = req_data.name;
 	user.password = req_data.password;
  if (req_data.gender.toLowerCase() == "male") user.gender = true;
  else user.gender = false;
  // Append email verification token
	user.token = randToken.suid(16);
	
	var put_params = {
      TableName:"Users_Temp",
      Item: user
  };
  console.log("Adding a new user...");
	putUserIntoTable(put_params, 'Users_Temp', req, res, userCreatedCallBack);
}

function userCreatedCallBack(result, req, res) {
	if(result == constants.DATABASE_ERROR) {
		getCreateUserResponse(9, req, res);
		return;
	}
	console.log("New User Created...");
  getCreateUserResponse(0, req, res);

	// Send Verification Email
	var item = result.Item;
	sendEmailVerification(item.email, item.token);	
}

/*
 /* Email Verification
 */
exports.startEmailVerification = function startEmailVerification(req, res) {
	try {
		deleteUserFromTable('Users_Temp', req, res, emailVerificationDeleteUserCallBack);
	}
	catch (ex) {
		getEmailVerificationResponse(9, req, res);
	}
}

/*
 * 0 : verification success
 * 1 : no user exists
 * 2 : token wrong
 * 3 : timestamp expired
 * 4 : user already verified
 */
function emailVerificationDeleteUserCallBack(data, req, res) {
	if(data == constants.DATABASE_ERROR) {
    getEmailVerificationResponse(9, req, res);
		return;
  }
	if(isEmpty(data)) {
		getEmailVerificationResponse(4, req, res);
		return;
	}
	var temp_user = data.Attributes;
	if(temp_user.token != req.query.token) {
		getEmailVerificationResponse(2, req, res);
		return;
	}
	// Insert into permanent User table and insert into permanent table
	var put_params = {
		TableName : constants.PERM_USER_TABLE,
		Item : temp_user
	};
	// TODO: re-structure delete to update here
	req.body.name = temp_user.name;
	req.body.email = temp_user.email;
	putUserIntoTable(put_params, 'Users', req, res, emailVerificationCreateUserCallBack);
}

function emailVerificationCreateUserCallBack(result, req, res) {
	if(result == constants.DATABASE_ERROR) {
		getEmailVerificationResponse(9, req, res);
		return;
	}
	
	var session_params = {
			name : req.body.name,
			email : req.body.email,
			logged_in : true
	};
	updateUserLoginSession(req, session_params);
	getEmailVerificationResponse(0, req, res);
}

 /*
  * User Login
  * 0 : login successfully
  * 1 : account doesn exist
  * 2 : account needed to be verified from email
  * 3 : password incorrect 
  * 9 : database error	
  */ 
exports.userLogin = function userLogin(req, res) {
	var params = {
			table : constants.PERM_USER_TABLE,
			email : req.body.email
	};
	getUserFromTable(params, req, res, userLoginCallBack);
}

// userLogin callbacks
function userLoginCallBack(result, req, res) {
	if (result == publicConstants.DATABASE_ERROR) {
		getUserLoginResponse({ status : contants.DATABASE_ERROR }, req, res);
		return;
	}
	if (isEmpty(result)) {
		getUserLoginResponse({ status : publicConstants.FAILURE1 }, req, res);
		return;
	}
	if (req.body.password != result.Item.password) {
		getUserLoginResponse({ status : publicConstants.FAILURE2 }, req, res);
		return;
	}
	// TODO : change logic of create new user

	// update session login status
	var session_params = {
			name : result.Item.name,
			email : result.Item.email,
			logged_in : true
	};
	updateUserLoginSession(req, session_params);
		
	var params = {
			status : publicConstants.SUCCESS,
			email : result.Item.email,
			name : result.Item.name
	};
	getUserLoginResponse(params, req, res);
	return;
}

// Logout CallBack
exports.logoutFinishes = function logoutFinishes(req, res) {
	// set name/email to null, TODO: fetch info from user table
	var session_params = {
			name : null,
			email : null,
			logged_in : false
	};
	updateUserLoginSession(req, session_params);
  getLogoutResponse(0, req, res);
}


// Render Home page
exports.renderHomePage = function renderHomePage(req, res) {
	res.render('Home', getUserSession(req));
}

// Render About page
exports.renderAboutPage = function renderAboutPage(req, res) {
	res.render('About', { lucky_topic : constants.getRandomTopic() });
}

// Render register page
exports.renderRegisterPage = function renderRegisterPage(req, res) {
	res.render('Register', getUserSession(req));
}


/* 
 * Find Back password
 * User Users_Temp table to store resetPassword token
 * 0 : success => send email
 * 1 : failure1, not logged in
 * 2 : failure2, not such accounti
 * 3 : failure3, not logged in
 * 9 : database error
 */
exports.startResetPassword = function startResetPassword(req, res){
	if(!getUserSession(req).logged_in){
		getStartResetPasswordResponse({ status : publicConstants.FAILURE3 }, req, res);
		return;
	}

	try {	
		var params = {
				table : constants.PERM_USER_TABLE,
				email : req.session.email
		};
		getUserFromTable(params, req, res, startResetPasswordCallBack);
	}
	catch (ex) {
		getStartResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);	
	}	
}

/*
 * Call Back for reset password
 * 0 : get User successfully
 * 1 : no such email account
 * 9 : database error
 * request is GET method
 *
 * reset_mode:
 * 0: normal
 * 1: send verification email
 * 2: send reset page
 */
function startResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR) {
		getStartResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
		return;
	}
	if(!result){
		getStartResetPasswordResponse({ status : publicConstants.FAILURE1 }, req, res);
		return;
	}
	if(result.Item.reset_mode == 1 || result.Item.reset_mode == 2){
		getStartResetPasswordResponse({ status : publicConstants.FAILURE2 }, req, res);
		return;
	}
	// log out before updating reset password mode
	var session_params = {
      logged_in : false
  };
  updateUserLoginSession(req, session_params);

	// generate token and update permanent user table
	var params = {
 	   	TableName	: constants.PERM_USER_TABLE,
  	  Key:{
					"email" : result.Item.email
    	},
    	UpdateExpression: "set reset_mode = :reset_mode_attr, reset_token = :reset_token_attr",
    	ExpressionAttributeValues:{
      	  ":reset_mode_attr"	:	1,
					":reset_token_attr"	: randToken.suid(16)
    	},
    	ReturnValues:"ALL_NEW"
	};
	updateUserInfo(params, req, res, putResetPasswordTokenCallBack);
}

function putResetPasswordTokenCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		getStartResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
		return;
	}
	// send email to client
	sendResetPasswordEmail(result.Attributes.email, result.Attributes.reset_token);
	
	// send response, no guarantee which one runs faster
	getStartResetPasswordResponse({ status : publicConstants.SUCCESS }, req, res);
}

/*
 * 0 : success
 * 1 : no such account exists
 * 2 : not in reset mode => reset_mode = false
 * 3 : this link has already used before => reset_ready = true
 * 4 : token doesn't match
 * 9 : database error
 * request is POST method
 */
exports.continueResetPassword = function continueResetPassword(req, res){
	try{
		var params = {
				table : constants.PERM_USER_TABLE,
				email : req.query.email
		};
		getUserFromTable(params, req, res, continueResetPasswordCallBack);
	}
	catch(ex){
		getContinueResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
	}	
}

function continueResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		getContinueResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
		return;
	}
	if(!result.Item){
		getContinueResetPasswordResponse({ status : publicConstants.FAILURE1 }, req, res);
		return;
	}
	if(result.Item.reset_mode == 0){
		getContinueResetPasswordResponse({ status : publicConstants.FAILURE2 }, req, res);
    return;
	}
	if(result.Item.reset_mode == 2){
		getContinueResetPasswordResponse({ status : publicConstants.FAILURE3 }, req, res);
    return;
	}
	if(result.Item.reset_token != req.query.token){
		getContinueResetPasswordResponse({ status : publicConstants.FAILURE4 }, req, res);
		return;
	}

	// update reset_ready = true, generate new token
	var params = {
      TableName : constants.PERM_USER_TABLE,
      Key:{
          'email' : result.Item.email
      },
      UpdateExpression: "set reset_mode = :reset_mode_attr, reset_token = :reset_token_attr",
      ExpressionAttributeValues:{
          ':reset_mode_attr'  : 2,
          ':reset_token_attr'  : randToken.suid(16)
      },
      ReturnValues:"ALL_NEW"
  };
	updateUserInfo(params, req, res, continueResetPasswordUpdateUserCallBack);
}

function continueResetPasswordUpdateUserCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		getContinueResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
		return;
  }
	// redirect to reset password page
	var params = {};
	params.token = result.Attributes.reset_token;
	params.email = result.Attributes.email;
	params.status = publicConstants.SUCCESS;
	getContinueResetPasswordResponse(params, req, res);
}

/*
 * Request is POST method
 * 0 : success
 * 1 : no such account
 * 2 : reset mode is false
 * 3 : reset ready is false
 * 4 : token doesn't match
 * 9 : database error
 */
exports.finishResetPassword = function finishResetPassword(req, res){
	try{
		var params = {
				table : constants.PERM_USER_TABLE,
				email : req.body.email
		};
		getUserFromTable(params, req, res, finishResetPasswordCallBack);
	}
	catch(ex){
		getFinishResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
	}
}

function finishResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
    getFinishResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
    return;
  }
	if(!result.Item){
		getFinishResetPasswordResponse({ status : publicConstants.FAILURE1 }, req, res);
		return;
	}
	if(result.Item.reset_mode == 0){
    getFinishResetPasswordResponse({ status : publicConstants.FAILURE2 }, req, res);
    return;
  }
	if(result.Item.reset_mode == 1){
		getFinishResetPasswordResponse({ status : publicConstants.FAILURE3 }, req, res);
		return;
	}
	if(result.Item.reset_token != req.body.token){
    getFinishResetPasswordResponse({ status : publicConstants.FAILURE4 }, req, res);
    return;
  }
	// update user info: reset_mode = false, reset_ready = false
	var params = {
      TableName : constants.PERM_USER_TABLE,
      Key:{
          'email' : result.Item.email
      },
      UpdateExpression: "set reset_mode = :reset_mode_attr, reset_token = :reset_token_attr, password = :pwd",
      ExpressionAttributeValues:{
          ':reset_mode_attr' : 0,
          ':reset_token_attr'  : null,
					':pwd' : req.body.password
      },
      ReturnValues:"ALL_NEW"
  };
	updateUserInfo(params, req, res, resetPasswordFinishUpdateUserCallBack);
}

function resetPasswordFinishUpdateUserCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
    getFinishResetPasswordResponse({ status : publicConstants.DATABASE_ERROR }, req, res);
    return;
  }
	// auto login
	var session_params = {
			name : result.Attributes.name,
			email : result.Attributes.email,
			logged_in : true
	};
	updateUserLoginSession(req, session_params);

	// response
	getFinishResetPasswordResponse({ status : publicConstants.SUCCESS	}, req, res);
}
