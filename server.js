'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var middleware_params = {
	app_param : app,
	express_param : express,
	bodyParser_param : bodyParser,
	cookieParser_param : cookieParser,
	session_param : session
};

require('./lib/apis.js')(middleware_params);

// Create view engine
var handlebars = require('express3-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Public content
app.use(express.static(__dirname+'/public'));

// export Apis js code
require(__dirname+'/lib/apis.js');

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
