var logger = require('ss-logger').getLogger(__filename);
var common = require('../../app/common.js');
var util = require('../../app/util');

function handle(clientip, args, endcb, req, res) {


	endcb({
		'itemid': '111',
		'productid': util.formatDate(),
		'listprice': '222',
		'unitcost': '333',
		'attr1': '444',
		'status': '555'
	});
};

module.exports = {
	'handle': handle
};