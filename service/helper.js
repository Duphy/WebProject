var net = require("net");
var backup_host = "54.254.213.73";
var main_host = "54.254.222.135";
var pic_file_host = "54.254.222.135";
var main_port = 1992;
var pic_file_port = 1997;
var timeout_handle = null;
var noti_handle = null;
var chat_handle = null;
var timelimit = 10000;
var retrylimit = 0;
var lib = require("../node_modules/lib");
var conns = [];
var pic_file_conns = [];
var dumb_session_key = "0000000000000000";
function UserSocket(host, port) {
	var self = this;
	this.host = host;
	this.port = port;
	this.timer = null;
	this.queue = [];
	this.msg = null;
	this.uid = null;
	this.session_key = null;
	this.handle = null;
	this.error_handle = null;
	this.retry_count = 0;
	this.pack_length = 0;
	this.data_length = 0;
	this.retval = new Buffer(0);
	this.connected = false;
	this.timeout = function() {
		self.timer = null;
		self.retry_count++;
		console.log("timeout, uid: " + self.uid);
		self.conn.destroy();
		self.connected = false;
		self.retval = new Buffer(0);
		self.pack_length = 0;
		self.data_length = 0;
		if (self.retry_count > retrylimit) {
			console.log("final timeout, uid: " + self.uid);
			lib.encode(self.msg);
			console.log(self.msg);
			self.retry_count = 0;
			if (self.timeout_handle != null)
				self.timeout_handle();
			else if (timeout_handle != null)
				timeout_handle(self.uid);
			self.msg = null;
			self.nextTask();
		} else
			self.conn.connect(self.port, self.host, function() {
				self.connected = true;
				self.timer = setTimeout(self.timeout, timelimit);
				self.conn.write(self.msg);
			});
	};
	this.conn = new net.Socket();
	this.conn.on("data", function(data) {
		self.conn.pause();
		self.retval = Buffer.concat([ self.retval, data ]);
		self.data_length += data.length;
		if ((self.pack_length == 0) && (self.data_length >= 18))
			self.pack_length = lib.resolvSTCHeader(self.retval)[0];
		while ((self.pack_length != 0)
			&& (self.pack_length <= self.data_length)) {
			var tmp = self.retval.slice(0, self.pack_length);
			lib.encode(tmp);
			self.retval = self.retval.slice(self.pack_length);
			self.data_length -= self.pack_length;
			if (self.data_length >= 18) {
				self.pack_length = lib.resolvSTCHeader(self.retval)[0];
			} else
				self.pack_length = 0;

			var header = lib.resolvSTCHeader(tmp);
			if ((header[3] == 10) && (header[4] == 5)) {
				if (noti_handle != null)
					noti_handle(lib.resolvPack(tmp));
			} else if (header[3] == 12) {
				if (chat_handle != null)
					chat_handle(lib.resolvPack(tmp));
			} else if (self.handle == null) {
				console.log("Unhandled pack: " + tmp + "\n\t"
					+ lib.resolvPack(tmp));
			} else {
				if ((header[3] == 6) && (header[4] == 0)) {
					var pkg = lib.resolvPack(tmp);
					if (pkg[1][0]) {
						conns[pkg[1][1]] = self;
						self.uid = pkg[0][2];
						self.session_key = pkg[1][1];
						conns[dumb_session_key] = new UserSocket(main_host, main_port)
					}
				}
				this.retry_count = 0;
				clearTimeout(self.timer);
				self.timer = null;
				self.handle(tmp);
				self.msg = null;
				self.handle = null;
			}
		}
		self.conn.resume();
		self.nextTask();
	});
	this.conn.on("error", function(er) {
		console.log("error, host " + self.host + ", port " + self.port + ", session_key " + self.session_key);
		console.log(er);
		if (self.timer != null) {
			clearTimeout(self.timer);
			self.timer = null;
		}
		self.msg = null;
		self.reval = new Buffer(0);
		self.data_length = 0;
		self.pack_length = 0;
		self.connected = false;
		if (self.error_handle != null)
			self.error_handle();
		self.nextTask();
	});
	this.conn.on("end", function() {
		console.log("socket ended, session_key: " + self.session_key
			+ ", uid: " + self.uid);
		self.conn.destroy();
		self.connected = false;
	});
	this.conn.on("close", function() {
		console.log("socket closed, session_key: " + self.session_key
			+ ", uid: " + self.uid);
		self.conn.destroy();
		self.connected = false;
	});
}
UserSocket.prototype.destroy = function() {
	this.conn.destroy();
	if (this.timer != null) {
		clearTimeout(this.timer)
		this.timer = null;
	}
}
UserSocket.prototype.nextTask = function() {
	var self = this;
	if (self.queue.length == 0)
		return;
	if (self.msg != null)
		return;
	self.msg = self.queue[0][0];
	lib.encode(self.msg);
	self.handle = self.queue[0][1];
	self.timeout_handle = self.queue[0][2];
	var no_response = self.queue[0][3];
	self.queue.shift();
	if (self.connected) {
		self.timer = setTimeout(self.timeout, timelimit);
		self.conn.write(self.msg);
		if (no_response) {
			self.msg = null;
			clearTimeout(self.timer);
			self.timer = null;
			if (self.handle != null)
				self.handle();
			self.nextTask();
		}
	} else {
		self.conn.connect(self.port, self.host, function() {
			self.connected = true;
			self.timer = setTimeout(self.timeout, timelimit);
			self.conn.write(self.msg);
			if (no_response) {
				self.msg = null;
				clearTimeout(self.timer);
				self.timer = null;
				if (self.handle != null)
					self.handle();
				self.nextTask();
			}
		});
	}
}
exports.connectAndSend = function(msg, callback, error_callback, no_response) {
	if (msg == null)
		return;
	var task = new Array(4);
	var header = lib.resolvCTSHeader(msg);
	var type = header[2];
	var session_key = header[1];
	task[0] = msg;
	if ((typeof callback == "undefined") || (callback == null))
		task[1] = function(data) {
		};
	else
		task[1] = callback;
	if (typeof error_callback == "undefined")
		task[2] = null;
	else
		task[2] = error_callback;
	if (typeof no_response == "undefined")
		task[3] = false;
	else
		task[3] = true;
	if ((type == 15) || (type == 16)) {
		if (typeof pic_file_conns[session_key] == "undefined")
			pic_file_conns[session_key] = new UserSocket(pic_file_host,
				pic_file_port);
		pic_file_conns[session_key].queue.push(task);
		pic_file_conns[session_key].nextTask();
	} else {
		if (typeof conns[session_key] == "undefined")
			conns[session_key] = new UserSocket(main_host, main_port);
		conns[session_key].queue.push(task);
		conns[session_key].nextTask();
	}
}
exports.disconnect = function(session_key) {
	if (typeof conns[session_key] != "undefined") {
		conns[session_key].destroy();
		delete conns[session_key];
	}
	if (typeof pic_file_conns[session_key] != "undefined") {
		pic_file_conns[session_key].destroy();
		delete pic_file_conns[session_key];
	}
}
exports.set_timeout_handle = function(handle) {
	if (typeof handle != "function")
		return;
	timeout_handle = handle;
}
exports.set_noti_handle = function(handle) {
	if (typeof handle != "function")
		return;
	noti_handle = handle;
}
exports.set_chat_handle = function(handle) {
	if (typeof handle != "function")
		return;
	chat_handle = handle;
}
function print_time(time) {
	var hour = Math.floor(time / 10000);
	var minute = Math.floor(time / 100) % 100;
	var isPM = false;
	var ans = "";
	/*
	 * if (hour > 12){ hour = hour - 12; isPM = true; }
	 */
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (minute < 10) {
		minute = "0" + minute;
	}
	ans = hour + ":" + minute;
	/*
	 * if(isPM){ ans = hour +":"+minute+" PM" }else{ ans = hour +":"+minute+"
	 * AM" }
	 */
	return ans;
};
exports.print_time = print_time;
function print_date(date) {
	var year = Math.floor(date / 10000);
	var month = Math.floor(date / 100) % 100;
	var day = date % 100;
	var ans = "";
	var tmp = [
		"Jan ",
		"Feb ",
		"Mar ",
		"Apr ",
		"May ",
		"Jun ",
		"Jul ",
		"Aug ",
		"Sep ",
		"Oct ",
		"Nov ",
		"Dec " ];
	ans = tmp[month - 1] + " " + day + ", " + year;
	return ans;
};
exports.print_date = print_date;
exports.UTCtimeTransform = function(date, time) {
	var year = Math.floor(date / 10000);
	var month = Math.floor(date / 100) % 100;
	var day = date % 100;
	var hour = Math.floor(time / 10000);
	var minute = Math.floor(time / 100) % 100;
	var second = time % 100;
	var d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	return [
		d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(),
		d.getHours() * 10000 + d.getMinutes() * 100 + d.getSeconds() ];
}
exports.localizedTime = function(date, time) {
	var year = Math.floor(date / 10000);
	var month = Math.floor(date / 100) % 100;
	var day = date % 100;
	var hour = Math.floor(time / 10000);
	var minute = Math.floor(time / 100) % 100;
	var second = time % 100;
	var d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	return [
		print_date(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100
			+ d.getDate()),
		print_time(d.getHours() * 10000 + d.getMinutes() * 100 + d.getSeconds()) ];

}
exports.print_gender = function(gender) {
	if (gender == 0)
		gender = "Female";
	else if (gender == 1)
		gender = "Male";
	else
		gender = "Others";
	return gender;
}
function getVersion(path) {
	// var path = "public/data/"+uid+"/avarta_20140124_1125.jpg";
	var res = path.split("/");
	var version = res[3].split("_");
	var version_date = version[1];
	var version_time = version[2];
	return [ version_date, version_time ];
}
exports.getVersion = getVersion;

