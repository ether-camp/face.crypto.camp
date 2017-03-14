var express         = require('express');
var path            = require('path');
var querystring = require('querystring'); 
var http            = require('http');
var fs            = require('fs'); 
var childProcess = require('child_process');
var bodyParser = require('body-parser');
var guid = require('guid');
var app = express();

var ethUtils = require('ethereumjs-util');
var ethAbi = require('ethereumjs-abi');

var pathToAvatar = "hash/";

var redisUrl = process.env.REDISCLOUD_URL ? process.env.REDISCLOUD_URL : 'redis://localhost:6379';

var redis = require('redis');
var cache = redis.createClient(redisUrl, {no_ready_check: true});

app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);

app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

function rasterize(decoded, hash, response) {
  var filenameFull = "/tmp/" + guid.raw() + ".png";
  var childArgs = [
    'rasterize.js',
    'http://face.crypto.camp/show_avatar_decoded.html?decoded=' + JSON.stringify(decoded),
    filenameFull,
    '',
    0
  ];

  childProcess.execFile('phantomjs', childArgs, function(error, stdout, stderr){
    if(error !== null) {
      console.log("Error capturing page: " + error.message + "\n for address: " + childArgs[1]);
      return response.status(500).send({ error: "Problem on avatar rendering" });
    } else {
      //load the saved file
      fs.readFile(filenameFull, function(err, temp_png_data) {
        if (err!=null) {
          console.log("Error loading saved screenshot: " + err.message);
          return response.json(500, { 'error': 'Problem loading saved page.' });
        } else {


          var readStream = fs.createReadStream(filenameFull);
          // We replaced all the event handlers with a simple call to readStream.pipe()
          readStream.pipe(response);

          fs.unlink(filenameFull, function(err){}); //delete local file          
        }
        
      });
    }
  });
}

loadAvatar = function(hash, request, response) {

  var parts = ["backs", "clothes", "ears", "eyebrows", "eyesfront", "eyesiris", "faceshape", "glasses", "hair", "mouth", "nose", "beard", "mustache"];
  var partsColors = ["backs", "clothes", "eyebrows", "eyesiris", "faceshape", "glasses", "hair", "mouth"];

  var ethProvider = 'frontier-lb.ether.camp';
  var avatarsContract = '0x5e49ec3fbd55e7b86a5a5b1a32c73aa44b42b4af';


  var payload = "0x8eaa6ac0" + hash;
  var callTx = {
    to: avatarsContract,
    data: payload
  };

  var getAvatarData = JSON.stringify({"jsonrpc":"2.0","method":"eth_call", "id": 1, "params":[ callTx, "pending" ]});

  var options = {
      host: ethProvider,
      port: 80,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(getAvatarData)
      }
  };

  var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          var bufResponse = ethUtils.toBuffer(chunk);

          var result = JSON.parse(chunk).result;

          // cache.put(hash, result);
          cache.set(hash, result);
          var decoded = ethAbi.rawDecode(["bytes32", "bytes32", "bytes32", "bytes32"], ethUtils.toBuffer(result));          
          console.log(decoded);
          rasterize(decoded, hash, response);
      });
  });

  req.write(getAvatarData);
  req.end();
}

app.get('/hash/:hash', function (request, response) {
  var hash = request.params.hash;
  cache.get(hash, function(err, cached) {
    if (cached) {
      var decoded = ethAbi.rawDecode(["bytes32", "bytes32", "bytes32", "bytes32"], ethUtils.toBuffer(cached));
      rasterize(decoded, hash, response);
    } else {
      loadAvatar(request.params.hash, request, response);     
    }
  });  
});

app.get('/', function(req, res) {
    // Prepare the context
    res.render(path.join(__dirname, "public", 'svgavatars.html'));
});

app.get('/contract', function(req, res) {
    // Prepare the context
    res.render(path.join(__dirname, "public", 'contract.html'));
});

app.get('/avatars/last', function (request, response) {
  var lastAvatars = cache.get('last_avatars', function(err, lastAvatars) {  
    if (!lastAvatars) {
      lastAvatars = [];
    }

    response.write(lastAvatars);
    response.end();
  });
});

var urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.post('/avatar/image', bodyParser.json(), function (request, response) {  
  var payloadHash = ethUtils.sha3(request.body.payload);
  cache.set(request.body.hash, request.body.payload);
  var lastAvatars = cache.get('last_avatars', function(err, lastAvatars) {
    if (!lastAvatars) {
      lastAvatars = [];
    } else {
      lastAvatars = JSON.parse(lastAvatars);
    }

    if (lastAvatars.indexOf(pathToAvatar + request.body.hash) < 0) {
      lastAvatars.unshift(pathToAvatar + request.body.hash);   
      if (lastAvatars.length > 12) {
        lastAvatars.length = 12;
      } 

      cache.set('last_avatars', JSON.stringify(lastAvatars));
    }
  });    
});

// write nginx tmp
fs.writeFile("/tmp/app-initialized", "Ready to launch nginx", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
});

// listen on the nginx socket
app.listen('/tmp/nginx.socket', function() {
  console.log("Listening ");
});
