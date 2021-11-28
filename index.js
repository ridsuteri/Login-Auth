require('dotenv').config();
const express = require('express');

const passport = require('passport');
const cookieSession = require('cookie-session');
require('./passport-setup');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieSession({
    name:'session',
    keys:['keyn1','keyn2']
}))

const isLoggedIn = (req,res,next) =>{
    if(req.user)
        next();
    else
        res.sendStatus(401);
}

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(__dirname + '/public'));
app.set("view engine","ejs");

app.get('/',(req,res)=>{
    res.render("pages/index");
})

app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/good', isLoggedIn, (req, res) =>{
    res.render("pages/profile",{name:req.user.displayName,pic:req.user.photos[0].value,email:req.user.emails[0].value})
})


// Auth Routes for google
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  }
);

// Auth routes for fb
app.get('/fb', passport.authenticate('facebook', { scope : 'email,user_photos' }));

app.get('/fb/callback',
  passport.authenticate('facebook', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/good');
  });

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

app.listen(PORT,()=>{
    console.log(`App is up and running on ${PORT}`)
})