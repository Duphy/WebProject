exports.login = function(req,res){
	res.render('login', {title:"Circa —— Meet the People You Like."});
}

exports.home = function(req,res){
	res.render('home', {title:"Homepage"});
}

exports.updateUserInfo = function(req,res){
	res.render('update', {title:"Edit User Profile"});
}

exports.search = function(req,res){
	res.render('search',{title:"Search"});
}

exports.user = function(req,res){
	res.render('user',{title:"User"});
}

exports.event = function(req,res){
	res.render('event',{title:"Event"});
}

exports.profile = function(req,res){
	res.render('profile',{title:"Profile"});
}
exports.userprofile = function(req,res){
	res.render('userprofile',{title:"User Profile"});
}
exports.eventprofile = function(req,res){
	res.render('eventprofile',{title:"User Profile"});
}
exports.updateEventInfo = function(req,res){
	res.render('updateevent',{title:"Edit Event Profile"});
}
exports.createevent = function(req,res){
	res.render('createevent',{title:"New Event"});
}
exports.eventmanage = function(req,res){
	res.render('eventmanage',{title:"Event Management"});
}
exports.eventnews = function(req,res){
	res.render('eventnews',{title:"Event News"});
}
// exports.scheduling = function(req,res){
// 	res.render('scheduling',{title:"scheduling"});
// }