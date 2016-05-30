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
      console.error("Unable to put item. Error: ", err);
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
      console.error("Unable to read item. Error: ", err);
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
      console.error("Unable to delete item. Error: ", err);
			callback(constants.DATABASE_ERROR, req, res);
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
			callback(data, req, res);
    }
	});
}

exports.updateItem = function updateItem(params, req, res, callback) {
	docClient.update(params, function(err, data){
		if(err){
			console.error("Unable to update item. Error: ", err);
			callback(constants.DATABASE_ERROR, req, res);
		}	else {
			console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
			callback(data, req, res);
		}
	});
}
