

//
exports.doLogin = function(req, res) {
    const SUCCESSFUL = 0;
    const FAILED = 1;
    var lib = require("../service/lib");
    var service = require("../service");
    const LOG_IN_MODE = 0;
    var pack = lib.createLoginPack(LOG_IN_Mode, req.body.email,req.body.password);
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