// Adds two arrays for the given base (10 or 16), returning the result.
// This turns out to be the only "primitive" operation we need.
function add(x, y, base) {
	var z = [];
	var n = Math.max(x.length, y.length);
	var carry = 0;
	var i = 0;
	while (i < n || carry) {
		var xi = i < x.length ? x[i] : 0;
		var yi = i < y.length ? y[i] : 0;
		var zi = carry + xi + yi;
		z.push(zi % base);
		carry = Math.floor(zi / base);
		i++;
	}
	return z;
}

/** ******Hex<->Dec convert******* */
// Returns a*x, where x is an array of decimal digits and a is an ordinary
// JavaScript number. base is the number base of the array x.
function multiplyByNumber(num, x, base) {
	if (num < 0)
		return null;
	if (num == 0)
		return [];

	var result = [];
	var power = x;
	while (true) {
		if (num & 1) {
			result = add(result, power, base);
		}
		num = num >> 1;
		if (num === 0)
			break;
		power = add(power, power, base);
	}

	return result;
}

function parseToDigitsArray(str, base) {
	var digits = str.split('');
	var ary = [];
	for (var i = digits.length - 1; i >= 0; i--) {
		var n = parseInt(digits[i], base);
		if (isNaN(n))
			return null;
		ary.push(n);
	}
	return ary;
}

