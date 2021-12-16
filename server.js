const {parse, stringify} = require('flatted');
const WebSocket = require('ws');


const PORT = 3000;

const wsServer = new WebSocket.Server({
    port: PORT
});

const rooms= new Map();
const users=new Map();
users.set('user1','password123');
users.set('user2', 'password123');
users.set('user3','password123');


wsServer.on('connection', function (socket,req) {
    //var soc=socket;
    console.log("A client just connected:"+req.url);
    socket._sockname=req.url;
    // Attach some behavior to the incoming socket
    //creds->{username:'', password:''}
    socket.on('login',(creds)=>{
        var credentials=JSON.parse(creds);
        let password=users.get(credentials.username);
        let errorMessage=''
        if(password){
            if(password==credentials.password){
                errorMessage='Login Successful';
                socket.emit('login', JSON.stringify({"username":credentials.username , "errorMessage":errorMessage}));
            }
            else{
                errorMessage='invalid credentials';
                socket.emit('login', JSON.stringify({"username":'', "errorMessage":errorMessage}));
            }
        }
        else{
            errorMessage='No user found with given userName';
            socket.emit('login', JSON.stringify({"username":'' , "errorMessage":errorMessage}));
        }
       
    })

    socket.on('message', function (msg) {
        var object = JSON.parse(msg);
        console.log("Received message from client: "  + JSON.stringify(object));
        // socket.send("Take this back: " + msg);
        let room =rooms.get(object.room);
        if(object.action=='joinRoom'){
            
            if(room){
                room.forEach(function (client) {
                    
                    //client.connection.send(object.sentby+' has joined the room');
                    client.connection.send(JSON.stringify(object));
                });
                room.set({user: object.sentby},{connection :socket} )
            
            }
            else{
                let tempRoom=new Map();
                tempRoom.set({user: object.sentby},{connection:socket });
                rooms.set(object.room, tempRoom)
            }
          
        }
        else if(object.action=='sendMessage'){
            //console.log(object.text)
           // let i=0;
            room.forEach(function (client) {
               // console.log(client);
                client.connection.send(JSON.stringify(object));
             //   console.log(++i)
            });
        }
        else{
            console.log(object)
        }
       // console.log(rooms)
        
    });

    socket.on('close', function ()  {
        console.log('Client disconnected:'+socket._sockname)
    })

});

console.log( (new Date()) + " Server is listening on port " + PORT);