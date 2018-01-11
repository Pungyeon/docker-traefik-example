### Traefik

So, in my last post (https://github.com/Pungyeon/docker-example) I wrote about docker and containerisation, using a NodeJS web app as an example of how easy it is to containerise an application. In this post, I will talk a little about how 

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

So, first things first, we will edit our already existing NodeJS server code to add some database functionality.

> 'server.js'
```javascript
var express = require('express');
var fs = require('fs');
var os = require('os');

var app = express();

app.get('/', function(req, res) {
    var hostInfo = {
        hostname: os.hostname(),
        network: os.networkInterfaces()['eth0'][0].address
    }
    res.json(hostInfo);
});

app.listen(3000);

console.log("Server listening on port 3000");
```
So all we have changed in our server file is that we have imported the 'os' variable, which we will use to retrieve operating system information. We have also changed the '/' path to return the host information instead of our index.html file. The host information will include the hostname and ip-address of the docker container.

### Putting it together with Docker Compose

The reason why we want to have our server responding with host information, is because of what we will do next. We will write a docker-compose file, which essentially is a file that can specify many different docker images to be spun up simultaneously. As an example, you can spin up a web server, a database and a backend server with the same docker-compose file. However, what we will do, is simply define a load-balancer/reverse-proxy, traefik and our web server.

``` yml
version: "2"
services:
  traefik:
    image: traefik
    command: --web --docker --docker.domain=docker.localhost --logLevel=DEBUG
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /dev/null:/traefik.toml
  web:
    build: .
```

For traefik, we will define the image traefik, which will be pulled from the traefik docker repository. The command will specify the runtime commands for traefik, the most important one here being the `--docker.domain` which will determine the hostnames for our containers. By default, the hostname will be the container name prepended to the domain name specified in this command. So in our case, our `web` server, will become `web.docker.localhost`. 

Under ports we will specify will ports to expose and what they are mapped to. We will expose port 80 for communicating with our web server through HTTP and port 8080 for communicating with the traefik dashbaord. Under volumes, we can define some persistent volumes for the container. Essentially, these are folders on the host running the docker containers that ensure if we stop and start the docker container, we won't lose previous data.

Lastly, we will define our `web` service. For the build, we will use the Dockerfile we defined in my last post, by referring to the current path with `.`. 

### Running our setup

Great, all we need to do now is build our images.

> docker-compose build

... and then run our docker-compose build

> docker-compose run -d 

The `-d` flag ensuring that we will run the services in the background. Now, we can visit our traefik dashboard at http://localhost:8080 and have a look at our running containers. On the bottom of the dashboard, you will be able to see a routing rule for our web server, with a host name similar to `Host:web.dockercomposeexample.docker.localhost`. This is the hostname that our webserver has received from our traefik reverse-proxy. To ensure that everything is working, let's send off a request!

> curl -H Host:web.dockercomposeexample.docker.localhost http://localhost

If all goes well, we will receive a response including the hostname and ip-address of our web server. So, you might be thinking: "I'm pretty sure we were able to do this without the docker-compose file and the traefik reverse-proxy. Why did we go through all that?". I'll show you.

So, let's imagine that our web service has become extremely popular and it's receiving more requests than single-core nodejs can handle. No problem!

> docker-compose scale web=3

The command above will ensure that we have three concurrent web services running. In other words, this will add 2 running web servers to our running config. You can check out your traefik dashboard and confirm that this is the case. Traefik will now load-balance our requests to these three servers, without us having to change any configs, traefik takes care of updating it's routes by retrieving information about change in services from docker and changing it's routes accordingly. We can confirm that our load-balancing is working by sending a few of our requests again.

> curl -H Host:web.dockercomposeexample.docker.localhost http://localhost

If all is well, we will see differing requests, depending on which hosts are responding to our requests.

Wow, so cool, huh? We are pratically docker gods by now...... Well, not really, there is still so much to learn. Running containers on a single machine is cool, but it's not quite how production works. To get into container clustering, we will have to take a look at Kubernetes, Docker Swarm, CoreOS or one of the other many solutions for container orchestration. Maybe that will be the next post, either way, I hope this post gave a little taste to the power of containers and the scalability that comes along with them. Either way, feedback is very welcome!

To shutdown our docker-compose services, run the following command:

> docker-compose down

Thanks for reading!

To learn more about docker and containerisation, I suggest the following sites: 

https://www.katacoda.com - Interactive lessons for Docker, kubernetes and much more!
https://www.docker.com/ - The official Docker website, with good documentation, as well as a sandbox environment for practicing docker.

To learn something about container orchestration, I suggets:
https://kubernetes.io - Google's conatiner orchestration platform

...and to find more tools for containers, like traefik, I suggest:
https://www.cncf.io/ - Cloud Native Computing Foundation, hosted projects.