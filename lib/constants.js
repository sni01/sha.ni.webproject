// Constants variables

const topics = ['work', 'life', 'startups', 'travel', 'activities'];

const DATABASE_ERROR = "database operation error!";

exports.getRandomTopic = function(){
	var index = Math.floor(Math.random() * topics.length);
	return topics[index];
};

exports.DATABASE_ERROR = DATABASE_ERROR;

// table names
exports.PermUserTable = "Users";
exports.TempUserTable = "Users_Temp";
