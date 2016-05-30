// Import Database api
var database = require('./database.js');

// Database functions
var putItem = database.putItem;
var getItem = database.getItem;
var deleteItem = database.deleteItem;
var updateItem = database.updateItem;

// Users service api
exports.getUserFromTable = function getUserFromTable(params, req, res, callback) {
  console.log("Get user info...");
  var attributes = {
      TableName : params.table,
      Key : {
          'email' : params.email
      }
  };
  getItem(attributes, req, res, callback);
}

exports.deleteUserFromTable = function deleteUserFromTable(tableName, req, res, callback) {
  console.log("Delete user from table...");
  var params = {
      TableName : tableName,
      Key : { 'email' : req.query.email },
			ReturnValues : 'ALL_OLD'
  }
  deleteItem(params, req, res, callback);
}

exports.putUserIntoTable = function putUserIntoTable(user_info, tableName, req, res, callback) {
  console.log("Put user into table...");
  if(user_info) {
    // Customized params
		putItem(user_info, req, res, callback);
    return;
  }
  var params = {
      TableName : tableName,
      Key : { 'email' : req.email },
  }
  putItem(params, req, res, callback);
}

exports.updateUserInfo = function updateUserInfo(params, req, res, callback){
	console.log("Update user info in table...");
	updateItem(params, req, res, callback);
}
