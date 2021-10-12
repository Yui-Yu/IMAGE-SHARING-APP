"use strict";

/*
require modules
 */
var express = require("express");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var session = require("express-session");
var mysql = require("mysql");
var log;
var images;
var comments = [];


var port=8000;

/*
Create our express app object
*/
var app = express();

/*
Configure middlewares
 */
app.use(session({secret: "ttgfhrwgedgnl7qtcoqtcg2uyaugyuegeuagu111",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 600000}}));

app.use(express.static("static"));
app.set("view-engine", "ejs");
app.set("views", "templates");
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

var con = mysql.createConnection({
    host: "localhost",
    user: "root", // your username
    password: "12345678", // your own MySQL password
    database: "project2_db", // the name of your database
    multipleStatements:true
});

// connect to the DB
con.connect( function(err) {
    if (err) {
        console.log("Error: "+err);
    } else {
        console.log("Successfully connected to DB");
    }
});


/*
Configure application Routes
 */

app.get("/", function(req, res) {
    var sessionData = req.session.data;
    var sql = `SELECT * FROM project2_db.images`;
    con.query(sql,function (err,results) {
        if (err){
            res.send("A database error occurred: "+err);
        } else {
            images = results;
            if (sessionData) {
                log = true;
                res.render("home.ejs",{images, log});
            } else {
                log = false;
                res.render("home.ejs",{images, log});
            }
        }

    });
});



app.get("/login", function(req, res) {
    res.render("login.ejs");
})

app.get("/register", function(req, res){
    res.render("register.ejs");
});



app.post("/profile", function(req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var sql1 = "SELECT username FROM project2_db.user_name WHERE username = '"+user+"' AND password = '"+pass+"';";
    con.query(sql1, function(err, result) {
        if(err){
            throw err;
        }
        if(result.length > 0) {
            req.session.data = user;
            res.render("profile.ejs");
        }

        else {
            res.redirect("/");
        }
    });

});

app.post("/registered", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var usersinfo = `SELECT * FROM project2_db.user_name`;
    var flag = 0;
    con.query(usersinfo, function (err, results) {
        if (err) {
            res.send("A database error occurred: " + err);
        } else {
            if (results.length > 0) {
                for (var j in results) {
                    if (username == results[j].username) {
                        flag = 1;
                        break;
                    }
                }
                if (flag == 1) {
                    res.render("register.ejs");
                    alert("This username is occupied, please enter another one!");
                }
                else {
                    var sql2 = `INSERT INTO user_name (username, password) VALUES ("${username}", "${password}")`;
                    con.query(sql2);
                    req.session.data = username;
                    res.render("registered.ejs");
                }
            }
            else {
                res.send("No results returned");
            }
        }
    });
});


app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/upload", function(req, res) {
    res.render("uploads.ejs");
});

app.post("/uploaded", function(req, res) {
    var file = req.files.myimage;
    var imgname = file.name;
    var imgurl = "/uploads/" + file.name;
    var uploader = req.session.data;
    var uploadtime = new Date();
    var timedisplay = uploadtime.toDateString()
    file.mv("static/uploads/"+file.name);
    var sql3 = `INSERT INTO images (src, uploadtime, username, imgname, likes) VALUES ("${imgurl}", "${timedisplay}", "${uploader}", "${imgname}", 0)`;
    con.query(sql3, function(err, results) {
    if (err) {
            res.send("A database error occurred: " + err);
        }
    else {
        res.render("uploaded.ejs", {"filename": file.name});
    }
    });
});



app.post("/comment", function(req, res) {
    var commenter = req.session.data;
    var commentimg = req.body.commentimg;
    var content = req.body.comment;
    if (commenter != null) {
        var sql4 = `INSERT INTO comments (username, imgname, content) VALUES ("${commenter}", "${commentimg}", "${content}")`;
        con.query(sql4, function (err) {
            if (err) {
                res.send("A database error occurred: " + err);
            } else {
                console.log(content, commentimg, commenter);
                res.send({"commenter": commenter, "content": content});
            }
        });
    }
    else {
        res.send("login");
    }
});

app.get("/image/:imgid", function(req, res) {
    var imgsource = req.params.imgid;
    var liker = req.session.data;
    console.log(liker);
    var data;
    var sql7= "SELECT * FROM project2_db.comments WHERE imgname = (SELECT imgname FROM images WHERE idimages='"+imgsource+"');"
    var sql8 = "SELECT idlikes FROM project2_db.likes WHERE username = '"+liker+"' AND imgname = (SELECT imgname FROM images WHERE idimages='"+imgsource+"');"
    var sql9 = "SELECT * FROM project2_db.images WHERE imgname = (SELECT imgname FROM images WHERE idimages='"+imgsource+"');"
    con.query(sql7+sql8+sql9, function(err, results) {
        if(err) {
            throw err;
        }
        else {
            console.log(results);
            data = results;
            res.render("subpages.ejs", {data, log});
        }
    })
});

app.post("/like", function(req, res) {
    var liker = req.session.data;
    var likeimg = req.body.likeimg;
    console.log(liker);
    if (liker != null) {
        var sql5 = `INSERT INTO likes(username, imgname) VALUES ("${liker}", "${likeimg}")`;
        var sql6 = `UPDATE images SET likes=likes+1 WHERE imgname="${likeimg}"`;
        con.query(sql5, function(err, results) {
            if(err) {
                throw err;
            }
            else {
                con.query(sql6, function(err, results) {
                    if(err) {
                        throw err;
                    }
                    else {
                        res.send("done");
                    }
                });
            }
        });
    }
    else {
        res.send("login");
    }

});



/*
Start the server
 */
app.listen(port);
console.log("Server running on http://localhost:"+port);

