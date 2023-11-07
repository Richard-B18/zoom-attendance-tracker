const bodyParser = require('body-parser');
const crypto = require('crypto')
const express = require('express')

const app = express()

const port = process.env.PORT || 3000
const ZOOM_WEBHOOK_SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})