/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {
		title : 'Express'
	});
};
exports.mainpage = function(req, res) {
	var ans = "";
	var service = require("../service");
	var lib = require("../service/lib");
	if ((typeof req.session.uid == "undefined")
			|| (typeof req.session.session_key == "undefined")) {
		res.redirect(301, "login");
		return;
	}
	var post_uid = 1235770;
	var post_eid = 0;
	var post_pid = 20;
	var pack = lib.createRetrieveCurrentUserInfoPack(req.session.uid, 4,
			req.session.session_key);
	service
			.connectAndSend(
					pack,
					function(response) {
						var retrived_nick_name = lib.resolvPack(response).resolved.info.nick_name;
						res.render('mainpage_pre.html', {
							nick_name : retrived_nick_name
						}, function(err, html) {
							ans += html;
						});
						res.send(ans);
					});
};
const
LOG_IN_WITH_UID = 0;
const
LOG_IN_WITH_EMAIL = 1;
const
LOG_IN_FAILED = -1;

const
SUCCESSFUL = 0;
const
FAILED = 1;
exports.doLogin = function(req, res) {
	var lib = require("../service/lib");
	var service = require("../service");
	var pack = lib.createLoginPack(LOG_IN_WITH_EMAIL, req.body.email,
			req.body.password);
	service.connectAndSend(pack, function(data) {
		var pkg = lib.resolvPack(data);
		if (pkg.resolved.success) {
			req.session.uid = pkg.header.uid;
			req.session.session_key = pkg.resolved.session_key;
			res.redirect("mainpage");
		} else
			res.send("Wrong ID or password");
	});
};