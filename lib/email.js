var nodemailer = require('nodemailer');
var nodemailerhbs = require('nodemailer-express-handlebars');
var options = {
    viewEngine: {
        layoutsDir: './views/layouts/',
        defaultLayout : 'email', // same template for now
        partialsDir : './views/email/'
    },
    viewPath: './views/email/'
};

exports.sendEmailVerification = function sendEmailVerification(email, token) {
	var emailService = getEmailService(null);
	var params = {
			'email' : email,
			'token' : token
	};
	// compile template engine
	emailService.use('compile', nodemailerhbs(options));
	sendEmail(emailService, 'newUserVerificationEmail', params);
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

function getEmailService(configurations) {
	if (!configurations) return nodemailer.createTransport();
	return nodemailer.createTransport(configurations);
}

function sendEmail(service, email_template, params) {
	var email = {
			from : "NoReply@BayArea.com",
			to : params.email,
			subject : "New User Verification",
			template : email_template,
			context : {
					'token' : params.token,
					'email' : params.email
			}
	};
	service.sendMail(email, function(err){
			if (!err) console.log("Email sent succeeded");
			else console.log("Email sent error", err);
	});
}
