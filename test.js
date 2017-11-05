var
    gameport        = process.env.PORT || 2000,
    socket          = require('socket.io'),
    express         = require('express'),
    app             = express(),
    nodemailer      = require('nodemailer'),
    Tweeter         = require('node-twitter-api');

process.on('uncaughtException', function (err) {
  console.log((err && err.stack) ? err.stack : err);
});

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
gps = {};
imOk = false;
detectMotion = false;
startingPosition = {
  x: 0,
  y: 0,
  z: 0
};
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
    subject: 'Emergency',
    text: "Im not felling well, pls help! " +
          " My location is https://www.google.rs/maps/@" + gps.lat || '' +
          "," + gps.long || '' + ",15.25z"
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

function detectMotion(x, y, z, m) {
  var nx=x;
  var ny=y;
  var nz=z;
  var na=Math.sqrt(nx*nx+ny*ny+nz*nz);
  // if(na>1.5 || na<0.5){ // krece se
  //   if(nx>1.5*startingPosition.x || nx<0.5*startingPosition.x &&
  //   ny>1.5*startingPosition.y || nz<0.5*startingPosition.y &&
  //   nz>1.5*startingPosition.z || nz<0.5*startingPosition.z)
  //   // sta ako se kotrlja a ne moze da ustane, mozda je dovoljna magnituda
  //   return true;
  // }
  // return false;
  return (m>1.5 || m<0.5);
}

function distanceGPS(lat1,lon1,lat0,lon0){
  // lat0 i lon0 su tipa koordinate gajbe, a lat1 i lon1 trenutne
  // moze da se posalje notifikacija ukoliko se udalji vise od X kilometara
  // (opcija u aplikaciji)
  var R = 6371e3; // metres
  var f1 = lat0.toRadians();
  var f2 = lat1.toRadians();
  var df = (lat1-lat0).toRadians();
  var dl = (lon1-lon0).toRadians();
  var a = Math.sin(df/2) * Math.sin(df/2) +
        Math.cos(f1) * Math.cos(f2) *
        Math.sin(dl/2) * Math.sin(dl/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}//*/

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
    // var distg=distanceGPS(gps.lat, gps.long, gajba.lat, gajba.long);
    // if (distg> zadata_Razdaljina) send_notification;
  });

  client.on('acc', function(data) {
    var x = data.x;
    var y = data.y;
    var z = data.z;
    var m = Math.sqrt(x*x + y*y + z*z);
    if (detectMotion == true) {
      imOk=detectMotion(x, y, z, m);// ako je 1, verovatno je ustao
      getCaretakers().forEach(function (caretaker) {
        caretaker.emit('emergency_stop');
      });
      console.log('Im alive!');
    }
    if (m > 4) {
      getArduino().emit('pd');
      setTimeout(function () {
        imOk = false;
        setTimeout(function () {
          if (!imOk) {
            emergencyCall();
            detectMotion = true;
            startingPosition = {
              x: x,
              y: y,
              z: z
            };
            imOk = true;
          }
        }, 5000);
      }, 2000);
    }
  });
});
