var config = require("./initConf");
var tracker = require("./tracking.js");
var SERVER_NAME = config.Connections.RabbitMQ.Queue;
var MS = {};
var ZEN = require("./middleware/model/zenLog.js");
var socketStore = {};
var affiliationStore = {};
var RS = require("./middleware/redisManager");
var producer = require("./middleware/consumer");
var connections = 0;
var disConnections = 0;
var sessionDestroyMACS = 0;
var keepAliveDestroyMACS = 0;
setInterval(function(){
    MS.send_keepalive();
},5*60*1000);

MS.hset = function(id, socket) {   //MS.hset("251176216367984", {connecting: 'false'})  
  // console.log(id, socket)                  
  var userSession = MS.hget(id);
 // console.log(userSession)
    if (userSession) {           //undefined intially later socket will be printed
   // console.log(userSession)   //{ connecting: 'false', almondMAC: '251176216367984' }
    sessionDestroyMACS++;  
  // console.log(sessionDestroyMACS) // If userSession is there then incr by 1
    destroySocket(userSession);
  // console.log(userSession)   // { connecting: 'false',almondMAC: '251176216367984', markClose: true }

  }
       socketStore[id] = socket;              
  //  console.log(socketStore[id])  //{ connecting: 'false' }
        socket.almondMAC = id; 
   //     console.log(socket.almondMAC)              
    };

MS.addAff = function(id, socket) {  // MS.addAff("251176216367984", {connecting: 'false'})
  // console.log(id,socket)
   var getSocket = MS.getAff(id); 
  //  console.log(getSocket)         //undefined after calling 2nd time will get { connecting: 'false' }
    if (getSocket) {
   // console.log(getSocket)        // { connecting: 'false' }
       destroySocket(getSocket);
    //console.log(getSocket)       // { connecting: 'false', markClose: true }
  }
     affiliationStore[id] = socket;        
 //  console.log(affiliationStore[id])  //  { connecting: 'false' }                                    //  { connecting: 'false' } it printed 2 times due to MS.getAff one time is stored
};

MS.getAff = function(id) {   
//console.log(affiliationStore[id])      // undefined intialy printed after calling 2nd time printed it { connecting: 'false' } 
return affiliationStore[id]; 
};   
//console.log(MS.getAff("251176216367984"))
MS.removeAff = function(id) { 
   // console.log(id)                        //id is :251176216367984
    var socket = MS.getAff(id);
   // console.log(socket)       // undefined b/c affiliationStore.id there is no value 
    delete affiliationStore[id];  
  //  console.log(affiliationStore[id])  // undefined
    destroySocket(socket);
  //  console.log(socket)
};    

MS.hget = function(mac) {      // here mac value is MS.hset of ID value 
//   console.log(socketStore[mac]) //undefined intially later { connecting: 'false', almondMAC: '251176216367984' }             
  return socketStore[mac];  // here  socketStore[mac] ==251176216367984
};
//MS.hget("251176216367984")
MS.setUsers = function(sock, payload) {
  //  console.log(sock, payload)  // { users: [] } { UserID: 100, Action: 'add' }
    if (!payload || !payload.UserID || !sock) return;      
  //  console.log("testing printed")  //testing printed
   //console.log(sock.users.push(payload.UserID+''))
    if (payload.Action == "add" && sock.users && sock.users.push) return sock.users.push(payload.UserID+'');
  //  console.log(sock.users)
    if (payload.Action == "remove" && sock.users && sock.users.indexOf(payload.UserID+'') > -1) return sock.users.splice(sock.users.indexOf(payload.UserID+''), 1);
};

MS.check = function(mac) {
    var json = {
        AlmondMAC: mac,
        Server: SERVER_NAME,
        Status: 0,
        lastEpoch: 0
    };
   // console.log(json.AlmondMAC)  //whatever the value am passing at MS.check that value is the o/p
   // console.log(json.Status)    // 0
  //  console.log(json.Server)   // A2101
    if (socketStore[mac]) {
        json.Status = 1;
        json.lastEpoch = socketStore[mac].keepAliveTime;
       // console.log(json.Status)  //NTHG DUE TO there is no mac in socketstore
    }
    return json;
};
//console.log(MS.check("73497"))
MS.increment = function(add) {
   if (add) connections++;
   else disConnections++;
 // console.log(connections);   //MS.increment(true) then connections is 1
 // console.log(disConnections)    //MS.increment(false) then disconnections is 1  
};

