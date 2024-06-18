require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();
const shortUrls = {};

app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const regexURL = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/

  if (regexURL.test(req.body.url)) {
    const arrayURL = req.body.url.split("//");
    
    dns.lookup(arrayURL[1], (err, address, family) => {
      const shortUrl = Object.entries(shortUrls).length + 1;
      shortUrls[shortUrl] = req.body.url;
      res.json({original_url: req.body.url, short_url: shortUrl});
    });
  } else {
    res.json({error: 'invalid url'});
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = shortUrls[shortUrl];

  if (originalUrl) {
	res.redirect(originalUrl);
  } else {
	  res.json({error: "Wrong format"});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
