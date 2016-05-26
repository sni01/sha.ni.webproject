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


exports.getUserLoginResponse = function getUserLoginResponse(login_status, req, res) {
  var req_params = req.body;
  var response_object = { request : 'login' };
  response_object.status = login_status;
  response_object.email = req_params.email;
  response_object.name = req_params.name;
  switch (login_status) {
    case 0 : response_object.info = "login successfully"; break;
    case 1 : response_object.info = "accont doesn't exist"; break;
    case 2 : response_object.info = "account needed to be verified"; break;
    case 3 : response_object.info = "password incorrect"; break;
    case 9 : response_object.info = constants.DATABASE_ERROR; break;
  }
  responseWithJsonObject(res, response_object, '/', req.xhr);
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

exports.getResponse = function getResponse(request_name, status, defaultView, req, res){
	response_object = { request : request_name };
	response_object.status = status;
	responseWithJsonObject(res, response_object, defaultView, req.xhr);
}

exports.getStartResetPasswordResponse = function getStartResetPasswordResponse(status, default_view){
	getResponse(publicConstants.START_RESET_PASSWORD_REQUEST_NAME, status, default_view, req, res);
}

exports.getContinueResetPasswordResponse = function getContinueResetPasswordResponse(status, default_view){
	getResponse(publicConstants.CONTINUE_RESET_PASSWORD_REQUEST_NAME, status, default_view, req, res);
}

exports.getFinishResetPasswordResponse = function getFinishResetPasswordResponse(status, default_view){
	getResponse(publicConstants.FINISH_RESET_PASSWORD_REQUEST_NAME, status, default_view, req, res);
}
