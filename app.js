const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {exec} = require('child_process');
const path = require('path');
const multer = require('multer');
const options = multer.diskStorage({destination: 'public', 
filename: function(req, file, cb) {
    cb(null, 'input' + path.extname(file.originalname));
}})
const upload = multer({storage: options});
const fs = require('fs');

// EXPRESS APP CONFIGURATION
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //to serve static files 

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/vis", upload.single('inputImage'), (req, res) => {
    var formData = req.body.settings;
    var settings = {
        BACKGROUND: formData.bg,
        IMGBORDER: formData.imgBorder,
        EDGE: formData.edge,
        NEG_LINE_COLOR: formData.neg,
        POS_LINE_COLOR: formData.pos,
        DPI: 300
    }
    var settingsJSON = JSON.stringify(settings);
    fs.writeFile('public/vars.txt', settingsJSON, (err) => {
        if (err) {
            console.log(err.message);
            res.redirect('/');
        } else {
            const ls = exec('/anaconda3/envs/afouras1_env/bin/python vis.py', (err, stdout, stderr) => {
                if (err) {
                    console.log(err.message);
                    res.redirect('/');
                } else {
                    console.log(stdout);
                    console.log(stderr);
                    console.log("rendering visualisation...");
                    res.render("index.ejs");
                }
            });
        }
    }); 
});

app.get('/download', (req, res) => {
    res.download('public/output.png');
})

app.listen(3000, (err) => {
    if (err) {
        alert("could not connect to server", err.message);
    } else {
        console.log("Connected to server on port 3000.");
    }
});

