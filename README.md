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

app.get('/', function(req, res) {
    var indexFile = fs.readFileSync('./index.html');
    res.end(indexFile);
});

app.listen(3000);

console.log("Server listening on port 3000");
```
Basically, this loads up 'express' and 'fs' modules. Express is a easy way to write web-servers in nodejs, and fs is the default library for interacting with the filesystem. with 'app.get' we specify what should happen on the url '/' (so in our case 'https://localhost:3000') and finally we tell our server to listen on port 3000 and write to our console that this is what our server is listening on port 3000.

We will also create an index.html file, which will be a very simple html file printing out "Hello World!"

> index.html
```html
<p>Hello World!</p>
```

Now we can run our server with: `npm start`, which will respond with a 'Server listening on port 3000'. Furthermore, you can direct a browser to http://localhost:3000 and see your 'Hello World' message, which we put in the index.html file. 

### Containerising with Docker

If all goes well, we can now create our Dockerfile, for building our nodejs docker container. This file will look like this: 

``` dockerfile
FROM node:latest
RUN mkdir -p /src/app
WORKDIR /src/app
COPY package.json /src/app/package.json
RUN npm install
COPY . /src/app
EXPOSE 3000
CMD [ "npm", "start" ]
```

In this file, we are telling docker to use the base image node:lastest, which is a nodejs base image. In this container, we will create a new folder /src/app and making it the working directory for the rest of our Dockerfile. We will copy our package.json file and run npm install, to ensure that we have the right packages and modules installed for our nodejs server. Then we will copy everything in our project folder to this new working directory and expose port 3000 on the container. Finally, we will run the server with npm start.

Now this looks great and all, but we have one small issue. We are copying the node_modules folder into the docker container, after having run npm install, which retrieves\installs all the necessary packages into a node_modules folder of it's own. So, to avoid this unecessary action, we will make a .dockerignore file, which will contain what to ignore, when copying the files to our container:

> .dockerignore
``` html
node_modules
```

Now we can build our docker container! :clap:

> docker build -t my-nodejs-server .

The '-t' parameters specifies a friendly name for our image, which we can re-use to run the container, once docker is finished building, we can see all our available local images with the `docker ps` command. To run our newly built container, we will use the command:

> docker run -d --name node-server -p 3000:3000 my-nodejs-server

Again, the `-p 3000:3000` specifying which ports to expose. We can make sure that our container is running as expected, using the ps command, which will list all our running containers: 

> docker ps

Now, finally to test that everything is working as expected, we can use a browser to test that indeed our nodejs server is working as expected on http://localhost:3000, returnning 'Hello World!'.

Of course, we can also use curl, to do the same.

> curl http://localhost:3000

That's that! So easy, huh? So there is no excuse not to be containerising all your applications and start practicing and eventually deploying with docker containers. 

To learn more about docker and containerisation, I suggest the following sites: 

https://www.katacoda.com - Interactive lessons for Docker, kubernetes and much more!
https://www.docker.com/ - The official Docker website, with good documentation, as well as a sandbox environment for practicing docker.