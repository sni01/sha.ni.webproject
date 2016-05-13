// Database Configureation
var AWS = require("aws-sdk");
var constants = require("./constants.js");

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();


exports.putItem = function putItem(params, req, res, callback){
  docClient.put(params, function(err, data){
    if (err) {
      console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
      callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
     	// return paramters
			callback(params, req, res);
    }
  });
}

exports.getItem = function getItem(params, req, res, callback) {
  docClient.get(params, function(err, data){
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      callback(data, req, res);
    }
  });
}

exports.deleteItem = function deleteItem(params, req, res, callback) {
	docClient.delete(params, function(err, data) {
  	if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(constants.DATABASE_ERROR, null, 2));
			callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
			callback(data, req, res);
    }
	});
}
