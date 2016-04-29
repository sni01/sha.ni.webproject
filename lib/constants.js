// Constants variables

const topics = ['work', 'life', 'startups', 'travel', 'activities'];

exports.getRandomTopic = function(){
	var index = Math.floor(Math.random() * topics.length);
	return topics[index];
};
