const express = require("express");
const path = require("path");
const OktaJwtVerifier = require('@okta/jwt-verifier');
var cors = require('cors');


const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: '0oa2blmqo4BzqqDbc357',
    issuer: 'https://dev-339211.okta.com/oauth2/default'
});

function authenticationRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
        res.status(401);
        return next('Unauthorized');
    }

    const accessToken = match[1];
    const audience = 'api://default';
    return oktaJwtVerifier.verifyAccessToken(accessToken, audience)
        .then((jwt) => {
            req.jwt = jwt;
            next();
        })
        .catch((err) => {
            res.status(401).send(err.message);
        });
}


const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: 'Hello!  There\'s not much to see here :) Please grab one of our front-end samples for use with this sample resource server'
    });
});


const port = process.env.PORT || "8000";

app.get("/", (req, res) => {
    res.status(200).send("WHATABYTE: Food For Devs");
});

app.get('/secure', authenticationRequired, (req, res) => {
    res.json(req.jwt);
});

/**
 * Another example route that requires a valid access token for authentication, and
 * print some messages for the user if they are authenticated
 */
app.get('/api/messages', authenticationRequired, (req, res) => {
    res.json({
      messages: [
        {
          date:  new Date(),
          text: 'I am a robot.'
        },
        {
          date:  new Date(new Date().getTime() - 1000 * 60 * 60),
          text: 'Hello, world!'
        }
      ]
    });
  });

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});