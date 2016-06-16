module.exports = (app, passport)=>{
    // Home Page (With Login Links) //
    app.get('/', (req, res)=>{
        res.render('index.ejs');
    });

    // Login Form //
    app.get('/login', goToProfile, (req, res)=>{
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash   :  true
    }));

    // Signup Form //
    app.get('/signup', goToProfile, (req, res)=>{
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash   :  true
    }));

    app.get('/profile', isLoggedIn, (req, res)=>{
        res.render('profile.ejs',{user: req.user});
    });

    app.get('/logout', (req, res)=>{
        req.logout();
        res.redirect('/');
    });

    function goToProfile(req, res, next){
        if(req.isAuthenticated()){
            res.redirect('/profile');
        }else{
            return next();
        }
    }

    function isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    }
}