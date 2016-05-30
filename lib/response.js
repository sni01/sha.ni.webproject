// Dependency
var constants = require('./constants.js');
var publicConstants = require('./../public/scripts/constants.js');

// Response with json object
function responseWithJsonObject(res, response_object, defaultViewUrl, isXHR) {
  if (isXHR) {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(response_object));
  }
  else {
    res.redirect(303, defaultViewUrl);
  }
}

/*
 * Get create user operation status
 *  0: success
 *  1: duplicate user
 * 	2: waiting for verificatioin
 *  9: database error
 */
exports.getCreateUserResponse = function getCreateUserResponse(create_user_status, req, res){
	var user_info = req.body;
 	var response_object = {
		request : "create_new_user",
    status : create_user_status, // "success
    name : user_info.name,
    email : user_info.email
 	};
  switch (create_user_status) {
		case 0 : response_object.info = "create user successfully"; break;
    case 1 : response_object.info = "duplicate user exists"; break;
    case 2 : response_object.info = "email waits for verification"; break;
    case 9 : response_object.info = constants.DATABASE_ERROR;
    default : response_object.info = "no valid status info"; break;
  }
  responseWithJsonObject(res, response_object, '/', req.xhr);
}


exports.getUserLoginResponse = function getUserLoginResponse(params, req, res) {
  switch (params.login_status) {
    case 0 : params.info = "login successfully"; break;
    case 1 : params.info = "accont doesn't exist"; break;
    case 2 : params.info = "account needed to be verified"; break;
    case 3 : params.info = "password incorrect"; break;
    case 9 : params.info = constants.DATABASE_ERROR; break;
  }
  responseWithJsonObject(res, params, '/', req.xhr);
}

exports.getLogoutResponse = function getLogoutResponse(logout_status, req, res) {
	response_object = { request : "logout" };
	response_object.status = logout_status;
	responseWithJsonObject(res, response_object, '/logout-finishes', req.xhr);
}

exports.getEmailVerificationResponse = function getEmailVerificationResponse(status, req, res) {
	response_object = { request : "email_verification" };
  response_object.status = status;
  responseWithJsonObject(res, response_object, '/', req.xhr);
}

exports.getStartResetPasswordResponse = function getStartResetPasswordResponse(params, req, res){
	switch(params.status){
		case publicConstants.FAILURE1 : params.info="The account doesn't exist"; break;
		case publicConstants.FAILURE2 : params.info="The account is now reseting."; break;
		case publicConstants.FAILURE3 : params.info="account is not logged in"; break;
		case publicConstants.DATABASE_ERROR : params.info="database error"; break;
		case publicConstants.SUCCESS : params.info="we send you an email to continue reseting password."; break;
		default : params.info="unexpected error"; break;
	}
	responseWithJsonObject(res, params, '/', req.xhr);
}

exports.getContinueResetPasswordResponse = function getContinueResetPasswordResponse(params, req, res){
	switch(params.status){
		case publicConstants.FAILURE1 : params.info = "no account exists"; break;
		case publicConstants.FAILURE2 : params.info = "user is not in reset password mode"; break;
		case publicConstants.FAILURE3 : params.info = "this verified email has been expired"; break;
		case publicConstants.FAILURE4 : params.info = "email verified failed, incorrect token"; break;
		case publicConstants.DATABASE_ERROR : params.info = "database error"; break;
		case publicConstants.SUCCESS : params.info = "reset password email verification succeeded."; break;
		default : params.info = "unexpected response"; break;
	}
	// Render reset password page or Reset password error page
	res.render('Reset_Password_Page', params);
}

exports.getFinishResetPasswordResponse = function getFinishResetPasswordResponse(params, req, res){
	switch(params.status){
		case publicConstants.DATABASE_ERROR : params.info = "reset password database error"; break;
		case publicConstants.FAILURE1 : params.info="no account exists"; break;
		case publicConstants.FAILURE2 : params.info="not in reset password mode"; break;
		case publicConstants.FAILURE3 : params.info="you need to verify through email."; break;
		case publicConstants.FAILURE4 : params.info="token doesn't match with the record"; break;
		case publicConstants.SUCCESS : params.info="password successfully reseted"; break;
		default: params.info="unexpected error"; break;
	}
	responseWithJsonObject(res, params, '/', req.xhr);
}
