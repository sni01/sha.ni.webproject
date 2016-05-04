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

// called by /user post api
function create_user(user) {
	var user_object = {
		"email": user.email,
                "name": user.name,
       	        "register_time": user.register_time,
                "password": user.password
        }
	console.log(user_object.gender);
	if (user_object.gender == 'Male' || user_object.gender == 'male') user_object.gender = true;
	else user_object.gender = false;
	
	var params = {
                TableName:"Users",
                Item: user_object
        };

	// insert into User table
	console.log("Adding a new item...");
	docClient.put(params, function(err, data) {
    		if (err) {
        		console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    		} else {
			console.log("Create new user account successfully.");
    		}
	});
}

var constants = require('./constants.js');

module.exports = function(middleware_params){
   // parse out middleware params
   app = middleware_params.app_param;
   express = middleware_params.express_param;
   bodyParser = middleware_params.bodyParser_param;

   // allows apis use bodyParser, post and get methods
   app.use(bodyParser.urlencoded({ extended : true }));
   app.use(bodyParser.json());
 
   // home page
   app.get('/', function (req, res) {
	res.render('Home');
   });
   
   // about page
   app.get('/about', function(req, res) {
	res.render('About', { lucky_topic : constants.getRandomTopic() });
   });

   // user registeration
   app.post('/user', function(req, res){
	// read from query parameters and insert into database
	console.log("receive user registeration data from client");
	try{
		console.log(req.body);
		// reconstruct user object
		data = req.body;
		user_object = {
			"name" : data.name,
			"gender" : data.gender,
			"email" : data.email,
			"register_time" : data.time,
			"password" : data.password
		};
		create_user(user_object);
		response_object = { 'status' : "success" };	
		return req.xhr ? 
			res.json(response_object) :
			res.redirect(303, '/thank-you');
	}
	catch(ex){
		console.log(ex);
		return req.xhr ?
			res.json({ error : 'Database error!' }) :
			res.redirect(303, '/database-error');   
	}	
   });

   app.post('/login', function(req, res){
	
   });

   app.get('/logout', function(req, res){
	
   });
}
