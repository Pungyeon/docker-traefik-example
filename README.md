### Docker Compose

So, last week we spoke about how to containerise a NodeJS application with Docker. 

### Prerequisites

I will be using an Ubuntu 16.04 for this tutorial, but feel free to use your operating system of choice! Docker is available for Windows, Mac OSX and Linux, so I suggets using whatever your are already comfortable with. To install docker, follow the instruction from the official docker site: 

Ubuntu
https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-using-the-repository

Mac OSX
https://docs.docker.com/docker-for-mac/install/#install-and-run-docker-for-mac

Windows
https://docs.docker.com/docker-for-windows/install/

We will also need Nodejs for this tutorial, which can be installed from: https://nodejs.org/en/

Now, use your favourite text-editor for this, there is no requirements there. However, I prefer and recommend using Visual Code, which you can get for free here: https://code.visualstudio.com/

All the code written in this tutorial can be found at https://github.com/Pungyeon/docker-compose-example

Alright, enough prerequisites and installing! Let's get on with it!

### Initialising our project

So to make things easy, so that we don't have to start from scratch, let's clone last weeks project:

> git clone https://github.com/Pungyeon/docker-example

Now, we can go into our new directory `docker-example` and run `npm install`, which will download all the dependencies and packages that we need to run our NodeJS server. We will also need to add a new package, called 'mongoose', which will help us interact with MongoDB. To install mongoose, run the following command:

> npm install --save mongoose

We will also be writing some routing for post requests in our server and for parsing the body of our requests, we will be using an express library `body-parser`. So let's this library as well using npm:

> npm install --save body-parser

Great, now we are all setup to start writing some code. If you prefer not writing any code or build files yourself, you can simply clone the `https://github.com/Pungyeon/docker-compose-example` repository instead.

### NodeJS Server

So, first things first, we will edit out already existing NodeJS server code to add some database functionality.

> 'server.js'
```javascript
var express = require('express');
var fs = require('fs');
var app = express();

// MongoDB inserts start
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var connectionString = 'mongodb://mongo/people';

app.use(express.json());
app.use(express.urlencoded({extended: false}));

mongoose.connect(connectionString, { useMongoClient: true });
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
```
What we have added is the 'mongoose' library, which as mentioned previously, is to create our database connection. This is what we achieve with the `connectionString` variable which we use to connect and store the connection in our `db` variable. Note, that the connection string is not to 'localhost:27017' (or similar), but simply to 'mongo'. This will be explained later.

We then go on to define a model for our database. This is just a simple database model, specifying that a Person in our database will simply contain a name and their age. 

Finally, we create our to new REST endpoint:
    '/show_all': which returns all of our stored users in our database.
    '/create_person': which will take `name` and `age` as inputs in our post body and insert them as a new  Person in our database.



### Putting it together with Docker Compose

Now that we have updated our server, we could essentially run this on a machine that had nodejs and mongodb installed, or setup two different servers, one with nodejs and one with mongodb. Either way we would have to change the connectionString either to a static string or pointing at some DNS record or load balancer.

However! With docker, there is a better way. Docker Compose. With docker compose, we define a file which can bundle together many different container images as part of a build. So, we can predefine the dependencies for our application and ensure that these dependencies are spun up. In our case, we know that we need both nodejs and mongodb. 

This is a simple docker compose file, which will start both a `web` server (our nodejs container we defined in my previous post) and a standard mongodb container.

``` yml
version: "2"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    links:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /data/db
    ports:
      - "27017:27017"
```

To learn more about docker and containerisation, I suggest the following sites: 

https://www.katacoda.com - Interactive lessons for Docker, kubernetes and much more!
https://www.docker.com/ - The official Docker website, with good documentation, as well as a sandbox environment for practicing docker.