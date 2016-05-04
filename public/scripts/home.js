// user submit form to create a new account
// when page is loaded, run all needed functions.
$(document).ready(function(){
	$("#user_reg_submit").click(function(){
		var user_info = {
         	       "name"          :       $("#user_reg_name").val(),
               		"email"         :       $("#user_reg_email").val(),
                	"gender"        :       $("#user_reg_gender").val(),
                	"password"      :       $("#user_reg_password").val(),
                	"time"          :       Date.now()
        	};
		// ajax send to user accoutn info to server
		$.ajax({
			type    :       "POST",
		        url     :       '/user',
		     	data    :       user_info,
		        dataType :      'json',
		      	encoded :       true,
		}).done(function(data){
		   	 console.log(data);
		});
	});
	
	function onNewUserCreationSuccess(data) {
		alert(data);
	}
	
});

