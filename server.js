'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
require('./lib/apis.js')(app);

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
