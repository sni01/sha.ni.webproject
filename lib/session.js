exports.getUserSession = function getUserSession(req) {
  var user_session_object = req.session;
  var response_status_object = {};
  if(user_session_object.logged_in){
    response_status_object.logged_in = user_session_object.logged_in;
    response_status_object.name = user_session_object.name;
    response_status_object.email = user_session_object.email;
  }
  return response_status_object;
}

/* 
 * If params != null, use params to update session
 * Otherwise use req parameters to update
 */ 
exports.updateUserSession = function updateUserSession(req, active, isFromReq) {
  var user_info = req.body;
  if (active) {
    req.session.logged_in = true;
    if (isFromReq) {
      req.session.email = user_info.email;
      req.session.name = user_info.name;
    }  
  }
  else req.session.logged_in = false;
}
