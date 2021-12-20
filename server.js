
const WebSocket = require('ws');


const PORT = 3000;

const wsServer = new WebSocket.Server({
    port: PORT
});

const rooms= new Map();
const users=new Map();
users.set('user1','1234');
users.set('user2', '1234');
users.set('user3','1234');


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
                room.set({user: object.sentby},{connection :socket} )
                room.forEach(function (client) {
                    object.createRoom=false;
                    //client.connection.send(object.sentby+' has joined the room');
                    client.connection.send(JSON.stringify(object));
                });
               
            
            }
            else{
                let tempRoom=new Map();
                object.createRoom=true;
                tempRoom.set({user: object.sentby},{connection:socket });
                socket.send(JSON.stringify(object));
                rooms.set(object.room, tempRoom)
                console.log('success')
            }
          
        }
        else if(object.action=='leaveRoom'){
            //object=>{'action':'leaveRoom', 'username':'', 'roomname':''}
           let room= rooms.get(object.roomname);
           if(room){
               if( room.delete(object.username)){
                object.deleteRoom=true;
                room.forEach((client)=>{
                    client.connection.send(JSON.stringify(object));
                })
                socket.send(JSON.stringify(object))
               }
               else{
                object.deleteRoom=false;
                socket.send(JSON.stringify(object));
            //     room.forEach((client)=>{
            //        object.deleteRoom=false;
                    
            //         client.connection.send(JSON.stringify(object));
            //     })
               }
           
          
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