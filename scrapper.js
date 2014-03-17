var http = require('http');
var config = require(__dirname + '/config.js');
var parseXML = require('xml2js').parseString;

exports.scrap = function (feed, callback) {

    var callback_onerror = function (error) {
                        console.log("error while getting feed", error);
                        callback(error, null);
                };
    var callback_res = function (res) {
		var body = "";


		res.on('data', function (chunk) {
			body += chunk;
		});

		res.on('end', function () {
			// Got all response, now parsing...

            if ( (res.statusCode == 301 || res.statusCode == 302) && res.headers.location) {
                console.log( res.statusCode + ' redirecting to location:' + res.headers.location );
                return http.get(res.headers.location, callback_res).on('error', callback_onerror);
            } else if ( res.statusCode != 200 ) {
                console.log( 'response status:' + res.statusCode );
                console.log( 'headers:' + JSON.stringify(res.headers) );
            }

			if (!body || res.statusCode !== 200) {
			    return callback({message: "Invalid Feed:" + res.statusCode});
            }

			parseXML(body, function (err, rss) {
				if (err)
					return callback({message: "Invalid Feed: XML parsing error"});

				feed = parseRSS(rss);
				if (!feed)
					feed = parseAtom(rss);
				if (!feed)
					return callback({message: "Invalid Feed: RSS or Atom"});
				callback(err, feed);
			});

		});

	};

	http.get(feed.url, callback_res).on('error', callback_onerror);

}


var parseRSS = function (rss) {
	try {
		var items = [];
		for (var i = 0; i < config.maxItems && i < rss.rss.channel[0].item.length - 1; i++) {
			items.push({
				title: rss.rss.channel[0].item[i].title[0],
				link: rss.rss.channel[0].item[i].link[0],
				description: rss.rss.channel[0].item[i].description[0],
				pubDate: rss.rss.channel[0].item[i].pubDate[0],
			})
		};

		var feed = {
			name: rss.rss.channel[0].title,
			description: rss.rss.channel[0].description,
			link: rss.rss.channel[0].link,
			items: items
		};
		return feed;
	}
	catch (e) { // If not all the fiels are inside the feed
		return null;
	}
}
var parseAtom = function (rss) {
	try {
		var items = [];
		for (var i = 0; i < config.maxItems && i < rss.feed.entry.length - 1; i++) {
			items.push({
                title: rss.feed.entry[i].title[0]._ ? rss.feed.entry[i].title[0]._ : rss.feed.entry[i].title,
				link: rss.feed.entry[i].link[0].$.href,
				description: rss.feed.entry[i].content[0]._,
                pubDate: rss.feed.entry[i].published
			})
		};
		var feed = {
			name: rss.feed.title,
			description: "No description",
			link: rss.feed.link[0].$.href,
			items: items
		};
		return feed;
	}
	catch (e) { // If not all the fiels are inside the feed
		console.log(e);
		return null;
	}
}

