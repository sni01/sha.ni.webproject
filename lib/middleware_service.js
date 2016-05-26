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
var getResetPasswordResponse = response.getResetPasswordResponse;

// Session functions
var getUserSession = sessionHelper.getUserSession;
var updateUserSession = sessionHelper.updateUserSession;
 
// Util functions
var isEmpty = util.isEmpty;

// Database Service functions
var getUserFromTable = dbService.getUserFromTable;
var deleteUserFromTable = dbService.deleteUserFromTable;
var putUserIntoTable = dbService.putUserIntoTable;

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
	try {
		var req_data = req.body;
	  getUserFromTable('Users', req, res, getUserCallBack);
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
	getUserFromTable("Users_Temp", req, res, getTempUserCallBack);
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
  // Auto login
  // updateUserSession(req, true, true);

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
		TableName : 'Users',
		Item : temp_user
	};
	putUserIntoTable(put_params, 'Users', req, res, emailVerificationCreateUserCallBack);
}

function emailVerificationCreateUserCallBack(data, req, res) {
	if(data == constants.DATABASE_ERROR) {
		getEmailVerificationResponse(9, req, res);
		return;
	}
	
	updateUserSession(req, true, false);
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
	getUserFromTable("Users", req, res, userLoginCallBack);
}

// userLogin callbacks
function userLoginCallBack(result, req, res) {
	if (result == constants.DATABASE_ERROR) {
		getUserLoginResponse(9, req, res);
		return;
	}
	if (!isEmpty(result)) {
		// Provide info response needed
		req.body.name = result.Item.email;
		if (req.body.password == result.Item.password) {
			updateUserSession(req, true, false);
			
			getUserLoginResponse(0, req, res);
			return;
		}
		getUserLoginResponse(3, req, res);
		return;
	}
	getUserLoginResponse(1, req, res);
}

// Logout CallBack
exports.logoutFinishes = function logoutFinishes(req, res) {
	updateUserSession(req, false, false);
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
 * 2 : failure2, not such account
 * 9 : database error
 */
exports.startResetPassword = function startResetPassword(req, res){
	if(!getUserSession(req).logged_in){
		getStart
	}
	try {
		getUserFromTable(constants.PERM_USER_TABLE, req, res, startResetPasswordCallBack);
	}
	catch (ex) {
		getResponse();	
	}	
}

/*
 * Call Back for reset password
 * 0 : get User successfully
 * 1 : no such email account
 * 9 : database error
 * request is GET method
 */
function startResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR) {
		getStartResetPasswordResponse(publicConstants.DATABASE_ERROR_STATUS, constants.HOME_VIEW, req, res);
		return;
	}
	if(!result){
		getStartResetPasswordResponse( publicConstants.FAILURE1_STATUS, constants.HOME_VIEW, req, res);
		return;
	}
	// generate token and update permanent user table
	var params = {
 	   	TableName	: constants.PERM_USER_TABLE,
  	  Key:{
					'email' : req.query.email
    	},
    	UpdateExpression: "set info.reset_mode = :reset_mode, info.reset_ready=:reset_ready, info.reset_token=:reset_token",
    	ExpressionAttributeValues:{
      	  ':reset_mode'	:	true,
					':reset_ready'	:	false,
					':reset_token'	: randToken.suid(16)
    	},
    	ReturnValues:"UPDATED_NEW"
	};
	updateUserInfo(params, req, res, putResetPasswordTokenCallBack);	
}

function putResetPasswordTokenCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		getStartResetPasswordResponse(publicConstants.DATABASE_ERROR_STATUS, constants.HOME_VIEW, req, res);
		return;
	}
	// send email to client
	sendResetPasswordEmail(result.email, result.token);
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
		getUserFromTable(constants.PERM_USER_TABLE, req, res, continueResetPasswordCallBack);
	}
	catch(ex){
		getContinueResetPasswordResponse(publicConstants.DATABASE_ERROR_STATUS, constants.HOME_VIEW, req, res);
	}	
}

function continueResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		params = { 'status' : publicConstants.DATABASE_ERROR };
    res.render(constants.RESET_PASSWORD_PAGE, params);
		return;
	}
	if(!result.Item){
		params = { 'status' : publicConstants.FAILURE1_STATUS };
    res.render(constants.RESET_PASSWORD_PAGE, params);
		return;
	}
	if(!result.Item.reset_mode){
		params = { 'status' : publicConstants.FAILURE2_STATUS };
    res.render(constants.RESET_PASSWORD_PAGE, params);
    return;
	}
	if(result.Item.reset_ready){
		params = { 'status' : publicConstants.FAILURE3_STATUS };
    res.render(constants.RESET_PASSWORD_PAGE, params);
    return;
	}
	if(result.Item.token != req.body.token){
    params = { 'status' : publicConstants.FAILURE4_STATUS };
    res.render(constants.RESET_PASSWORD_PAGE, params);
		return;
	}

	// update reset_ready = true, generate new token
	var params = {
      TableName : constants.PERM_USER_TABLE,
      Key:{
          'email' : req.email
      },
      UpdateExpression: "set info.reset_ready=:reset_ready, info.reset_token=:reset_token",
      ExpressionAttributeValues:{
          ':reset_ready'  : true,
          ':reset_token'  : randToken.suid(16)
      },
      ReturnValues:"UPDATED_NEW"
  };
	updateUserInfo(params, req, res, continueResetPasswordUpdateUserCallBack);
}

function continueResetPasswordUpdateUserCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
		params = { 'status' : 9 };
		res.render(constants.RESET_PASSWORD_PAGE, params);
    return;
  }
	// redirect to reset password page
	var params = {};
	params.token = result.token;
	params.email = result.email;
	params.status = 0;
	res.render(constants.RESET_PASSWORD_PAGE, params);
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
		getUserFromTable(constants.PERM_USER_TABLE, req, res, finishResetPasswordCallBack);
	}
	catch(ex){
		getFinishResetPasswordResponse(publicConstants.DATABASE_ERROR, constants.RESET_PASSWORD_VIEW, req, res);
	}
}

function finishResetPasswordCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
    getFinishResetPasswordResponse(publicConstants.DATABASE_ERROR_STATUS, constants.HOME_VIEW, req, res);
    return;
  }
	if(!result.Item){
		getFinishResetPasswordResponse(publicConstants.FAILURE1_STATUS, constants.RESET_PASSWORD_VIEW, req, res);
		return;
	}
	if(!result.Item.reset_mode){
    getFinishResetPasswordResponse(publicConstants.FAILURE2_STATUS, constants.RESET_PASSWORD_VIEW, req, res);
    return;
  }
	if(!result.Item.reset_ready){
    getFinishResetPasswordResponse(publicConstants.FAILURE3_STATUS, constants.RESET_PASSWORD_VIEW, req, res);
    return;
  }
	if(result.Item.reset_token != req.body.token){
    getFinishResetPasswordResponse(publicConstants.FAILURE4_STATUS, constants.RESET_PASSWORD_VIEW, req, res);
    return;
  }
	// update user info: reset_mode = false, reset_ready = false
	var params = {
      TableName : constants.PERM_USER_TABLE,
      Key:{
          'email' : req.body.email
      },
      UpdateExpression: "set info.reset_mode = :reset_mode, info.reset_ready=:reset_ready, info.reset_token=:reset_token",
      ExpressionAttributeValues:{
          ':reset_mode' : false,
          ':reset_ready'  : false,
          ':reset_token'  : randToken.suid(16)
      },
      ReturnValues:"UPDATED_NEW"
  };
	updateUserInfo(params, req, res, resetPasswordFinishUpdateUserCallBack);	
}

function resetPasswordFinishUpdateUserCallBack(result, req, res){
	if(result == constants.DATABASE_ERROR){
    getFinishResetPasswordResponse(publicConstants.DATABASE_ERROR_STATUS, constants.HOME_VIEW, req, res);
    return;
  }
	getFinishResetPasswordResponse(publicConstants.SUCCESS_STATUS, constants.HOME_VIEW, req, res);	
}