function convertBase(str, fromBase, toBase) {
	var digits = parseToDigitsArray(str, fromBase);
	if (digits === null)
		return null;

	var outArray = [];
	var power = [ 1 ];
	for (var i = 0; i < digits.length; i++) {
		// invariant: at this point, fromBase^i = power
		if (digits[i]) {
			outArray = add(
				outArray,
				multiplyByNumber(digits[i], power, toBase),
				toBase);
		}
		power = multiplyByNumber(fromBase, power, toBase);
	}

	var out = '';
	for (var i = outArray.length - 1; i >= 0; i--) {
		out += outArray[i].toString(toBase);
	}
	return out;
}
/*
 * original version function decToHex(decStr) { var hex = convertBase(decStr,
 * 10, 16); return hex ? '0x' + hex : null; }
 */
function decToHex(decStr) {
	var hex = convertBase(decStr, 10, 16);
	console.log(hex);
	if (hex.length < 16) {
		for (var i = hex.length; i < 16; i++)
			hex = '0' + hex;
	}
	return hex;
}
function hexToDec(hexStr) {
	if (hexStr.substring(0, 2) === '0x')
		hexStr = hexStr.substring(2);
	hexStr = hexStr.toLowerCase();
	return convertBase(hexStr, 16, 10);
}

exports.decToHex = decToHex;
exports.hexToDec = hexToDec;
