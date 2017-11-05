var
    gameport        = process.env.PORT || 2000,
    socket          = require('socket.io'),
    express         = require('express'),
    app             = express(),
    nodemailer      = require('nodemailer'),
    Tweeter         = require('node-twitter-api');

var server = app.listen(gameport);

console.log('\t :: Express :: Listening on port ' + gameport );

io = socket(server);

app.get('/', function (req, res) {
  console.log(req);
});

var CONSUMER_KEY = 'gopEukVHUChNGf1UFHWPrpcdy';
var CONSUMER_SECRET_KEY = '9PxeMrxwL7r7L1hCSdX77wjqS7LsyfihXpvpMaip2RlIsy9Dob';
var TOKEN_KEY = '324412152-imuOv0KhJLt2OrMhzRjJ4maoDAYpy5WMJWYStYxV';
var TOKEN_SECRET_KEY = 'YL73V6Kv3hLwM87VRED1gEU6Qr1ax6KIV20oXXcBrtROw';

var twitter = new Tweeter({
  consumerKey: CONSUMER_KEY,
  consumerSecret: CONSUMER_SECRET_KEY,
  callback: 'https://www.google.com'
});

clients = [];
imOk = false;
gps = {};

function tweet(text) {
  console.log('Twitter text : ' + text);
  twitter.statuses(
    "update",
    {
      status: text
    },
    TOKEN_KEY,
    TOKEN_SECRET_KEY,
    function(error, data, response) {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
        console.log(response);
      }
    }
  );
}

function sendEmail(email) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'strandzolina60@gmail.com',
      pass: 'stradza994'
    }
  });

  var mailOptions = {
    from: 'strandzolina60@gmail.com',
    to: email,
    subject: 'Pao sam',
    text: 'Uf boli me kuk, zovi Draganu!'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function getCaretakers() {
  var caretakers = [];
  clients.forEach(function (client) {
    if (client.role == 'controller')
      caretakers.push(client);
  });
  return caretakers;
}

// Code fore emergency
function emergencyCall() {
  console.log("CALL EMERGENCY");
  sendEmail('bloodnovski@gmail.com');
  tweet(
    "#OUR_APP Im not felling well, pls help! " + getCaretakers()[0].id +
    " My location is https://www.google.rs/maps/@" + gps.lat || '' +
    "," + gps.long || '' + ",15.25z"
  );
  getCaretakers().forEach(function (caretaker) {
    caretaker.emit('emergency_start', {
      gps: gps
    });
  });
}

function getArduino() {
  var arduino;
  clients.forEach(function (client) {
    if (client.role == 'arduino')
      arduino = client;
  });
  return arduino;
}

io.sockets.on('connection', function (client) {
  console.log('New connection : ' + client.id);

  client.emit('get_role');

  clients.push(client);

  client.on('gps_request', function () {
    client.emit('gps_request_aproved', {
      gps: gps
    });
  });

  client.on('ressurection', function () {
    imOk = true;
    getCaretakers().forEach(function (caretaker) {
      caretaker.emit('emergency_stop');
    });
    console.log('Im alive!');
  });

  client.on('get_role_aproved', function (data) {
    client.role = data.role;
  });

  client.on('geo', function (data) {
    gps = data;
    console.log('GPS : ' + gps);
  });

  client.on('acc', function(data) {
    var x = data.x;
    var y = data.y;
    var z = data.z;
    var m = Math.sqrt(x*x + y*y + z*z);
    if (m > 4) {
      getArduino().emit('pd');
      imOk = false;
      setTimeout(function () {
        if (!imOk) {
          emergencyCall();
          imOk = true;
        }
      }, 5000);
    }
  });
});
