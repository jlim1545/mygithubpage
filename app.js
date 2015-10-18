var express    = require('express');
var http       = require('http')
var path       = require('path')
var reload     = require('reload')
var bodyParser = require('body-parser')
var logger     = require('morgan')
var Client     = require('node-rest-client').Client;
var models     = require("./models");

var client = new Client();
var app = express();

var publicDir = path.join(__dirname, '')

app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.json()) //parses json, multi-part (file), url-encoded
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/assets', express.static('assets'));

var client_id = "0000000048171006"
var redirect_uri = "http://localhost:3000/authorize"

// Routing

app.get('/', function (request, response) {
  response.render('landing')
});

app.get('/login', function (req, res) {
  res.redirect('https://login.live.com/oauth20_authorize.srf?client_id='+client_id+'&scope=wl.signin+wl.offline_access+onedrive.readwrite+onedrive.appfolder&response_type=code&redirect_uri='+redirect_uri)
});
app.get('/authorize', function (req, res) {
  var args = {
    data: "client_id="+client_id+"&redirect_uri="+redirect_uri+"&client_secret=wiGM9xwtlZzVjjyzPoAhI6ISwGHpAin8&code="+req.query.code+"&grant_type=authorization_code",
    headers:{"Content-Type": "application/x-www-form-urlencoded"}
  };
  client.post("https://login.live.com/oauth20_token.srf", args, function(data,response){
    console.log(data)
    models.User.findOrCreate({
      where: {user_id: data.user_id}
    }).spread(function(user) {
      user.set('access_token', data.access_token)
      user.save().then(function() {
        res.send("<pre>user_id:\n" + user.user_id + "\n\naccess_token:\n" + user.access_token + "</pre>");
      })
    })
  })
});


// Start server

models.sequelize.sync().then(function () {
  var server = http.createServer(app)
  reload(server, app, 2000, 1000)

  server.listen(app.get('port'), function(){
    console.log("Web server listening on port " + app.get('port'));
  });
})
