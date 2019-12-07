//Setup
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const modelUrl = require('./models/modelUrl')
const dns = require('dns')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use('/public', express.static(process.cwd() + '/public'))

//Connect to database.
mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })

//Links index.html page.
app.get('/', function(req, res){
    res.sendFile(process.cwd() + '/views/index.html')
  });

//Takes input from the form.
app.post("/api/shorturl/new", function(req, res) {
    var urlInput= req.body.url
    var regexURL = new RegExp("^(http|https)://", "i")
    var formattedUrl = urlInput.replace(/(^\w+:|^)\/\//, '').split('/')[0]
    //fcc tests want urls to only start with http:// or https://.  This tests to make sure they do.  All other input is invalid.
    if (regexURL.test(urlInput)) {
    //fcc also wanted us to use dns.lookup, however any url with http:// or https:// returned invalid.  So the formattedUrl regex removes that, as well as any routes.
    //Checks to see if  url is valid.
        dns.lookup(formattedUrl, (err) => {
            if (err) {
                res.json({"error":"invalid URL"})
            } else {
                //Random number for short url.
                var randomShort = Math.floor(Math.random() * 1000).toString()
                //Creates the entry in the database.
                var data = new modelUrl(
                    {
                        originalUrl: urlInput,
                        shortUrl: randomShort
                    }
                )
                data.save(err => {
                    if (err) {
                        return res.send('Error saving to database')
                    }
                })
                return res.json(data)
            }
        })
    } else {
        res.json({"error":"invalid URL"})
    }
})

//Checks database and forwards to the original url.
app.get('/api/shorturl/:urlToForward', (req, res, next) => {
    modelUrl.findOne({'shortUrl': req.params.urlToForward}, (err, data) => {
        if (err) {
            return res.send('Error reading database')
        } else {
            res.redirect(data.originalUrl)
        }
    })
})


app.listen(process.env.PORT || 5000, () => {
    console.log('Everything is working!!!')
})