MS.send_keepalive = function() {
    //logger.MS.info('START - MS.send_keepalive to: ' + storeName);
 //   console.log("tesing printed")  // tesing printed
    try {
        Object.keys(socketStore).forEach(function(key) {
           // console.log(Object.keys(socketStore))  // mac is printed
            var socket = socketStore[key];
           // console.log(socket)  // { connecting: 'false', almondMAC: '251176216367984' }
            if (socket && Date.now() - socket.keepAliveTime > 5 * 60 * 1000) {
              //  console.log("test") //above cond is failed
                keepAliveDestroyMACS++;
                MS.remove(socket, true, "KeepAlive Remove");
            } else {
              // console.log("testing printed")  //testing printed
                var res = "<root><KeepAlive>KEEP_ALIVE</KeepAlive></root>";
                if (socket) {
                    MS.writeToAlmond(
                        null,
                        {
                            id: 104,
                            res: res,
                            len: 16
                        },
                        socket,
                        false,
                        function() {}
                    );
                }
            }
        });
        var logData = {
            sessions: Object.keys(socketStore).length,  // 0
            connections: connections,   // 0
            disConnections: disConnections,  // 1
            aliveMacs: keepAliveDestroyMACS,  // 0
            destroyMacs: sessionDestroyMACS,  // 0
            commands: tracker.commandList,  // {}
            sql: tracker.sqlCount,
            redis: tracker.redisCount,
            cass: tracker.cassCount
        };
        //tracker.fiveMinuteLog(logData);
        //tracker.logOnlineMACs(Object.keys(socketStore));
        tracker.redisCount = 0;
        tracker.sqlCount = 0;
        tracker.cassCount = 0;
        tracker.commandList = {};
        connections = 0;
        disConnections = 0;
        keepAliveDestroyMACS = 0;
        sessionDestroyMACS = 0;
    } catch (E) {
        // console.tracker("err", E);
    }
};
MS.send_keepalive_customized = function() {
    for (var i in tracker.keepaliveMacs) {
        var socket = socketStore[tracker.keepaliveMacs[i]];
        var res = "<root><KeepAlive>KEEP_ALIVE</KeepAlive></root>";
        if (socket) {
            MS.writeToAlmond(
                null,
                {
                    id: 104,
                    res: res,
                    len: 16
                },
                socket,
                false,
                function() {}
            );
        }
    }
};
var updateKeepAlive = "";
MS.updateKeepAlive = function() { 
    clearInterval(updateKeepAlive);
 //   console.log(updateKeepAlive)  //adding
    if (tracker.keepaliveMacs.length)
        // set interval if atleast 1 mac is present
        updateKeepAlive = setInterval(function() {
            MS.send_keepalive_customized();
        }, tracker.keepaliveTime);
};

MS.keepAlive = function(socket) {     
  //  console.log(socket)  // {} -->emptyp json 
    socket.keepAliveTime = Date.now();
   // console.log(socket)     // { keepAliveTime: 1559195566786 }
    if (socket.almondOnline && Date.now() - socket.almondOnline >= 4 * 60 * 1000) {
     //   console.log("testing")     // above cond is not satisfy
        delete socket.almondOnline;
        RS.updateAlmond(socket.almondMAC, ["status", "1", "server", SERVER_NAME], function() {});
    }
    if (socket.zenAlmond) {
     //   console.log("testing")  // above cond is not satisfy
        ZEN.insertPing(socket.almondMAC, "ping");
    }
};
MS.sendMAC = function(mac, value) {   
// console.log(mac, value)  // if a run MS.add then o/p is  251176216367984 1
   producer.sendToQueue(config.BACKGROUND_QUEUE, JSON.stringify({ almondMAC: mac,payload:JSON.stringify({ Value: value, CommandType: "AlmondStatus"}), Command: 1111 }));
};

