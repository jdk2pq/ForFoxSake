const express = require('express');
const request = require('request');
const moment = require('moment');
const _ = require('lodash');

const app = express();

const inaugurationDay = moment('2017-01-20');


function getUrl(searchString) {
      	const today = new Date();
        let year = today.getFullYear(),
  			day = today.getDate(),
  			month = today.getMonth(),
  			todayString = '';

  		month = month + 1;
      if (month.toString().length === 1) {
        month = '0' + month;
      } else {
        month = month.toString();
      }

  		if (day.toString().length === 1) {
  			day = '0' + day;
  		} else {
        day = day.toString();
      }

  		if (searchString === 'obama') {
  			year = year - 8;
  		}
  		todayString = year + '-' + month + '-' + day;
  		return 'http://api.foxnews.com/v1/content/search?q=' + searchString +
        '&fields=date,description,title,url,image,type,taxonomy&section.path=fnc&min_date=' +
        todayString + '&max_date=' + todayString + '&start=0&cb=201769210&callback=?';
}

function getHeadlineList(body) {
  return _.map(_.sortBy(_.uniqBy(JSON.parse(body).response.docs, 'title'), function (a) { return moment(a.date).valueOf(); }), function(article) {
      let link = article.url;
      if (link.length === 1) {
        link = link[0];
      }
      return {url: link, title: article.title};
  });
}

function getDateString(obama) {
  let today = moment();
  if (obama) {
    today = today.subtract(8, 'years');
  }
  return today.format('dddd MMMM DD, YYYY');
}

let daysSinceStartOfPresidency = moment().diff(inaugurationDay, 'days');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	request(getUrl('obama'), function (errorO, responseO, bodyO) {
	    let trumpDate = getDateString(false),
	        obamaDate = getDateString(true),
	        obamaHeadlines = getHeadlineList(bodyO);
	    request(getUrl('trump'), function (errorT, responseT, bodyT) {
	        let listTrump = getHeadlineList(bodyT);
	        res.render('pages/index', {
			  	daysSinceStartOfPresidency: daysSinceStartOfPresidency,
			  	trumpDate: trumpDate,
			  	obamaDate: obamaDate,
			  	trumpHeadlines: listTrump,
			  	obamaHeadlines: obamaHeadlines
			});
      	});
  	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


