var nodemailer = require('nodemailer');
var nodemailerhbs = require('nodemailer-express-handlebars');
var constants = require('./constants.js');
var nodemailerSES = require('nodemailer-ses-transport');

var options = {
    viewEngine: {
        layoutsDir: './views/layouts/',
        defaultLayout : 'email', // same template for now
        partialsDir : './views/email/'
    },
    viewPath: './views/email/'
};

exports.sendEmailVerification = function sendEmailVerification(email, token) {
	var params = {
			'email' : email,
			'token' : token
	};
	sendTemplateEmail('New User Verification', 'newUserVerificationEmail', params);
}

exports.sendResetPasswordEmail = function sendResetPasswordEmail(email, token) {
	var params = {
		'email' : email,
		'token' : token,
		'reset_password_api' : constants.RESET_PASSWORD_EMAIL_API,
		'server_address' : constants.SERVER_ADDRESS
	};
	sendTemplateEmail('Reset Password', 'resetPasswordVerificationEmail', params);
}

// Deprecated
function gmailConfigurations() {
	return { service : 'gmail',
					 auth: {
										user : 'likenisha2015@gmail.com',
									  pass : 'biology0634'
				 				 }
				 };
}

function sendTemplateEmail(subject, templateName, params){
  var emailService = nodemailer.createTransport(gmailConfigurations());
  emailService.use('compile', nodemailerhbs(options));
  sendEmail(emailService, subject, templateName, params);
}

function sendEmail(service, email_subject, email_template, params) {
	var email = {
			from : "NoReply@BayArea.com",
			to : params.email,
			subject : email_subject,
			template : email_template,
			context : params
	};
	service.sendMail(email, function(err){
			if (!err) console.log("Email sent succeeded");
			else console.log("Email sent error", err);
	});
}
