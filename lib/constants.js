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
exports.HOME_VIEW = "/";
exports.RESET_PASSWORD_VIEW = "/reset_password_page";

exports.RESET_PASSWORD_PAGE = "Reset_Password_Page";
