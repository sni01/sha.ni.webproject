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
function putItem(params, successHandler, req, res){
	docClient.put(params, function(err, data){
		if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			databaseErrorResponse(err, req, res);
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			successHandler(data, req, res);
    }
	});
}

function getItem(params, successHandler, req, res){
	docClient.get(params, function(err, data){
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			databaseErrorResponse(err, req, res);
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			successHandler(data, req, res);
    }
	});
}


// called by /user post api
function create_user(req, res) {
	try {
		// check no same email exists
	  getUser(req, res, checkDuplicateCallBack);	
	}
	catch (ex) {
		databaseErrorResponse(ex, req, res);
	}
}

function getUser(req, res, callback) {
	try {
    var data = req.body;
    var params = {
				TableName : "Users",
				Key : {
        		'email' : data.email
				}
    }
    getItem(params, callback, req, res);
	}
  catch (ex) {
    databaseErrorResponse(ex, req, res);
  }
}

/*
 * Check if email has already been used for registration.
 */
function checkDuplicateCallBack(data, req, res) {
	var user_db = data.Item;
	if (!user_db.objects || user_db.objects.length == 0) {
		responseWithJsonObject(res, { 
				request : "create_new_user",	
				status : 2 // duplicate email
		}, "/register", req.xhr);
	}
	else {
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
        Item: user_object
    };
    console.log("Adding a new user...");
		putItem(params, createUserCallBack, req, res);
	}
}

 /*
  * Create New User CallBacks
  * If success, then update session
  * Else return duplicated user error
  */
function createUserCallBack(data, req, res) {
  console.log("New User Created...");
  // update user session
  updateUserSession(req, true, true);

	var user_info = req.body;
  // Response
  var response_object = {
      request : "create_new_user",
      status : 0, // "success"
      name : user_info.name,
      email : user_info.email
  };
  responseWithJsonObject(res, response_object, '/', req.xhr);
}

 /*
  * Check password is correct, if not return password incorrect error 
  * User exists, create session with req.session.login = true.
  */ 
function userLoginCallBack(data, req, res) {
	var user_db = data.Item;
  var response_object = { request : "login" };
  var user_info = req.body;
	if(!user_db) {
		// user account does not exist
		user_db.status = 2;
	}
  else if (user_db.password == user_info.password) {
    response_object.status = 0;
    // Active user in session
    updateUserSession(req, true, false);
		req.session.name = user_db.name;
		req.session.email = user_db.email;
  }
  else response_object.status = 1;
  response_object.email = user_db.email;
	response_object.name = user_db.name;
  responseWithJsonObject(res, response_object, '/', req.xhr);
}

// User session function
function updateUserSession(req, active, isFromReq) {
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
		var user_session_object = req.session;
    var response_status_object = {};
    if(user_session_object.logged_in){
			response_status_object.logged_in = user_session_object.logged_in;    	
			response_status_object.name = user_session_object.name;
    	response_status_object.email = user_session_object.email;
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
    * TODO: construct logout-finished page
    */
  app.post('/login', function(req, res){
		getUser(req, res, userLoginCallBack);
  });

  app.get('/logout', function(req, res){
  	console.log("logout get api is called!");
  	response_object = { 
				request : "logout",
				status : 0
		};
  	updateUserSession(req, false, false);
  	responseWithJsonObject(res, response_object, '/logout-finishes', req.xhr);
  });
}
