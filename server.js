const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));
const authFile = fs.readFileSync(path.join(__dirname, 'static', 'auth.js'));
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));
const registerFile = fs.readFileSync(path.join(__dirname, 'static', 'register.html'));
const loginFile = fs.readFileSync(path.join(__dirname, 'static', 'login.html'));
const server = http.createServer((req, res) => {
  if(req.method === 'GET') {
    switch(req.url) {
      case '/': return res.end(indexHtmlFile);
      case '/script.js': return res.end(scriptFile);
      case '/auth.js': return res.end(authFile);
      case '/style.css': return res.end(styleFile);
      case '/register': return res.end(registerFile);
      case '/login': return res.end(loginFile);
    }
  }
  if(req.method === 'POST') {
    switch(req.url) {
      case '/api/register': return registerUser(req, res);
      case '/api/login': return login(req, res);
    }
  }
  return res.end('Error 404');
});
function registerUser(req, res) {
    let data = '';
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', async function() {
      try {
        const user = JSON.parse(data);
        if(!user.login || !user.password) {
          return res.end('Empty login or password');
        }
        if(await db.isUserExist(user.login)) {
          return res.end('User already exist');
        }
        await db.addUser(user);
        return res.end('Registeration is successfull');
      }
      catch(e) {
        return res.end('Error: ' + e);
      }
    });
}

function login(req, res) {
  let data = '';
  req.on('data', function(chunk){
    data += chunk;
  });
  req.on('end', async function(){
    try{
      const user = JSON.parse(data);
      const token = await db.getAuthtoken(user);
      validAuthToken.push(token);
      res.writeHead(200);
      res.end(token);
    }
    catch(e){
      res.writeHead(500);
      return res.end('Error:' + e);
    }
  });
}

server.listen(3000);
const { Server } = require("socket.io");
const io = new Server(server);
io.on('connection', async (socket) => {
  console.log('a user connected. id - ' + socket.id);
  let userNickname = 'admin';
  let messages = await db.getMessages();
  socket.emit('all_messages', messages);
  socket.on('new_message', (message) => {
    db.addMessage(message, 1);
    io.emit('message', userNickname + ' : ' + message);
  });
});