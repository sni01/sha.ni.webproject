// Requirement from other javascript files
var constants = require('./constants.js');
var response = require('./response.js');
var sessionHelper = require('./session.js');
var util = require('./util.js');
var dbService = require('./db_service.js');
var emailService = require('./email.js');
var randToken = require('rand-token');

// Import functions
var getCreateUserResponse = response.getCreateUserResponse;
var getUserLoginResponse = response.getUserLoginResponse;
var getLogoutResponse = response.getLogoutResponse;
var getEmailVerificationResponse = response.getEmailVerificationResponse;

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
 * Email Verification
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
 */
function emailVerificationDeleteUserCallBack(data, req, res) {
	if(data == constants.DATABASE_ERROR) {
    getEmailVerificationResponse(9, req, res);
		return;
  }
	if(!data) {
		getEmailVerificationResponse(1, req, res);
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
