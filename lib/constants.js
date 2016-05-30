// Constants variables

const topics = ['work', 'life', 'startups', 'travel', 'activities'];

const DATABASE_ERROR = "database operation error!";

exports.getRandomTopic = function(){
	var index = Math.floor(Math.random() * topics.length);
	return topics[index];
};

exports.DATABASE_ERROR = DATABASE_ERROR;

// table names
exports.PERM_USER_TABLE = "Users";
exports.TEMP_USER_TABLE = "Users_Temp";

// default views url
exports.SERVER_ADDRESS = "http://ec2-onlinejudement-keypair.pem ec2-user@ec2-54-209-65-197.compute-1.amazonaws.com";
exports.RESET_PASSWORD_EMAIL_API = "/reset_password_email_verification";
exports.RESET_PASSWORD_PAGE = "Reset_Password_Page";
