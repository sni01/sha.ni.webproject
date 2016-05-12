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

// Requirement from other javascript files
var constants = require('./constants.js');
var response = require('./response.js');
var sessionHelper = require('./session.js');
var util = require('./util.js');

// Import functions
var getCreateUserResponse = response.getCreateUserResponse;
var getUserLoginResponse = response.getUserLoginResponse;
var getLogoutResponse = response.getLogoutResponse;

var getUserSession = sessionHelper.getUserSession;
var updateUserSession = sessionHelper.updateUserSession;
 
var isEmpty = util.isEmpty;

// dynamoDB CRUD operations
function putItem(params, req, res, callback){
	docClient.put(params, function(err, data){
		if (err) {
      console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
			callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
			callback(data, req, res);
    }
	});
}

function getItem(params, req, res, callback){
	docClient.get(params, function(err, data){
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    	callback(data, req, res);
		}
	});
}

/*
 * Async Get User
 */
function getUserFromTable(tableName, req, res, callback) {
		var params = {
				TableName : tableName,
				Key : {
						'email' : req.body.email
				}
		};
		getItem(params, req, res, callback);
}

/*
 * Create New User, return create status
 * 1. check duplicate account
 * 2. check verified status
 * 3. create new account
 */
function startNewUserCreation(req, res) {
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
  var put_params = {
      TableName:"Users",
      Item: user
  };
  console.log("Adding a new user...");
	putItem(put_params, req, res, userCreatedCallBack);
}

function userCreatedCallBack(result, req, res) {
	if(result == constants.DATABASE_ERROR) {
		getCreateUserResponse(9, req, res);
		return;
	}
	console.log("New User Created...");
  // Auto login
   updateUserSession(req, true, true);

   getCreateUserResponse(0, req, res);
}

/*
 * Email Verification call back
 */
function EmailVerificationCallBack(data, req, res) {
	var user_db = data.Item;
	console.log(user_db);
	if (user_db && notExpired(user_db.timestamp) && user_db.token == req.body.token) {
		// user exists in the temp user table and has not expired and
		// toke is equal to the record, then email verified
		// delete from temp user table and insert into permanent user table
		
	}
	else {
		// Verification failed, reponse with error

	}

}

 /*
  * User Login
  * 0 : login successfully
  * 1 : account doesn exist
  * 2 : account needed to be verified from email
  * 3 : password incorrect 
	* 9 : database error	
  */ 
function userLogin(req, res) {
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
			// update session
			updateUserSession(req, true, false);
			
			getUserLoginResponse(0, req, res);
			return;
		}
		getUserLoginResponse(3, req, res);
		return;
	}
	getUserLoginResponse(1, req, res);
}

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
		res.render('Home', getUserSession(req));
  });
   
  // About page
  app.get('/about', function(req, res) {
    res.render('About', { lucky_topic : constants.getRandomTopic() });
  });

  // Redirect to User Register Page
  app.get('/register', function(req, res) {
    console.log("register api is called!");
    
		res.render('Register', getUserSession(req));
  });

  // User registeration
  app.post('/user', function(req, res){
		// read from query parameters and insert into database
		console.log("receive user registeration data from client");
		startNewUserCreation(req, res);
  });

	/*
   * Verfication of email after create new user in the database
   * Call by the links in the verification email	
 	 */
	app.post('/email_verfication', function(req, res){
		console.log("email verification api is called");
		// get token from post data
		var params = req.body;
		getItem(params, emailVerificationCallBack, req, res);
	});
		
  app.post('/login', function(req, res){
		console.log("login api is called...");
		userLogin(req, res);
  });

  app.get('/logout', function(req, res){
  	console.log("logout get api is called...");
  	updateUserSession(req, false, false);
  	getLogoutResponse(0, req, res);
  });
}
