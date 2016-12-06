/* app.js */

//load modules
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//import configuration from config.js
var config = require('./config');

//load modules for authentication
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');

//Set authentication strategy
//More info https://github.com/AzureAD/passport-azure-ad/blob/master/README.md
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

//set view engine to ejs
app.set('view engine', 'ejs');

//set upp public directory to serve static files
app.use(express.static('public'));

//Initiate bodyParser to parse request body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Configure app for authentication
app.use(cookieParser());
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// Passport session setup.

//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
  findByEmail(id, function (err, user) {
    done(err, user);
  });
});

// array to hold logged in users
var users = [];

var findByEmail = function(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

// Use the OIDCStrategy within Passport.
// 
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier), and invoke a callback
//   with a user object.
passport.use(new OIDCStrategy({
    callbackURL: config.creds.returnURL,
    clientID: config.creds.clientID,
    identityMetadata: config.creds.identityMetadata,
    skipUserProfile: config.creds.skipUserProfile,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.email) {
      return done(new Error("No email found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByEmail(profile.email, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      });
    });
  }
));

//Initiate tedious db connection
var Connection = require('tedious').Connection;  
var DBconfig = {  
    userName: config.db.userName,  
    password: config.db.password,  
    server: config.db.server,  
    options: config.db.options  
};  
var connection = new Connection(DBconfig);  
connection.on('connect', function(err) {  
// If no error, then good to proceed.  
    console.log("Connected");
      
});

//Create request to be used when making SQL query
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

//Function to register a new meeting
function regMeeting(user,meeting, fn){
    request = new Request("INSERT INTO [dbo].[meetings]" +
           "([date],[title],[rating],[numvotes],[votes],[comments],[userid])" +
            "VALUES ('"+meeting.date+"','"+meeting.title+"',"+meeting.rating+","+meeting.numVotes+",'"+meeting.votes+"','"+meeting.comments+"','"+user.id+"')", function(err) {  
    if (err) {  
        console.log(err);  
    }else {
        console.log('Request OK');
        fn("Done");
    }

    }); 

    connection.execSql(request);
  
}

//Function to fetch all meetings
function getMeetings(user,fn){
    var retVal = '{"result":"No Data"}'

    var dataSet = []
    var request = new Request("SELECT * FROM [dbo].[meetings] WHERE userid LIKE '"+user.id+"'", function (err, rowCount) {

            if (err) {
                    console.log("Request error executeStatement -- " + err);
            } else {
                    console.log('Request OK your done rowCount: ' + rowCount );
                    retVal = dataSet;
                    fn(retVal);   //return
            }
    });

    request.on('row', function (columns) {
            var meeting = {
                id: columns[0].value,
                date: columns[1].value,
                title: columns[2].value,
                rating: columns[3].value,
                numVotes: columns[4].value,
                votes: columns[5].value,
                comments: columns[6].value
                }
            dataSet.push(meeting);
    });

    connection.execSql(request);   
}

//Function to update a meeting
function updateMeeting(meeting){
    console.log("UPDATE [dbo].[meetings] SET [rating] = "+ meeting.rating+
                                                        ",[numvotes] = "+ meeting.numVotes+
                                                        ",[votes] = '"+ JSON.stringify(meeting.votes) +"'"+
                                                        ",[comments] ='"+JSON.stringify(meeting.comments)+"'"+
                            "WHERE id=" +meeting.id);
    request = new Request("UPDATE [dbo].[meetings] SET [rating] = "+ meeting.rating+
                                                        ",[numvotes] = "+ meeting.numVotes+
                                                        ",[votes] = '"+ JSON.stringify(meeting.votes) +"'"+
                                                        ",[comments] ='"+ JSON.stringify(meeting.comments) +"'"+
                            "WHERE id=" +meeting.id, function(err) {  
    if (err) {  
        console.log(err);}  
    }); 

    connection.execSql(request);
} 


//Dummy data
var meetings = [
    {
        ID: 3466,
        date: "2016-11-26",
        title: "Möte om codersclub",
        completed: false,
        rating: 0,
        numVotes: 0,
        votes: [],
        comments: []
    },
    {
        ID: 3532,
        date: "2016-11-27",
        title: "Träffa kunden XX",
        completed: false,
        rating: 0,
        numVotes: 0,
        votes: [],
        comments: []
    },
    {
        ID: 8863,
        date: "2016-11-22",
        title: "Ska vi ha fika?",
        completed: true,
        rating: 2.8,
        numVotes: 5,
        votes: [2,3,3,2,4],
        comments: ["Hej hopp"]
    }    

]

function getDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    return yyyy+"-"+mm+"-"+dd
}


//Define routes

//Define the root route
app.get('/', ensureAuthenticated,(req, res) => {
    getMeetings(req.user,(data) => {
        var notCompletedMeetings = [];
        data.filter((meeting) => {
            today = new Date(getDate());
            meetingDate = new Date(meeting.date);
            if (meetingDate >= today) {
                notCompletedMeetings.push(meeting);
            }
        });         
        //render home.ejs
        res.render('home', {meetings: notCompletedMeetings, user: req.user});
    }); 
});

app.post('/', ensureAuthenticated, (req, res) => {
    meeting = {title:req.body.titel, date: req.body.date, completed: false, rating: 0, numVotes: 0, comments: [], votes: []};
    regMeeting(req.user,meeting, () =>{
        //render home.ejs    
        getMeetings(req.user,(data) => {
            var notCompletedMeetings = [];
            data.filter((meeting) => {
                today = new Date(getDate());
                meetingDate = new Date(meeting.date);
                if (meetingDate >= today) {
                    notCompletedMeetings.push(meeting);
                }
            });         
            //render home.ejs
            res.redirect('/');
        }); 
    });
    

});

app.get('/history', ensureAuthenticated,(req, res) => {
    //render history.ejs for completed meetings
    getMeetings(req.user,(data) => {
        var completedMeetings = [];
        data.filter((meeting) => {
            today = new Date(getDate());
            meetingDate = new Date(meeting.date);
            if (meetingDate <= today) {
                completedMeetings.push(meeting);
            }
        });         
        //render home.ejs
        res.render('history', {meetings: completedMeetings});
    }); 
});

app.get('/details/:id', ensureAuthenticated, (req, res) => {
    //render details.ejs for specific meeting
    getMeetings(req.user,(data) => {
        var meeting = data.filter((meeting) => {
            return meeting.id == req.params.id
        })[0]
        console.log(meeting.comments);
        if(meeting.comments === ''){meeting.comments = '["Ingen kommentar än"]'}
        console.log(meeting.comments);
        res.render('details', {
            date: meeting.date,
            title: meeting.title,
            completed: meeting.completed,
            rating: meeting.rating,
            numVotes: meeting.numVotes,
            votes: meeting.votes,
            comments: JSON.parse(meeting.comments)
        });
    });
});

app.get('/vote/:id',(req, res) => {
    //render vote.ejs for specific meeting
    var user = {
        id:'%'
    };
    getMeetings(user,(data) => {
        var meeting = data.filter((meeting) => {
            return meeting.id == req.params.id
        })[0]
        res.render('vote', {
            id: meeting.id,
            title: meeting.title,
            date: meeting.date
        });
    });

});

app.post('/doVote/:id',(req, res) => {
    var user = {
        id:'%'
    };
    getMeetings(user,(data) => {
        data.filter((meeting) => {
            if(meeting.id == req.params.id){
                if(meeting.votes === ''){
                    console.log("empty/new vote");
                    meeting.votes = [req.body.rating];
                }
                else {
                    console.log("meeting.votes is not empty: '" + meeting.votes+"'");
                    meeting.votes = JSON.parse(meeting.votes)
                    meeting.votes.push(req.body.rating);
                }
                
                if(req.body.comment != ''){
                    if(meeting.comments === ''){
                        meeting.comments = [req.body.comment];
                    }
                    else {
                        meeting.comments = JSON.parse(meeting.comments);
                        meeting.comments.push(req.body.comment);
                    }
                }

                meeting.numVotes++;

                tempRating = 0
                for(var i=0;i<meeting.votes.length;i++){
                    tempRating = parseFloat(tempRating) + parseFloat(meeting.votes[i])
                }

                meeting.rating = (tempRating / meeting.numVotes).toPrecision(2);

                updateMeeting(meeting);
            }
        })

        res.render('doVote');
    });
});

app.get('/login',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/');
});

// POST /auth/openid
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in OpenID authentication will involve redirecting
//   the user to their OpenID provider.  After authenticating, the OpenID
//   provider will redirect the user back to this application at
//   /auth/openid/return
app.get('/auth/openid',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/openid/return',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.post('/auth/openid/return',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/');
  });

// Simple route middleware to ensure user is authenticated. (Section 4)

//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));