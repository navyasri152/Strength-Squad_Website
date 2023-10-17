var express = require('express')  
var app = express()
var passwordHash = require('password-hash');

app.use(express.static('public'));

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");

var bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true}));
initializeApp({
    credential: cert(serviceAccount)
});
  
const db = getFirestore();
  
app.get('/signup', function (req, res) {  
res.sendFile( __dirname + "/public/" + "signup.html" );

  
})

  
app.post('/signupSubmit', function (req, res) { 
    db.collection("Users")
            .where('Username', '==', req.body.email)
            .get()
            .then((docs) => {
                if (docs.size > 0) {
                    res.send("email existed");
                } else {
                    db.collection('Users').add({
                        FullName:req.body.firstname,
                        Email:req.body.email,
                        Password:passwordHash.generate(req.body.password),
                    }).then(()=>{
                        res.sendFile( __dirname + "/public/" + "login.html" );
                    })
                }
       });
    })

app.get('/login', function (req, res){
    res.sendFile( __dirname + "/public/" + "login.html" );

})

app.post("/loginSubmit", function (req,res) {  
    db.collection('Users')
   .where("Email","==",req.body.email)
   .get()
   .then((docs) => { 

    let verified=false;
    docs.forEach(doc=>{
        verified=passwordHash.verify(req.body.password, doc.data().Password);
    })
    if(verified){
        res.sendFile(__dirname + "/public/" + "homepage.html");
    }
    else{
        res.send('Please check login credentials');
    }
    
   })
})

app.listen(3000);