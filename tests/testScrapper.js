var Scrapper = require(__dirname + '/../scrapper.js');

var url = 'http://feeds.gawker.com/lifehacker/full';
if ( process.argv[2] ) {
    url = process.argv[2];
}
console.log( 'scrapping url:' + url );

Scrapper.scrap({ url: url}, function (err, rss) {
    /*
     * rss : { {name: }, {link}, {description}, items[] = { title, link, description } }
     */
    if (!err) {
        for(var k in rss) { // name, link, description, items
            if ( k == 'items' ) {
                var items = rss[k];
                for (var j in items ) {
                    console.log( ' - items[' + j + ']:');
                    console.log( '   - title: ' + items[j].title);
                    console.log( '   - link: ' + items[j].link);
                    console.log( '   - description: ' + items[j].description.substring(1, 40) + '...');
                    console.log( '   - pubDate: ' + items[j].pubDate);
                }
            } else {
                console.log( 'rss[' + k + ']:' + JSON.stringify(rss[k]) );
            }

        }
    } else {
        console.log( err );
    }

});

