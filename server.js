var express = require('express');
var fs = require('fs');
var app = express();

// MongoDB inserts start
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var connectionString = 'mongodb://mongo/people';
mongoose.connect(connectionString, { useMongoClient: true });
app.use(express.json());
app.use(express.urlencoded({extended: false}));

var db = mongoose.connection;

var Schema = mongoose.Schema;

var PersonSchema = new Schema({
    name: String,
    age: Number,
});

var PersonModel = mongoose.model('PersonModel', PersonSchema);
// MongoDB inserts stop

app.get('/', function(req, res) {
    var indexFile = fs.readFileSync('./index.html');
    res.end(indexFile);
});

app.get('/file', function(req, res) {
    fs.writeFileSync('/datavolume/test.txt', "alksjflaksdjflksldfkjsdf");
    res.end("OK");
});

app.get('/read', function(req, res) {
    var result = fs.readdirSync('/datavolume');
    res.json(result);
});

// new request functions
app.post('/create_person', function(req, res) {
    var person = {
        name: req.body.name,
        age: req.body.age
    };
    PersonModel.create(person, function(err, data) {
        if (err) return res.json({Error: "could not create new person.", details: err});
        res.json(person);
    });
});

app.get('/show_all', function(req, res) {
    PersonModel.find({}, function(err, data) {
        if (err) return res.json({Error: "Error: could not communicate with database.", details: err});
        res.json(data);
    });
});
// new request functions

app.listen(3000);

console.log("Server listening on port 3000");