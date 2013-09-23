/**
 * New node file
 */

var conn = new require("net").Socket();
var lastcallback = null;
var connected = false;
var timer = null;
var queue = [];
var host = "25.40.107.250";
var port = 1992;
function dataArrived(data) {
	clearTimeout(timer);
	queue[0].callback(data.slice(8));
	queue.shift();
	nextTask();
}
function timeout() {
	console.log("timeout");
	conn.end();
	conn.connect(host, port, function() {
		connected = true;
		conn.on("data", dataArrived);
		conn.on("end", function() {
			connected = false;
		});
		conn.setEncoding("hex");
		timer = setTimeout(timeout, 10000);
		conn.write(queue[0].msg, "hex");
	});
}
function nextTask() {
	if (queue.length == 0)
		return;
	if (connected) {
		timer = setTimeout(timeout, 10000);
		conn.write(queue[0].msg, "hex");
	} else {
		conn.connect(port, host, function() {
			connected = true;
			conn.on("data", dataArrived);
			conn.on("end", function() {
				connected = false;
			});
			conn.setEncoding("hex");
			timer = setTimeout(timeout, 10000);
			conn.write(queue[0].msg, "hex");
		});
	}
}
function connectAndSend(msg, callback) {
	var task = new Object();
	task.callback = callback;
	task.msg = msg;
	queue.push(task);
	if (queue.length == 1)
		nextTask();
}
exports.connectAndSend = connectAndSend;
exports.print_time = function($input) {
	var ans = "";
	if ($input.hour > 9)
		ans += Integer.toString($input.hour);
	else
		ans += "0" + Integer.toString($input.hour);
	ans += ": ";
	if ($input.minute > 9)
		ans += Integer.toString($input.minute);
	else
		ans += "0" + Integer.toString($input.minute);
	ans += ": ";
	if ($input.second > 9)
		ans += Integer.toString($input.second);
	else
		ans += "0" + Integer.toString($input.second);
	return ans;
};
exports.print_date = function($input) {
	var ans = "";
	var tmp = [ "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ",
			"Sep ", "Oct ", "Nov ", "Dec " ];
	ans = tmp[$input.month] + Integer.toString($input.day) + ", "
			+ Integer.toString($input.year);
	return ans;
};
