exports.getUserSession = function getUserSession(req) {
  var response = {};
	response.logged_in = req.session.logged_in;
  response.name = req.session.name;
  response.email = req.session.email;
 	return response;
}

/* 
 * update User login session
 */ 
exports.updateUserLoginSession = function updateUserLoginSession(req, params) {
	req.session.logged_in = params.logged_in;
	if(!params.logged_in){
		return;
	}
	req.session.name = params.name;
	req.session.email = params.email;
}
