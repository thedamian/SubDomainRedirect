const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const low = require('lowdb');
const shortid = require('shortid')
const FileSync = require('lowdb/adapters/FileSync')
require('dotenv').config(); 
const db = low(new FileSync('redirects.json'))
db.defaults({ redirects: [] }).write();
const app = express();
const bodyParser = require('body-parser'); // to parse "POST"
app.use(bodyParser.urlencoded({ extended: false })); // Part of "parsing POST"
app.enable('trust proxy');

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, `/views`)); 



// The redirect code

// Main redirection code
let redirectPage = async (req,res) => {
    let Fullhost = req.get('host');
    host = Fullhost.split('.')[0];

     const url = db.get('redirects').find({ host:host }).value();
       if (url) {
           console.log("redirecting to",url.redirect);
         return res.redirect(url.redirect);
       } else {
            let mainhostArr = Fullhost.split('.');
            let mainhost = mainhostArr[mainhostArr.length-2]+"."+mainhostArr[mainhostArr.length-1];
            console.log("redireting to http://" + mainhost);
            return res.redirect("http://" + mainhost);
       }
};
app.get('/', async (req, res) => {redirectPage(req, res)});
//app.get('/:id', async (req, res) => {redirectPage(req, res)});



//admin section -- locked out

// Limit access to backend so we don't have worry about being attached on the backend
const rateLimit = require('express-rate-limit')({
  windowMs: 30 * 1000,
  max: 10,
});
app.use(rateLimit);
const slowDown = require('express-slow-down')(
  {
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }
);
app.use(slowDown);

const auth = require('./auth');
app.use(auth); // you authentication for anything below
// delete
app.get('/newUrl/:id', async (req,res,next) => {
    const id = req.params.id;
    const existing =  db.get('redirects').remove({id:id}).write();
    console.log("deleted",existing)
    const latestRedirects = db.get('redirects').sortBy('host').value();
    res.render("new",{redirects:latestRedirects});
});
app.get('/newUrl', async (req,res) => {
    const latestRedirects = db.get('redirects').sortBy('host').value();
    console.log("latestRedirects",latestRedirects)
    res.render("new",{redirects:latestRedirects})
});

app.post('/newUrl', async (req,res,next) => {
    const {host,redirect} = req.body;
   // console.log("posted",req.body);

    try {
        if (host && redirect)
        {
           // console.log("yeah1");
           const existing =  db.get('redirects').find({ host: host }).value();

            if (existing) {
                console.log("update", req.body);
                existing =  db.get('redirects').find({ host: host }).assign({ redirect: redirect}).write();
            } else {
               console.log("added", req.body);
               const created = await db.get('redirects').push({id:shortid.generate() ,host:host,redirect: redirect}).write();
            }
            //console.log("yeah2");
        }
        const latestRedirects = db.get('redirects').sortBy('host').value();
        res.render("new",{redirects:latestRedirects})
    } catch (error) {
        console.error(error);
        next(error);
    }
});


  app.use((error, req, res, next) => {
    if (error.status) {
      res.status(error.status);
    } else {
      res.status(500);
    }
    res.send(`<html><body>Error message: ${error.message}</body></html>`);
  });

  
  const port = process.env.PORT || 5008;
  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
