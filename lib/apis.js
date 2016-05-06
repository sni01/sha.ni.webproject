// Customized Apis

// database configurations
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  //endpoint: "http://ec2-54-209-65-197.compute-1.amazonaws.com:8000"
	endpoint: "dynamodb.us-east-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

// dynamoDB CRUD operations
function putItem(param){
	docClient.put(params, function(err, data){
		if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
	});
}

function getItem(param){
	docClient.get(params, function(err, data){
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
	});
}


// called by /user post api
function create_user(req, res) {
	try {
		console.log(req);
		var user = req.body;
  	var user_object = {
      	"email": user.email,
      	"name": user.name,
      	"register_time": user.register_time,
      	"password": user.password
  	}
  	if (user_object.gender == 'Male' || user_object.gender == 'male') user_object.gender = true;
  	else user_object.gender = false;
 		var params = {
      	TableName:"Users",
      	Item: user_object,
      	ReturnValues : "ALL_NEW"
  	};
		console.log("Adding a new user...");
  	var createdUser = putItem(params);
  	if (createdUser) createUserCallBack(createdUser, req, res);
  	else createUserErrorHandler(err, req, res);
	}
	catch (ex) {
		databaseErrorResponse(ex, req, res);
	}
}

function getUserInfo(req, res) {
	try {
    var data = req.body;
    var params = {
        'email' : data.email,
        'password' : data.password
    }
    var user_object = getItem(params);
		if (user_object) getUserCallBack(user_object, req, res);		
 		else userNotExistsCallBack({ status : "user not exits" }, req, res);
	}
  catch (ex) {
    databaseErrorResponse(ex, req, res);
  }
}

 /*
  * Create New User CallBacks
  * If success, then update session
  * Else return duplicated user error
  */
function createUserCallBack(data, req, res) {
  console.log("New User Created ", data);
  // update user session
  var user_session_object = {
      user_logged_in : true,
      user_name : data.name,
      user_gender : data.gender
  };
  updateUserSession(user_session_object, true);

  // Response
  var response_object = {
      request : "create_new_user",
      status : 0, // "success"
      user_name : data.name,
      user_email : data.email
  };
  responseWithJsonObject(res, response_object, '/', req.xhr);
}

function createUserErrorHandler(error, req, res) {
  var reponse_object = {
      request : "create_new_user",
      status : 1,
  };
  responseWithJsonObject(res, response_object, '/', req.xhr);
}

 /*
  * Check password is correct, if not return password incorrect error 
  * User exists, create session with req.session.login = true.
  */ 
function getUserCallBack(data, req, res) {
  response_obejct = { request : "login" };
  user_info = req.body;
  if (data.password != user_info.password) {
    response_object.status = 1;
    response_object.email = user_info.email;
    response_object.name = user_info.name;
    
    // Active user in session
    updateUserSession(req.body, true);
  }
  else response_object.status = 0;
  
  responseWithJsonObject(res, password_correct_object, '/', req.xhr);
}

 /*
  * If user does not exit, return with errors
  */
function userNotExistsCallBack(error, res) {
  response_object = {
      request : "login",
      status : 2 // user not exists
  };
  responseWithJsonObject(res, response_object, '/', req.xhr); 
}

// User session function
function updateUserSession(user_info, active) {
  var user_session_object = req.session.user;
  if (active) {
    if (user_session_object) user_session_object.user_logged_in = true;
    else {
      var user_session_object = {
          user_logged_in : true,
          user_name : user_info.name,
          user_gender : user_info.gender
      }
      req.session.user = user_session_object;
    }
  }
  else {
    if (user_session_object) user_session_object.user_logged_in = false; 
  } 
}

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

function databaseErrorResponse(error, req, res) {
  var response_object = {
      status : "failed",
      error : error
  };
  responseWithJsonObject(res, response_object, '/database-error', req.xhr);
}

var constants = require('./constants.js');

module.exports = function(middleware_params){
  // Parse out middleware params
  var app = middleware_params.app_param;
  var express = middleware_params.express_param;
  var bodyParser = middleware_params.bodyParser_param;
  var cookieParser = middleware_params.cookieParser_param;
  var session = middleware_params.session_param;

  // Allows apis use bodyParser, post and get methods
  app.use(bodyParser.urlencoded({ extended : true }));
  app.use(bodyParser.json());

  // Configuration for Cookie-based sessions (we may move to Redis-Based session later if we could afford AWS)
  app.use(cookieParser());
  app.use(session({ secret : "normalSecretKey" }));

  // Home page
  app.get('/', function (req, res) {
    var user_session_object = req.session.user;
    var response_status_object = {};
    if(user_session_object && user_session_object.user_logged_in){
    	response_status_object.user_logged_in = true;
    	response_status_object.user_name = user_session_object.user_name;
    	response_status_object.user_email = user_session_object.user_email;
    }
  	res.render('Home', response_status_object);
  });
   
  // About page
  app.get('/about', function(req, res) {
    res.render('About', { lucky_topic : constants.getRandomTopic() });
  });

  // Redirect to User Register Page
  app.get('/register', function(req, res) {
    console.log("register api is called!");
    res.render('Register');
  });

  // User registeration
  app.post('/user', function(req, res){
	 // read from query parameters and insert into database
	 console.log("receive user registeration data from client");
	 create_user(req, res);
  });

   /* 
    * Get User info
    * If user exists, call loginCallback
    * Else call NoUserHandler
    */
  app.post('/login', function(req, res){
	 getUserInfo(req, res);
  });

  app.get('/logout', function(req, res){
  	console.log("logout get api is called!");
  	response_object = {};
  	user_session_object = req.session.user;
  	updateUserSession(null, false);
  	if (!user_session_object || !user_session_object.user_logged_in) response_object.logged_out_status = 0;
  	else response_object.logged_out_status = 1;
  	responseWithJsonObject(res, response_object, '/logout-success', req.xhr);
  });
}