MS.add = function(mac, socket, err) {
   //  console.log(mac, socket, err) // 251176216367984 {} false
    if (err)                          //if it is error socket will be destroyed
      return setTimeout(function() {
            destroySocket(socket);
          //  console.log(socket)
        }, 2 * 1000);  
    socket.keepAliveTime = Date.now();
    socket.almondOnline = Date.now();
    // tracker.logOnlineOffline(mac, 0, "Online");
  //  console.log(mac, socket, err) //251176216367984 { keepAliveTime: 1559196935090, almondOnline: 1559196935090 } false
    MS.hset(mac, socket);
    MS.sendMAC(mac, 1);
  //  console.log(mac)  //not printed 
    if (socket.zenAlmond) ZEN.insertPing(mac, "online");
};
function destroySocket(socket) {
    if (socket) {
     //  console.log("testing")
       socket.markClose = true;     
      // socket.destroy();   // socket will be destroy  // remove 
      // console.log("testing")
      delete socket;  //adding
       //console.log(socket)  
        socket = null;           
    } 
}
 //var socket= { almondMAC: '251176216367984' };
/* socket.destroy = function () {
    console.log("testing")
 delete socket
  }*/
MS.remove = function(socket, noDelay) {
   // console.log(socket, noDelay)  // { almondMAC: '251176216367984' } true
    if (!socket || socket.markClose) return;
   // console.log("above condition fail")
    MS.increment();    //disconnections will be incremented
   // console.log(disConnections)
    var mac = socket.almondMAC;
    // console.log(mac)   // 251176216367984
    destroySocket(socket);
   // console.log(socket)  // socket is destroyed
    delete socketStore[mac];
  //  console.log(socketStore[mac])  //undefined
    if (noDelay) {
        setOffline(mac);
    } else {
        MS.setOfflineAfterDelay(mac);
    }
}; 

function setOffline(mac) {  
    // console.log(mac)    // 251176216367984
    if (mac && !socketStore[mac]) { 
      //  console.log(socketStore[mac])  //undefined
        RS.getAlmond(mac, function(e, o) {     
            if (!e && o && o.server == SERVER_NAME) RS.updateAlmond(mac, ["status", "0", "offline", Date.now(), "server", SERVER_NAME], function() {})
      });
        if (ZEN.MACS.indexOf(mac) != -1) ZEN.insertPing(mac, "offline"); //ZEN.MACS[] in that mac is not there so ZEN.inserPing is not excuted
        MS.sendMAC(mac, 0);
    }
}

 // setOffline("251176216367984")     //adding

MS.setOfflineAfterDelay = function(mac) {  
   // console.log(mac)
    setTimeout(function() {
        setOffline(mac);
    }, 2 * 1000 * 60);
    //},60*1000);
 //  console.log(mac)
};

MS.writeToAlmond = function(time, data, socket, endAfterWrite, callback) {
 //   console.log(time, data, socket, endAfterWrite, callback) // came from MS.send_keepalive
    if (!data.res || !socket) return;
    tracker.sendHttp({
        command: data.id,
        payload: data.res,
        userid: socket.almondMAC,
        temppass: socket.version,
        server: "almond",
        from: "RES",
        broadcast: data.broadcast
    });
    if (time && socket.almondMAC) tracker.logResponseTime(Date.now() + " " + socket.almondMAC + " " + time.id + " " + (Date.now() - time.time) + " " + data.res.length + "\n", "AC");
    try {
        var commandLengthType = new Buffer(16);
        commandLengthType.writeUInt32BE(Buffer.byteLength(data.res), 0);
        commandLengthType.writeUInt32BE(data.id, 4);
        if (data.commandID) {
            commandLengthType.writeUInt32BE(data.commandID, 8); // Default commandID
        } else {
            commandLengthType.writeUInt32BE(0, 8); // Default commandID
        }
        if (data.BID) {
            commandLengthType.writeUInt32BE(data.BID, 12); // Default BID
        } else {
            commandLengthType.writeUInt32BE(0, 12); // Default BID
        }

        socket.write(commandLengthType);
        socket.write(data.res);
        if (endAfterWrite) {
            MS.remove(socket, true, "EndAfter Remove");
        }
        if (callback) return callback(null);
    } catch (err) {
        //logger.MS.debug('Socket Write Error COMMANDID: ' +data.id+' Response: ' +data.res+' Error : '+ err);
        MS.remove(socket, "", "Catch Error");
        if (callback) return callback(err);
    }
};

  module.exports =  { MS, sessionDestroyMACS }
//module.exports = sessionDestroyMACS;
// module.exports = MS;

// module.exports = {sessionDestroyMACS, connections}

