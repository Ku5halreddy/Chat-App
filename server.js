
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
        else if(object.action=='leaveRoom'){
            //object=>{'action':'leaveRoom', 'username':'', 'roomname':''}
           let room= rooms.get(object.roomname);
           if(room){
            room.delete(object.username);
            room.forEach((client)=>{
                object.newRoom=false;
                client.connection.send(JSON.stringify(object));
            })
           }           
        }
        else if(object.action=='sendMessage'){
            
            room.forEach(function (client) {
                object.newRoom=true;
                client.connection.send(JSON.stringify(object));
             //   console.log(++i)
            });
        }
        else if(object.action=='login'){
           
            let password=users.get(object.username);
            let errorMessage=''
            if(password){
                if(password==object.password){
                    errorMessage='Login Successful';
                    socket.send( JSON.stringify({"action":"login","username":object.username , "errorMessage":errorMessage}));
                }
                else{
                    errorMessage='invalid credentials';
                    socket.send(JSON.stringify({"action":"login","username":'', "errorMessage":errorMessage}));
                }
            }
            else{
                errorMessage='No user found with given userName';
                socket.send(JSON.stringify({"action":"login","username":'' , "errorMessage":errorMessage}));
            }
           
        }
        else{
            console.log(object)
        }
       // console.log(rooms)
        
    });

    socket.on('close', function ()  {
        console.log('Client disconnected:'+socket._sockname);
    })

});

console.log( (new Date()) + " Server is listening on port " + PORT);