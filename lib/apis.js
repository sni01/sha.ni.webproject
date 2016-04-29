// Customized Apis

var constants = require('./constants.js');

module.exports = function(app){
   // home page
   app.get('/', function (req, res) {
	res.render('Home');
   });
   
   // about page
   app.get('/about', function(req, res) {
	res.render('About', { lucky_topic : constants.getRandomTopic() });
   });
}
