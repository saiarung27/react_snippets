const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const yargs = require('yargs');
const request = require('request');
const session = require('cookie-session');
const app = express();
const helmet = require('helmet');
const fs = require('fs');
const dotenv = require('dotenv');
const mockUsers = require('./mocks/users.json');
const mockStores = require('./mocks/stores.json');
const preContingencyData = require('./mocks/precontingency.json');
const postContingencyData = require('./mocks/postcontingency.json');
const mockMenuData = require('./mocks/menu.json');
const serviceWrapper = require('./externalServices/serviceWrapper');
const saml = require("express-saml2");
const cookie = require("cookie");
const mockCandidateData = require('./mocks/candidate.json');

const argv = yargs.option({
  port: {
    alias: 'p',
    describe: 'Port to run on',
  },
  env: {
    alias: 'e',
    describe: 'Environment',
    choices: ['local', 'dev', 'qa', 'stage', 'prod'],
  },
}).argv;

const port = argv.port ? argv.port : 8080;
const env = argv.env || 'local';

dotenv.config({ path: __dirname + '/.env.' + argv.env});

const ServiceProvider = saml.ServiceProvider;
const IdentityProvider = saml.IdentityProvider;

//or condition is for running app in localhost
const spFile = '/pingFed/' + (process.env.APPSETTING_ENV || 'dev') + '_metadata_sp.xml';
const idpFile = '/pingFed/' + (process.env.APPSETTING_ENV || 'dev') + '_metadata_idp.xml';

const sp = ServiceProvider(__dirname + spFile);
const idp = IdentityProvider(__dirname + idpFile);

const options = {
  root: __dirname,
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true,
  },
};

app.use(
  session({
    cookieName: 'session',
    secret: 'todoSetThis', //TODO - update this with a real secret
    duration: 30 * 60 * 1000, // in milliseconds
    activeDuration: 5 * 60 * 1000, // in milliseconds
    cookie: {
      path: '/', // cookie will only be sent to requests under '/'
      maxAge: null, // duration of the cookie in milliseconds, defaults to duration above
      ephemeral: true, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secure: false, // when true, cookie will only be sent over SSL.
      //proxySecure: true //set active when ready for https
    },
  }),
);

app.set('trust proxy', true);
app.use(helmet());
app.use(express.static(`${__dirname}/build`, options));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes created for local dev/mocking data
// TODO - move to shifu mocking

app.get('/api/candidate/:id', async (req, res) => {
  const id = escape(req.params.id);

  if (env === 'local') {
    const response = {
      message: 'Success',
      data: mockCandidateData,
    };
    res.send(response);
  } else {
    const auth = req.headers.authorization;
    const candidate = await serviceWrapper.getWithHeaders(
      `candidate/${id}`, 
      { headers: { Authorization: auth } },
    );
    res.send(candidate);
  }
});
app.put('/api/candidate/:id', async (req, res) => {
  const id = escape(req.params.id);
  const payload = req.body;
  const auth = req.headers.authorization;
  const candidate = await serviceWrapper.put(`candidate/${id}`, payload, {
    headers: { Authorization: auth },
  });
  res.send(candidate);
});

app.post('/api/candidate/:id', async (req, res) => {
  const id = escape(req.params.id);
  const payload = req.body;
  const auth = req.headers.authorization;
  if (env === 'local') {
    res.send('candidate has been updated');
  } else {
    const candidate = await serviceWrapper.put(`candidate/${id}`, payload, {
      headers: { Authorization: auth },
    });
    res.send(candidate);
  }
});

app.post("/home", function(req, res) {  
  var cookies = cookie.parse(req.headers.cookie || "");

  if (req.hostname === "localhost") {
      res.redirect('/loginform');
      res.end();
  } else {
      if (cookies != null && cookies != undefined) {
        var employeeId;
        var emailId;

        sp.parseLoginResponse(idp, "post", req, function(parseResult) {
          var userData = {
            userId: parseResult.extract.attribute["Employee Id"],
            emailId:
              parseResult.extract.attribute["Email Id"] === undefined
                ? 0
                : parseResult.extract.attribute["Email Id"]
          };

          employeeId = cookie.serialize("employeeId", userData.userId);
          emailId = cookie.serialize("emailId", userData.emailId);

          res.setHeader("Set-Cookie", employeeId);
          res.append("Set-Cookie", emailId);
          res.redirect('/home');
          res.end();
        });

        if (emailId === undefined) {
          console.info("[server] Invalid Redirecting to Wire Ping...");
          res.redirect(process.env.APPSETTING_PINGFED_LOGON_URL);
          res.end();
        }

      } else {
        console.log("[server] Error. pingFed missing cookies", res)
        res.redirect('/');
        res.end();
      }
    }
});

app.get('/api/componentdata', async (req, res) => {
  const stageId = Number(req.query.stageId);

  if (env === 'local') {
    const response = {
      message: 'Success',
      data: (stageId == 1) ? preContingencyData : postContingencyData,
    };
    res.send(response);
  } else {
    const auth = req.headers.authorization;
    const componentdata = await serviceWrapper.getWithHeaders(
      `componentdata/?stageId=${stageId}`,
      { headers: { Authorization: auth } },
    );
    res.send(componentdata);
  }
});
app.get('/api/menu', async (req, res) => {
  const stageId = Number(req.query.stageId);

  if (env === 'local') {
    const response = {
      message: 'Success',
      data: mockMenuData
    };
    res.send(response);
  } else {
    const auth = req.headers.authorization;
    const menudata = await serviceWrapper.getWithHeaders(
      `menu/?stageId=${stageId}`,
      { headers: { Authorization: auth } },
    );
    res.send(menudata);
  }
});

app.post('/api/validatelogin', async (req, res) => {
  const response = await serviceWrapper.post('validatelogin', req.body);
  res.send(response);
});

app.get('/Login', async (req, res) => {
  res.redirect('/')
});

app.get('/api/appconfig', async (req, res) => {
    const configData = {
      'PINGFED_LOGON_URL': process.env.APPSETTING_PINGFED_LOGON_URL, 
      'PINGFED_LOGOUT_URL': process.env.APPSETTING_PINGFED_LOGOUT_URL,
      'IS_PINGFED_ENABLED': process.env.APPSETTING_IS_PINGFED_ENABLED
    }
    res.send(configData);
});

// production routes

//TODO - we'll need to
//  - setup https server to replace app.listen below
//  - add logic for the ping redirect
//  - setting the ping results in the cookie
//  - protect routes from being accessed without auth
//  - handle logout, clearing sessions

app.get('/*', function(req, res) {
  console.log('[server] no matching routes, so redirect to landing route')
  res.sendFile(`${__dirname}/build/index.html`);
});

app.listen(port, function() {
  console.log('app listening on port ' + port);
});