var express = require('express');
var fs = require('fs')
var phantom = require('phantom');
var app = express();
var Twit = require('twit'),
    config = {
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.use(express.static('public'));

app.get('/', function(request, response) {
  (async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    await page.property('viewportSize', { width: 800, height: 530 });
    const status = await page.open('https://mars.nasa.gov/layout/embed/image/insightweather/');
    // console.log(`Page opened with status [${status}].`);

    await page.render(__dirname + '/public/weather.png');
    // console.log(`File created at [/public/weather.png]`);

    response.sendFile(__dirname + '/views/index.html');
    await instance.exit();
  })();
  app.all(`/${process.env.BOT_ENDPOINT}`, function(req, res){
var b64content = fs.readFileSync('public/weather.png', { encoding: 'base64' })

T.post('media/upload', { media_data: b64content }, function (err, data, response) {

  var mediaIdStr = data.media_id_string
  var altText = "Mars InSight Weather Data."
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

  T.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      var params = { status: 'Hey InSight, whats the weather today? #mars', media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        console.log(data)
      })
    }
  })
})
});
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
