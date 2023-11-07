const bodyParser = require('body-parser');
const crypto = require('crypto')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/events', (req, res) => {
    console.log(req.body);

    // Webhook request event type is a challenge-response check
    if(req.body.event === 'endpoint.url_validation') {
        const hashForValidate = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex')
    
        res.status(200).json({"plainToken": req.body.payload.plainToken, "encryptedToken": hashForValidate})
    }
    
    res.status(200).send('received');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})