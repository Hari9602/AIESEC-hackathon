    const express = require("express");
    const path = require("path");
    const collection = require("./config");
    const bcrypt = require('bcrypt');

    const app = express();
    
    app.use(express.json());//data into json format
    
    app.use(express.static("public"));// static file

    

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "indexx.html"));
});// define route to serve indexx as default route



    app.use(express.urlencoded({ extended: false }));//parse incoming url encoded data
   
    app.set("view engine", "ejs"); //use ejs as the viewengine

    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.get("/signup", (req, res) => {
        res.render("signup");
    });

    // register user
    app.post("/signup", async (req, res) => {

        const data = {
            name: req.body.username,
            password: req.body.password
        }

        // check username already exists in the database
        const existingUser = await collection.findOne({ name: data.name });

        if (existingUser) {
            res.send('User already exists. Please choose a different username.');
        } else {
            // hash pass using bcrypt
            const saltRounds = 10; // no of rounds for bcrypt
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword; // replace the orig pass with the hashed one

            const userdata = await collection.insertMany(data);
            console.log(userdata);
        }

    });


    // login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("User name not found");
        }
        
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.send("Incorrect password");
        }
        
        // if login successful, redirect the user to index
        res.redirect("/");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login. Please try again later.");
    }
});


    
    const port = 5000; //we are defining port
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    });

