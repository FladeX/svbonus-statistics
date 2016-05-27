'use strict';

var request = require('request');
var htmlparser = require('htmlparser2');

var source = 'http://svbon.us/';

request(source, function(error, response, html) {
	if (!error && response.statusCode === 200) {
		var isSectionFound = false;
		var isTotalBlockFound = false;
		var isTotalTextFound = false;
		var parser = new htmlparser.Parser({
			onopentag: function(name, attributes) {
				if (name === 'div' && attributes.id === 'infa') {
					isSectionFound = true;
				}
				if (name === 'div' && attributes.class === 'well') {
					if (isSectionFound) {
						isTotalBlockFound = true;
					}
				}
				if (name === 'div' && isTotalBlockFound) {
					isTotalTextFound = true;
				}
			},
			ontext: function(text) {
				if (isTotalTextFound) {
					if (text.match('Доступно: ')) {
						console.log(text.match(/\d+/)[0]);
						isTotalBlockFound = false;
						isTotalTextFound = false;
					}
				}
			}
		});
		parser.write(html);
		parser.end();
	}
});
