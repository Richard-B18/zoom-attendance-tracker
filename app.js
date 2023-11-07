const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/events', (req, res) => {
    console.log(req);
    res.status(200).send('received');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})