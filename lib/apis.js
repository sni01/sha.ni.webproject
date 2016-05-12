var middlewareService = require('./middleware_service.js');

// Middleware Service functions
var startNewUserCreation = middlewareService.startNewUserCreation;
var startEmailVerification = middlewareService.startEmailVerification;
var userLogin = middlewareService.userLogin;
var logoutFinishes = middlewareService.logoutFinishes;
var renderHomePage = middlewareService.renderHomePage;
var renderAboutPage = middlewareService.renderAboutPage;
var renderRegisterPage = middlewareService.renderRegisterPage;

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
  		renderHomePage(req, res);
  });
   
  // About page
  app.get('/about', function(req, res) {
    renderAboutPage(req, res);
  });

  // Redirect to User Register Page
  app.get('/register', function(req, res) {
    console.log("register api is called!"); 
		renderRegisterPage(req, res);
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
		startEmailVerification(req, res);
	});
		
  app.post('/login', function(req, res){
		console.log("login api is called...");
		userLogin(req, res);
  });

  app.get('/logout', function(req, res){
  	console.log("logout get api is called...");
  	logoutFinishes(req, res);
  });
}
