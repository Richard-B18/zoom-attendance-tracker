const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto')
const express = require('express')
const querystring = require('querystring');

require('dotenv').config();

const app = express()

const port = process.env.PORT || 3000

// all the credentials required

// for webhook
const ZOOM_WEBHOOK_SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

// for zoom oauth server interaction
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

const ZOOM_API = "https://api.zoom.us/v2"
const USER_ID = "richard.bryan@careerhackers.io"

app.use(bodyParser.json());

// verify if message is comming from zoom
const verifyFromZoom = (req, res, next) => {
    const signature = req.headers['x-zm-signature'];
    const timestamp = req.headers['x-zm-request-timestamp'];
    const message = `v0:${timestamp}:${JSON.stringify(req.body)}`

    const hashForVerify = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex')

    const excpectedSignature = `v0=${hashForVerify}`

    if (signature === excpectedSignature) {
        // Webhook request came from Zoom
        console.log('Verified Webhook Signature: Request came from Zoom');
        next();
    } else {
        // Webhook request did not come from Zoom
        console.error('Invalid Webhook Signature: Request did not come from Zoom');
        res.status(401).send('Invalid signature');
    }
}

app.post('/events', verifyFromZoom, (req, res) => {
    // Webhook request event type is a challenge-response check
    if(req.body.event === 'endpoint.url_validation') {
        const hashForValidate = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex')
    
        res.status(200).json({"plainToken": req.body.payload.plainToken, "encryptedToken": hashForValidate})
    }

    console.log(req.body);
    
    res.status(200).send('notification received');
})

async function getAccessToken(req, res, next) {
    const base64Credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const postData = querystring.stringify({
        grant_type: 'account_credentials',
        account_id: ACCOUNT_ID,
    });

    try {
        const response = await axios.post('https://zoom.us/oauth/token', postData, {
            headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        req.accessToken = response.data.access_token;
        next();
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to get access token');
    }
}

app.post('/create-meeting', getAccessToken, async (req, res) => {
    console.log(req.accessToken)
    try {
        const response = await axios.post(`${ZOOM_API}/users/${USER_ID}/meetings/`,
        // the only required field to create a meeting
        {
            "recurrence": {
                "type": 1
            }
        },
        {
            headers: {
                'Authorization': `Bearer ${req.accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        console.log(response)
        res.status(200).send("Meeting successfully created.")
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to create meeting')
    }
    // res.status(200).send(req.accessToken)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})