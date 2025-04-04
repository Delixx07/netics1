const express = require('express')
const app = express()
const port = 3000
const startTime = Date.now();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get("/health", (req, res) => {
    res.json({
        nama: "Dustin Felix",
        nrp: "5025231046",
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: (Date.now() - startTime) / 1000
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})