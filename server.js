#!/usr/bin/env node

'use strict';

var http = require('http');

const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
const fs = require('fs');
const qs = require('querystring');

// Create a new server
var server = new http.Server();  

// Folder with the public resources
var public_folder = 'public/';

// Talk to resume corpus
const resumeDiscovery = new DiscoveryV1({
    username: '63cef256-5a8f-4f3e-a0c7-51e2af62fb09',
    password: 'lWxjxYIqPBTl',
    version_date: DiscoveryV1.VERSION_DATE_2017_08_01
});

// Talk to job corpus
const jobDiscovery = new DiscoveryV1({
    username: '63cef256-5a8f-4f3e-a0c7-51e2af62fb09',
    password: 'lWxjxYIqPBTl',
    version_date: DiscoveryV1.VERSION_DATE_2017_08_01
});


// Error messages
function returnError(code, message, response) {
	response.writeHead(code, {'Content-Type': 'text/html'});
	response.end(message);
};

// Server request processing
server.on("request", function (request, response) {

    var url = require('url').parse(request.url);
    
    // If the request was a POST, then a client is posting a new message
    if (request.method === "POST") {
        // Upload endpoint
        if (url.pathname === '/upload/') {
            request.setEncoding("utf8");
            
            var body = "";
            request.on("data", function(chunk) { body += chunk; });
            request.on("end", function() {
                
                // Parse user input
                body = qs.parse(body)["bodytext"];
                
                // Discovery service query
                jobDiscovery.query({
                    environment_id: 'c17ff0d9-2b3e-4485-8272-666f38393f37',
                    collection_id: '98f01726-9556-4254-8b72-99da18277dfd',
                    query: body
                }, function(err, response) {
                    if (err)
                        console.error(err);
                    else 
                        fs.writeFileSync('public/data.json', JSON.stringify(response, null, 4), "utf8");
                });
                
                response.writeHead(301, {Location: 'http://cognitive-frontend-asanti.c9users.io/visualization.html'} );
                response.end();
                return response;
            });
        }
        else {
            returnError(404, "Path not found", response);
        }
    }
    // Serve up 
    else {
        
        // Assume this is a file request, parse the requested URL

        // Get local filename and guess its content type based on its extension.
        var filename = url.pathname.substring(1); // strip leading /
        var type;
        
        // default file
        if (filename == '') {
            filename = public_folder + 'index.html';
        }
        else {
            filename = public_folder + filename;
        }
        
        console.log('Requested file: ' + filename);
        
        switch(filename.substring(filename.lastIndexOf(".")+1))  { // extension
            case "html":
            case "htm":      type = "text/html; charset=UTF-8"; break;
            case "js":       type = "application/javascript; charset=UTF-8"; break;
            case "css":      type = "text/css; charset=UTF-8"; break;
            case "txt" :     type = "text/plain; charset=UTF-8"; break;
            case "manifest": type = "text/cache-manifest; charset=UTF-8"; break;
            case "json":     type = "application/json; charset=UTF-8"; break;
            default:         type = "application/octet-stream"; break;
        }
        
        // Read the file asynchronously and pass the content as a single
        // chunk to the callback function. For really large files, using the
        // streaming API with fs.createReadStream() would be better.
        fs.readFile(filename, function(err, content) {
            if (err) {  // If we couldn't read the file for some reason
                response.writeHead(404, {    // Send a 404 Not Found status
                    "Content-Type": "text/plain; charset=UTF-8"});
                response.write(err.message); // Simple error message body
                response.end();              // Done
            }
            else {      // Otherwise, if the file was read successfully.
                response.writeHead(200,  // Set the status code and MIME type
                                   {"Content-Type": type});
                response.write(content); // Send file contents as response body
                response.end();          // And we're done
            }
        });
    }
});


server.listen(process.env.PORT, process.env.IP, function() {
  console.log('Server running on %s, port: %d', process.env.IP, process.env.PORT);
});