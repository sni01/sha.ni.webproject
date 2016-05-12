// Import Database api
var database = require('./database.js');

// Database functions
var putItem = database.putItem;
var getItem = database.getItem;
var deleteItem = database.deleteItem;

// Users service api
exports.getUserFromTable = function getUserFromTable(tableName, req, res, callback) {
  console.log("Get user info...");
  var params = {
      TableName : tableName,
      Key : {
          'email' : req.body.email
      }
  };
  getItem(params, req, res, callback);
}

exports.deleteUserFromTable = function deleteUserFromTable(tableName, req, res, callback) {
  console.log("Delete user from table...");
  var params = {
      TableName : tableName,
      Key : { 'email' : req.email },
      ReturnValue : "ALL_OLD"
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
