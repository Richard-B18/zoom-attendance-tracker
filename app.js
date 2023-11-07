const express = require('express')
const crypto = require('crypto')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/events', (req, res) => {
    console.log(req.body);

    // Webhook request event type is a challenge-response check
    if(request.body.event === 'endpoint.url_validation') {
        const hashForValidate = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET_TOKEN).update(request.body.payload.plainToken).digest('hex')
    
        res.status(200).json({"plainToken": request.body.payload.plainToken, "encryptedToken": hashForValidate})
    }
    
    res.status(200).send('received');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})