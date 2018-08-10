
let idMap = new Map() // _id --> socket Id
let identityMap = new Map() // _id --> Identity

let addIdentity = function(identity, socket){
    if (!idMap.has(identity._id)) {
        idMap.set(identity._id, socket.id)
        identityMap.set(identity._id, identity)
    }
}

let getIdentities = function(){
    return Array.from(identityMap.values())
}

let sendMessage = function(message, io, socket){
    if(message.target._id == 'global'){
        io.emit('messageFromBack', message)
    }
    if(idMap.has(message.target._id) && idMap.has(message.author._id)){
        io.to(idMap.get(message.target._id)).emit("messageFromBack", message)
        io.to(idMap.get(message.author._id)).emit("messageFromBack", message)
    }
}

module.exports.chat = function(http){
    let io = require('socket.io')(http);

    io.on('connection', function(socket){
        socket.on("login", (identity)=>{
            io.to(socket.id).emit("sendingOnlinePeople", getIdentities())
            addIdentity(identity, socket);
            socket.broadcast.emit('newOnlineUser', identity) //send only to other users
        });
        socket.on('messageFromFront', (message)=>{
            sendMessage(message, io, socket)
        })
    });
}