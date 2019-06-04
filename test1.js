BACKGROUND SERVER
## 1)Command 1300-DynamicSceneAdded
## 2)Command 1300-DynamicSceneActivated
## 3)Command 1300-DynamicSceneUpdated
## 4)Command 1300-DynamicSceneRemoved
## 5)Command 1050-AlmondProperties 
## 6)Command 1200-DynamicDeviceAdded
## 7)Command 1500-DynamicClientList
## 8)Command 1500-DynamicClientUpdated 
## 9)Command 1500-DynamicClientAdded
## 10)Command 1500-DynamicAllClientsRemoved
## 11)Command 1200-DynamicDeviceList
## 12)Command 1200-DynamicIndexUpdated
## 13)Command 1500-DynamicClientRemoved
## 14)Command 1200-DynamicDeviceRemoved
## 15)Command 49-DynamicAlmondNameChange
## 16)Command 153-DynamicAlmondModeChangeRequest
## 17)Command 1200-DynamicAllDevicesRemoved
## 18)Command 1500-DynamicClientJoined 
## 19)Command 1500-DynamicClientLeft
## 20)Command 1400-DynamicRuleAdded
## 21)Command 1400-DynamicRuleUpdated
## 22)Command 1400-DynamicRuleRemoved
## 23)Command 1400-DynamicAllRulesRemoved
## 24)Command 1200-DynamicDeviceUpdated
## 25)Command 1300-DynamicAllSceneRemoved


<a name="1300a"></a>
command type:DynamicSceneAdded
## 1)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Insert on AlmondplusDB.SCENE
   params:AlmondMAC

   Functional
   1.Command 1300

   Flow
   socket(packet)->controller->processor->genericModel(execute)->genericModel(add)->insertUpdate.


<a name="1300b"></a>
command type:DynamicSceneActivated
## 2)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Insert on AlmondplusDB.SCENE
   params:AlmondMAC

   Functional
   1.Command 1300

   Flow
   socket(packet)->controller->processor->genericModel(execute)->genericModel(Update)-> genericModel(add)


<a name="1300c"></a>
command type:DynamicSceneUpdated
## 3)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Insert on AlmondplusDB.SCENE
   params:AlmondMAC
   
   Functional
   1.Command 1300

   Flow
   socket(packet)->controller->processor->genericModel(execute)->genericModel(update)->genericModel(add).


   <a name="1300d"></a>
command type:DynamicSceneRemoved
## 4)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Delete from SCENE
   params:AlmondMAC

   Functional
   1.Command 1300

   Flow
   socket(packet)->controller->processor->genericModel(execute)>genericModel(remove).
  
   
 <a name="1050"></a>
## 5)AlmondProperties (Command 1050)
   Command no
   1050- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   3.SELECT on ALMONDPROPERTIES
   params:AlmondMAC

   4.UPDATE on AlmondProperties2
   params:AlmondMAC

   5.select from NotificationID 
   params:UserID 

   17.Update on AlmondplusDB.NotificationID
   params:RegID

   18.Delete on AlmondplusDB.NotificationID               //if (oldRegid && oldRegid.length > 0)
   params: RegI

   19.select from SCSIDB.CMSAffiliations CA,             // if (!MACS[data.almondMAC])
                  lmondplusDB.AlmondUsers AU,
                  SCSIDB.CMS CMS   
   params: CA.CMSCode,AU.AlmondMAC                            

   Redis
   2.hmset on AL_<data.AlmondMAC>                          // params: [redisKey[key], data[key]]

   6.hmget on AL_<almondMAC>                               // params: ["name"]


   7.LPUSH on AlmondMAC_device                             // params: redisData

   8.LTRIM on AlmondMAC_device                             // if (res > count + 1)

            (or)

   8.expire on AlmondMAC_device                             // if (res == 1)

   9. LPUSH on AlmondMAC_All                               //params: redisData

   10.LTRIM on AlmondMAC_All                               // if (res > count + 1)
                 
		 (or)
		 
   10.expire AlmondMAC_All                                // if (res == 1)

   postgres
   11.INSERT INTO recentactivity
      params:mac, id, time, index_id,index_name, name, type, value

   cassandra
   14.INSERT INTO notification_store.notification_records
      params:usr_id,noti_time,i_time,msg  

   15.select from notification_store.badger
      params:usr_id

   16.UPDATE notification_store.badger  
      params:usr_id

   Functional
   1.Command 1050

   12.delete ans.AlmondMAC;
      delete ans.CommandType;
      delete ans.Action;
      delete ans.HashNow;
      delete ans.Devices;
      delete ans.epoch;
      
   13.delete input.users

   Flow
    socket(packet)->controller(processor)->preprocessor(doNothing)->DynamicAlmondProperties(redisUpdate)->genericModel(get)->notification(mainFunction)->container(almondProperties),container(propertiesNotification),getAlmondName->cassandra(qtoCassHistory),addToHttpRedis(pushToRedis)->sendNotification,cassandra.qtoCassConverter,getNotificationData->scsi(sendFinal),CMS(sendFinal).

   
   <a name="1200"></a>
## 6)DynamicDeviceAdded (Command 1200)
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   3.insert into  AlmondplusDB.DEVICE_DATA 
   Params:AlmondMAC

   4.select from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS 
   Params:CA.CMSCode, AU.AlmondMAC

   Redis
   /*if(Object.keys(variables).length==0) */
   2.multi.hmset on MAC, AlmondMAC,key,variable

             (or)

   /* if (deviceArray.length>0) */
   2.multi.hmset on MAC:%s, AlmondMAC
 
   Functional
   1.Command 1200

   Flow
   socket(packet)->controller(processor)->preprocessor(dymamicAddAllDevice)->model(device.execute),redisDeviceValue,genericModel-> scsi(sendFinal),CMS(sendFinal),updateMACS.


   a name="1500"></a>
## 7)DynamicClientList(Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into  AlmondplusDB.WIFICLIENTS              /*if (!doBackUp)*/
     Params:AlmondMAC

   3.Delete from WIFICLIENTS
     Params:AlmondMAC

   4.insert into  AlmondplusDB.WIFICLIENTS
     Params:AlmondMAC

   Functional
   1.Command 1500

   Flow
  socket(packet)->controller(processor)->preprocessor(doNothing)->genericModel(execute),genericModel(addAll),insertBackUpAndUpdate,removeAndInsert.


 a name="1500"></a>
## 8)DynamicClientUpdated (Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into  AlmondplusDB.WIFICLIENTS
     Params:AlmondMAC

   Functional
   1.Command 1500

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->genericModel(execute),genericModel(add).


<a name="1500a"></a>
## 9)DynamicClientAdded (Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQl
   2.Insert on AlmondplusDB.WIFICLIENTS
     params: AlmondMAC

   3.Select on NotificationID
     params: UserID

   15.Update on AlmondplusDB.NotificationID
      params:RegID

   /*if (oldRegid && oldRegid.length > 0) */
   16.Delete on AlmondplusDB.NotificationID
      params: RegID

   REDIS
   4.hmget on AL_<AlmondMAC>                   // params: ["name"]
   5.LPUSH on AlmondMAC_Client                 // params: redisData

   /* if (res > count + 1) */
   6.LTRIM on AlmondMAC_Client                //here count = 9, res = Result from step 5
             
              (or)

   /* if (res == 1) */
   6.expire on AlmondMAC_Client             //here, res = Result from step 5
   
   7.LPUSH on AlmondMAC_All                // params: redisData
   /* if (res > count + 1) */
   8.LTRIM on AlmondMAC_All                //here count = 19, res = Result from step 7
             
              (or)

   /* if (res == 1) */
   8.expire on AlmondMAC_All             //here, res = Result from above step 7

   Postgres
   9.Insert on recentactivity
     params: mac, id, time, index_id, client_id, name, type, value

   Cassandra
   12.Insert on notification_store.notification_records
      params: usr_id, noti_time, i_time, msg
   13.Update on notification_store.badger
      params: usr_id
   14.Select on notification_store.badger
      params: usr_id
   
   Functional
   1.Command 1500
   10.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow;
     delete ans.Devices;
     delete ans.epoch;
   11.delete input.users;

   Flow
socket(packet)->controller(processor)->preprocessor(doNothing)->genericModel(execute)->genericModel(add)->receive(mainFunction)->notify(sendAlwaysClient)->generator(wifiNotificationGenerator)->cassandra(qtoCassHistory)->cassandra(qtoCassConverter)->msgService(notificationHandler)->msgService(handleResponse)


<a name="1500"></a>
## 10)DynamicAllClientsRemoved(Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Cassandra
   2.INSERT INTO  notification_store.almondhistory
     Params:mac,type,data,time

   8.INSERT INTO notification_store.notification_records
     Params:"usr_id", "noti_time" , "i_time" , "msg"
   
   9.UPDATE notification_store.badger           // SET b_cnt = b_cnt + 1
     Params:usr_id  

   10.select from notification_store.badger     // b_cnt as count,usr_id as id
     Params:usr_id  

   SQL
   3.Delete from WIFICLIENTS
     Params:AlmondMAC  
   4.select from NotificationID
     Params:UserID 
   11.UPDATE on AlmondplusDB.NotificationID
     Params:RegID
   12.DELETE FROM AlmondplusDB.NotificationID
     Params:RegID   

   Redis
   5.hmget on AL_<almondMAC>                            //     Params: ["name"]  
                                   
   Functional
   1.Command 1500

   6.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow;
     delete ans.Devices;
     delete ans.epoch;

   7.delete input.users  

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->genericModel(execute)->genericModel(removeAll)->receive(mainFunction)->notify(alwaystrue)->sqlPool(getID)->generator(wifiNotificationGenerator),getAlmondName->sendNotification->cassandra(qtoCassConverter),getNotificationData,insertDynamicUpdate,loggerPoint1(execute),cassandra(getQuery),insertDynamicUpdate->msgService(notificationHandler)->msgService(qToGCMConverter),sql(updateRegID)->sql.deleteID

 
<a name="1200"></a>
## 11)DynamicDeviceList(Command 1200)
   Command no
   1200- JSON format

    Required
   Command,CommandType,Payload,almondMAC

    Redis
   2.hgetall on MAC:<AlmondMAC> 
     
    multi
   4.hmset on AL_<AlmondMAC>                    // params:["deviceRestore", "restore"]

    multi
   5.hgetall on MAC:<AlmondMAC>:deviceIds[id]

     multi 
   9.del on MAC:<almondMAC>

     multi
   10.del on MAC:<payload AlmondMAC>:<removeIds>

   /*if(Object.keys(variables).length==0)*/
     multi
   11.hmset on MAC:<AlmondMAC>,key,variables

                (or)

   /* if (deviceArray.length>0) */
   multi
   11.hmset on MAC:<AlmondMAC>, deviceArray

    SQL
   3.SELECT from DEVICE_DATA
     Params:AlmondMAC
   7.insert into  AlmondplusDB.DEVICE_DATA
     Params:AlmondMAC

   8.Insert on AlmondplusDB.DEVICE_DATA
     params: AlmondMAC 

   12.select  from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS
   Params:CA.CMSCode, AU.AlmondMAC

    Cassandra
   6.INSERT INTO  notification_store.almondhistory
   Params:mac,type,data,time 

   Functional
   1.Command 1200

   Flow
   socket(packet)->controller(processor)->preprocessor(dymamicAddAllDevice)->device(addAll)->redisDeviceValue(getDeviceList)->genericModel(insertBackUpAndUpdate)->device(getDevices)->genericModel(get)->redisDeviceValue(getFormatted)->genericModel(removeAndInsert)->redisDeviceValue(addAll)->receive(mainFunction)->scsi(sendFinal).


   <a name="1200"></a>
## 12)DynamicIndexUpdated(Command 1200)
   Command no
   1200- JSON format

    Required
   Command,CommandType,Payload,almondMAC

   Redis
   /*if(data.index == 0 && packet.cmsCode)*/
   2.hgetall on MAC:<almondMAC>,data.deviceId

   /*if(Object.keys(variables).length==0)*/
    multi.
   3.hmset on MAC:<AlmondMAC>,key,variables

                (or)

  /* if (deviceArray.length>0) */
  multi
  3.hmset on MAC:<AlmondMAC>, deviceArray

  7.LPUSH on AlmondMAC_Device  
     // params: redisData  
   
   /* if (res > count + 1) */
  8.LTRIM on AlmondMAC_Device                
             
              (or)
  /* if (res == 1) */
  8.expire on AlmondMAC_Device  

  9.LPUSH on AlmondMAC_All

  /* if (res > count + 1) */
  10.LTRIM on AlmondMAC_All
             
              (or)

  /* if (res == 1) */
  10.expire on AlmondMAC_All  
                                   

   SQL
  4.SELECT AlmondplusDB.NotificationPreferences
    Params:AlmondMAC, DeviceID, UserID IN
  5.select from NotificationID
     Params:UserID
  6.select from DeviceData
     Params:AlmondMAC, DeviceID 

  17.Update on AlmondplusDB.NotificationID
      params:RegID

  /*if (oldRegid && oldRegid.length > 0) */
  18.Delete on AlmondplusDB.NotificationID
      params: RegID

  19.select from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS
      Params:CA.CMSCode, AU.AlmondMAC   

  postgres
  11.Insert on recentactivity
     params: mac, id, time, index_id,index_name, name, type, value

  Functional
  1.Command 1200

  12.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow; 
     delete ans.Devices;
     delete ans.epoch;

  13delete input.users  

  cassandra
  14.INSERT INTO notification_store.notification_records
     params:"usr_id", "noti_time" , "i_time" , "msg"

  15.Update on notification_store.badger
      params: usr_id
  16.Select on notification_store.badger
      params: usr_id

   Flow
socket(packet)->controller(processor)->preprocessor(dynamicIndexUpdated)->device(updateIndex)->DeviceStore(update)->updateDeviceIndex->rec(mainFunction)->container(dynamicIndexUpdate)->sql(preferenceCheck)->sql(getID)->container(generator.deviceIndexUpdat)->sql(queryDeviceData)->cassandra(qtoCassHistory),addToHttpRedis,pushToRedis->cassandra(qtoCassConverter)->getNotificationData->insertNotification->insertDynamicUpdate->cassandra(getQuery)->scsi(sendFinal)



  <a name="1500"></a>
## 13)DynamicClientRemoved(Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.select from WifiClients
     Params:AlmondMAC, ClientID

   3.Delete from WIFICLIENTS
     Params:AlmondMAC

   4.select from NotificationID 
     Params:UserID  

  16.UPDATE on AlmondplusDB.NotificationID
     Params:RegID 

  /*if (oldRegid && oldRegid.length > 0)*/
  17.DELETE FROM AlmondplusDB.NotificationID
     Params:RegID IN 

    Redis
   5.hmget on AL_<almondMAC>
     // params:"name"

   6.LPUSH on AlmondMAC_Clients  
      // params: redisData 

    /* if (res > count + 1) */
   7.LTRIM on AlmondMAC_Clients               
             
              (or)

   /* if (res == 1) */
   7.expire on AlmondMAC_Clients    

   8.LPUSH on AlmondMAC_All

   /* if (res > count + 1) */
   9.LTRIM on AlmondMAC_All
             
              (or)

   /* if (res == 1) */
   9.expire on AlmondMAC_All   

   Postgres

  10.INSERT INTO recentactivity
     Params:mac, id, time, index_id, client_id, name, type, value  

    Cassandra
  13.INSERT INTO notification_store.notification_records 
     Params:"usr_id", "noti_time" , "i_time" , "msg" 
  
  14.UPDATE notification_store.badger
     Params:usr_id

  15.select from  notification_store.badger
     Params:usr_id   

  Functional
  1.Command 1200

  11.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow;
     delete ans.Devices;
     delete ans.epoch;

  12.delete input.users  
 
    Flow
socket(packet)->controller(processor)->preprocessor(dynamicClientRemoved)2.CP(query)->genericModel(execute)3.genericModel(remove)->container(sendAlwaysClient)->4.sql.getID-> generate(wifiNotificationGenerator)->5.getAlmondName->cassandra(qtoCassHistory)->getInsertData->addToHttpRedis->6,7.pushToRedis->8,9.pushToRedis->10.postgres(query)->cassandra(qtoCassConverter)->11.getNotificationData->12.insertNotification->13.insertDynamicUpdate-> 14.insertDynamicUpdate->15insertDynamicUpdate->msgService(notificationHandler)->msgService(qToGCMConverter)->msgService(handleResponse)->16.sql(updateRegID)->17.sql(deleteID).


 <a name="1200"></a>
## 14)DynamicDeviceRemoved(Command 1200)
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   multi
   2.hdel on MAC:<AlmondMAC>, deviceId

   multi
   3.del on MAC:<AlmondMAC>, deviceId

   SQL
   4.Delete from DEVICE_DATA
     Params:AlmondMAC

   5.select from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS
     Params:CA.CMSCode=CMS.CMSCode and AU.AlmondMAC = CA.AlmondMAC

   Functional
   1.Command 1200

   Flow
socket(packet)->controller(processor)->preprocessor(doNothing)->model(device.execute)->redisDeviceValue(remove)->genericModel(remove)->CMS(sendFinal).


   <a name="49"></a>
## 15)DynamicAlmondNameChange(Command 49)
   Command no
   49- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.redisUpdate
   // params:data, data.AlmondMAC

   Functional
   1.Command 49
   
   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->ALC(almond_name_change).


   <a name="153"></a>
## 16)DynamicAlmondModeChange(Command 153)
   Command no
   153- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.redisUpdate
       // params:data, data.AlmondMAC


  Functional
  1.Command 153

   Flow
  socket(packet)->controller(processor)->preprocessor(doNothing)->ALC(changeMode).



   <a name="1200"></a>
## 17)DynamicAllDevicesRemoved(Command 1200)
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on MAC:<AlmondMAC>

   multi
   3.del on MAC:<almondMAC>:removeIds

   multi 
   4.del on  MAC:<AlmondMAC>:deviceIds

   5.hdel on AL_<AlmondMAC>
    //Params:deviceRestore

   9.hmget on AL_<AlmondMAC>
    //Params: name

   10. LPUSH on AlmondMAC_Device  
    // params: redisData  
   
   /* if (res > count + 1) */
  11.LTRIM on AlmondMAC_Device                
             
              (or)

  /* if (res == 1) */
  11.expire on AlmondMAC_Device 

  12.LPUSH on AlmondMAC_All
  
  /* if (res > count + 1) */
  13.LTRIM on AlmondMAC_All
             
              (or)

  /* if (res == 1) */
  13.expire on AlmondMAC_All   


  SQL 
  7.Delete from DEVICE_DATA
   //Params:AlmondMA

  8.select from NotificationID 
   Params:UserID 

  20.UPDATE on AlmondplusDB.NotificationID
    Params:RegID 

  /*if (oldRegid && oldRegid.length > 0)*/
   21.DELETE FROM AlmondplusDB.NotificationID
     Params:RegID IN  

   22.select from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS
    Params:CA.CMSCode=CMS.CMSCode and AU.AlmondMAC = CA.AlmondMAC 

   Postgres
   14.INSERT INTO recentactivity  
    Params:mac, id, time, index_id,index_name, name, type, value

   Cassandra
   6.INSERT INTO  notification_store.almondhistory 
     Params:mac,type,data,time
  
   17.INSERT INTO notification_store.notification_records
     Params:"usr_id", "noti_time" , "i_time" , "msg"

   18.UPDATE notification_store.badger
      Params:usr_id

   19.select from  notification_store.badger
      Params:usr_id    

   Functional
   1.Command 1200

  15.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.Devices;
     delete ans.epoch;

   16.delete input.users 
 
   Flow socket(packet)->controller(processor)->preprocessor(doNothing)->model(device.execute)->DeviceStore(removeAll)->DeviceStore(getDeviceList)->removeAllDevices->genericModel(removeAll)->loggerPoint1(execute)->rec(mainFunction)->container.(alwaystrue)->sqlPool(getID)->container.( generator.allDevicesRemoved)->generate(allDevicesRemoved)->getAlmondName->cassandra(qtoCassHistory)-> getInsertData->addToHttpRedis->pushToRedis->Postgres->sendNotification->getNotificationData-> cassandra(getQuery)-> msgService(notificationHandler)->msgService(qToGCMConverter)->sql(updateRegID)->sql(deleteID)->scsi(sendFinal).



   <a name="1500"></a>
## 18)DynamicClientJoined(Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into  AlmondplusDB.WIFICLIENTS
    Params:AlmondMAC

   3.Select on AlmondplusDB.WifiClientsNotificationPreferences
    params: AlmondMAC,ClientID,UserID

   4.select from NotificationID 
   Params:UserID  

   16.UPDATE on AlmondplusDB.NotificationID
   Params:RegID

    /*if (oldRegid && oldRegid.length > 0)*/
   17.DELETE FROM AlmondplusDB.NotificationID
    Params:RegID IN  

   Redis
   5.hmget on AL_<almondMAC>
   // Params:name

   6.LPUSH on AlmondMAC_Client
     params:redisData 

    /* if (res > count + 1) */
   7.LTRIM on AlmondMAC_Client               
             
              (or)

   /* if (res == 1) */
   7.expire on AlmondMAC_Client 

   8.LPUSH on AlmondMAC_All

   /* if (res > count + 1) */
   9.LTRIM on AlmondMAC_All
             
              (or)

   /* if (res == 1) */
   9.expire on AlmondMAC_All   

    postgres
   10.INSERT INTO recentactivity 
    Params:mac, id, time, index_id, client_id, name, type, value 

    Cassandra
   13.INSERT INTO notification_store.notification_records
    Params:"usr_id", "noti_time" , "i_time" , "msg"  

   14.UPDATE notification_store.badger
     Params:usr_id

   15.select from  notification_store.badger
     Params:usr_id  
 
   Functional
    1.Command 1500

   11.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow;
     delete ans.Devices;
     delete ans.epoch;

   12.delete input.users  

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(add)->insertUpdate->rec(mainFunction)->container(checkClientPreference)-> sqlPool(preferenceCheck)->sql(getID)->container(generator.wifiNotificationGenerator)->getAlmondName->cassandra(qtoCassHistory)->addToHttpRedis->cassandra(qtoCassConverter)->getNotificationData->insertNotification->cassandra(getQuery)-> msgService(notificationHandler)->msgService(handleResponse)->sql(updateRegID)->sql.deleteID.



   <a name="1500"></a>
## 19)DynamicClientLeft(Command 1500)
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into  AlmondplusDB .WIFICLIENTS
    Params:AlmondMAC

   3.Select on AlmondplusDB.WifiClientsNotificationPreferences
      params: AlmondMAC,ClientID,UserID

   4.select from NotificationID 
    Params:UserID 


   16.UPDATE on AlmondplusDB.NotificationID
   Params:RegID

    /*if (oldRegid && oldRegid.length > 0)*/
   17.DELETE FROM AlmondplusDB.NotificationID
     Params:RegID IN  

    Redis
   5.hmget on AL_<almondMAC>
    //Params:name 

   6.LPUSH on AlmondMAC_Client
     params:redisData 

    /* if (res > count + 1) */
   7.LTRIM on AlmondMAC_Client               
             
           (or)

    /* if (res == 1) */
   7.expire on AlmondMAC_Client 

   8.LPUSH on AlmondMAC_All

    /* if (res > count + 1) */
   9.LTRIM on AlmondMAC_All
             
           (or)

    /* if (res == 1) */
   9.expire on AlmondMAC_All 

    postgres
   10.INSERT INTO recentactivity 
    Params:mac, id, time, index_id, client_id, name, type, value 

    Cassandra
   13.INSERT INTO notification_store.notification_records
    Params:"usr_id", "noti_time" , "i_time" , "msg"  

   14.UPDATE notification_store.badger
    Params:usr_id

   15.select from  notification_store.badger
    Params:usr_id  
   
   Functional
    1.Command 1500

   11.delete ans.AlmondMAC;
     delete ans.CommandType;
     delete ans.Action;
     delete ans.HashNow;
     delete ans.Devices;
     delete ans.epoch;

   12.delete input.users
   
   Flow
socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(add)->insertUpdate->rec(mainFunction)->container(checkClientPreference)->sqlPool(preferenceCheck)->sql(getID)->container(generator.wifiNotificationGenerator)->getAlmondName->cassandra(qtoCassHistory)->postgres(query)->sendNotification->cassandra(qtoCassConverter)->getNotificationData->insertNotification->cassandra(getQuery)->msgService(notificationHandler)->msgService(qToGCMConverter)->sql(updateRegID)->sql.deleteID.


   <a name="1400"></a>
## 20)DynamicRuleAdded(Command 1400)
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into  AlmondplusDB.RULE
    Params:AlmondMAC

   Functional
    1.Command 1400

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(add)->insertUpdate.


    <a name="1400"></a>
## 21)DynamicRuleUpdated(Command 1400)
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
    2.insert into  AlmondplusDB.RULE
    Params:AlmondMAC

   Functional
    1.Command 1400

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(add)->insertUpdate.


   <a name="1400"></a>
## 22)DynamicRuleRemoved(Command 1400)
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Delete from RULE
   Params:AlmondMAC

   Functional
    1.Command 1400

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(remove)


   <a name="1400"></a>
## 23)DynamicAllRulesRemoved(Command 1400)
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Cassandra
   2.INSERT INTO  notification_store.almondhistory
   Params:mac,type,data,time

   SQL
   3.Delete from RULE
   Params:AlmondMAC

   Functional
    1.Command 1400

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)-> genericModel(removeAll).


   <a name="1200"></a>
## 24)DynamicDeviceUpdated(Command 1200)
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
    multi
    2.hmset on MAC:<AlmondMAC> key, variables

              (or)

   /*if (deviceArray.length>0)*/
    multi
   2.hmset on MAC:<AlmondMAC> deviceArray

   SQL
   3.insert into  AlmondplusDB.DEVICE_DATA
    Params:AlmondMAC 
   4.select from SCSIDB.CMSAffiliations CA,AlmondplusDB.AlmondUsers AU,SCSIDB.CMS CMS 
    Params:CA.CMSCode=CMS.CMSCode and AU.AlmondMAC = CA.AlmondMAC 

   Functional
    1.Command 1200

   Flow
socket(packet)->controller(processor)->preprocessor(dynamicDeviceUpdated)->model(device.execute)->DeviceStore(update)->genericModel(add)->scsi(sendFinal)->CMS(sendFinal).



   <a name="1300"></a>
## 25)DynamicAllSceneRemoved(Command 1300)
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Delete from SCENE
    Params:AlmondMAC

   Functional
    1.Command 1300

   Flow
   socket(packet)->controller(processor)->preprocessor(doNothing)->model(genericModel.execute)->genericModel(remov
   
MOBILE SERVER   
   ## 1)Command 1061-ActivateScene
   ## 2)Command 1100-RouterSummary
   ## 3)Command 1500-ClientList
   ## 4)Command 1700-GetClientPreferences
   ## 5)Command 1700-UpdateClientPreference
   ## 6)Command 1700-GetDevicePreferences
   ## 7)Command 1700-UpdateDevicePreference
   ## 8)Command 23-AffiliationUserRequest
   ## 9)Command 1900-Logout
   ## 10)Command 1800-UpdateNotificationRegistration
   ## 11)Command 1112-GetAlmondList
   ## 12)Command 1003-Login
   ## 13)Command 1023-AffiliationUserRequest
   ## 14)Command 1011-SubscribeMe
   ## 15)Command 1011-PaymentDetails
   ## 16)Command 1011-UpdateCard
   ## 17)Command 1011-DeleteSubscription
   ## 18)Command 1013-IOTScanResults
   ## 19)Command 61-AlmondNameChange
   ## 20)Command 1060-ChangeUser(action:add)
   ## 21)Command 1110-UpdateUserProfileRequest
   ## 22)Command 1110-DeleteAccountRequest
   ## 23)Command 1060-ChangeUser(action:update)
   ## 24)Command 1110-ChangePasswordRequest
   ## 25)Command 1110-DeleteMeAsSecondaryUserRequest 
   ## 26)Command 1110-DeleteSecondaryUserRequest
   ## 27)Command 1110-UserInviteRequest
   ## 28)Command 1110-UnlinkAlmondRequest
   ## 29)Command 1110-UserProfileRequest
   ## 30)Command 300-NotificationPreferences
   ## 31)Command 283-NotificationDeleteRegistrationRequest
   ## 32)Command 281-NotificationAddRegistration
   ## 33)Command 151-AlmondModeRequest
   ## 34)Command 113-NotificationPreferenceListRequest
   ## 35)Command 102-CloudSanity
   ## 36)Command 6-Signup
   ## 37)Command 3-Logout
   ## 38)Command 4-logoutall
   ## 39)Command 2222-Restore
   ## 40)Command 1525-UpdateClientPreferences
   ## 41)Command 1526-GetClientPreferences
   ## 42)Command 1400-RuleList
   ## 43)Command 1200-DeviceList
   ## 44)Command 1300-SceneList
   ## 45)Command 1-res
   ## 46)Command 806
   ## 47)Command 804a-for device
   ## 48)Command 804-for client
   ## 49)Command 1004-Super_Login 
   ## 50.Command 800
   ## 51)Command 1050-AlmondPropertiesResponse
   ## 52)Command 1011-CheckSubscriptionStatus


   
<a name="1061"></a>
command type:ActivateScene
## 1)Command 1061
   Command no
   1061- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on AL_<AlmondMAC>

   3.get on ICID_<string>    // here <string> = random string data)

   4.Code on ICID:<Timeout>:config.SERVER_NAME   

   Functional
   1.Command 1061

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)-> commandMapping(almond.onlyUnicast)->almond(onlyUnicast)->RM(getAlmond)->RM(redisExecute)->redisClient(query)->RM(setAndExpire)-> redisClient(setex).


   <a name="1100"></a>
command type:RouterSummary
## 2)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   3.hgetall on AL_<AlmondMAC>

   4.get on ICID_<string>    // here <string> = random string data)

   5.setex on ICID_<string>            // (prefix + key), value = SERVER_NAME

   QUEUE -
   7.Send response to config.SERVER_NAME    // (payload,command,almondMAC) to QUEUE

   Functional
   1.Command 1100

   2.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   6.delete store[commandID]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(almond.onlyUnicast)->redisClient(query)


   <a name="1500"></a>
command type:ClientList
## 3)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT from WIFICLIENTS
   Params:AlmondMAC

   Functional
   1.Command 1500

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping.model->genericModel(execute)->genericModel(get)->genericModel(hash).


   <a name="1700a"></a>
command type:GetClientPreferences
## 4)Command 1700
   Command no
   1700- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   /*if (data.Action == "get")*/
   2.Select From  ClientPreferences
   Params: AlmondMAC,  UserID

   Functional
   1.Command 1700

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping.model->preferences(do)->genericModel(select).


 <a name="1700b"></a>
command type:UpdateClientPreference
## 5)Command 1700
   Command no
   1700- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into ClientPreferences
   Params: AlmondMAC, UserID

   Functional
   1.Command 1700

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(model)->preferences(do)->genericModel(insertOrUpdate)


 <a name="1700c"></a>
command type:GetDevicePreferences
## 6)Command 1700
   Command no
   1700- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   /*if (data.Action == "get")*/
   2.Select From  NotificationPreferences
   Params:AlmondMAC, UserID

   Functional
   1.Command 1700

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(model)->preferences(do)->genericModel(select)->


 <a name="1700d"></a>
command type:UpdateDevicePreference
## 7)Command 1700
   Command no
   1700- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into NotificationPreferences
   Params:AlmondMAC,UserID

   Functional
   1.Command 1700

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(model)->preferences(do)-> genericModel(insertOrUpdate)->


    <a name="23"></a>
command type:AffiliationUserRequest
## 8)Command 23
   Command no
   23- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on CODE:<data.code>

   4.get on ICID_<code>                           // here code:some random string

   5.setex on ICID_<code>                         // here code:some random string

   SQL
   3.Select from Users
   Params:UserID

   Queue
   8.Send AffiliationUserRequestResponse to rows.server

   Functional
   1.Command 23

   6.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   7.delete store[row.CommandID]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(model)->(affiliation.execute)->RM(getCode)->redisClient(query)->SM(getEmail)->CB(incCommandID)->generator(getCode)->RM(redisExecute)-> RM(setAndExpire)->redisClient(setex)->RM(setCode)->setAndExpire->redisClient(setex)->dispatcher(unicast)->broadcaster(unicast)->RM(getAlmond)->redisClient(query).


   <a name="1900"></a>
command type:Logout
## 9)Command 1900
   Command no
   1900- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.DELETE FROM UserTempPasswords
   Params:UserID,TempPassword
   
   6.Delete From NOTIFICATIONID
   Params: parsedPayload

   Redis                                            
   4.hmset on UID_<socket.userid> // values = Q_config.SERVER_NAME,userSession.length 

   Functional
   1.Command 1900

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   /*if (userSession.length == 1)*/
   5.delete socketStore[userid]

   7.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(model)->L(logout)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile)->dispatcher(socketHandler)->MS(remove)->RM(redisExecute)->secondaryModel(model)->notification(do)->genericModel(delete)->dispatcher(dispatchResponse).


    <a name="1800"></a>
command type:UpdateNotificationRegistration
## 10)Command 1800
   Command no
   1800- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.insert into NOTIFICATIONID
   Params:parsedPayload

   Functional
   1.Command 1800

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(notification.do)->genericModel(insertOrUpdate)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1112"></a>
command type:GetAlmondList
## 11)Command 1112
   Command no
  1112- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on UID:<UserID>

   3.hgetall on AL_<pMACs.concat(sMACs)>                       // MACs=pMACs.concat(sMACs)

   SQL
   4.select from SCSIDB.CMS
   Params:CMSCode

   6.SELECT from Users
   Params:UserID 

   Functional
   1.Command 1112

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   7.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(almond.create_almond_list)->RM(getAllAlmonds)->getAlmondDetails->RM(redisExecuteAll)->getCMSPlans->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile)->secondaryModel(almond.AlmondAffiliationData)->SM(getEmailIDUserID)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile).


<a name="1003"></a>
command type:Login
## 12)Command  1003
   Command no
  1003- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Cassandra
   2.Insert on logging.error_log
     params: date,time,ip,server,category,error
   
   SQL
   3.SELECT from Users
   Params:EmailID

   4.INSERT INTO UserTempPasswords
   Params:UserID,TempPassword,LastUsedTime

   8.SELECT FROM Subscriptions 
   Params:AlmondMAC

   Redis
   5.hgetall on UID_<data.UserID> 

   7.hincrby on UID_<data.UserID>         //values = (Q_<config.SERVER_NAME>,1)

   Functional
   1.Command 1003

   6.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   9.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(L.Mob_Login)->L(manualLogin)->L(Mob_Add_TempPass)->L(SetMACsToUserRedis)->RM(getAllAlmonds)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile)->dispatcher(socketHandler)->MS(add)->RM(redisExecute)->commandMapping(secondaryModels)secondaryModel(L.GetSubscriptions)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile).


<a name="1023"></a>
command type:AffiliationUserRequest
## 13)Command  1023
   Command no
  1023- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on CODE:<data.Code>

   4.get on ICID_<code>                                     // here code:some random string
 
   5.setex on ICID_<string>            // (prefix + key), value = SERVER_NAME

   7.setex on CODE:<data.code>     
     //(prefix+key),values =res.mac,SERVER_NAME, socket.userid,commandID,res.emailID

   SQL
   3.Select from Users
   Params:UserID

   6.Select from SCSIDB.CMSAffiliations
   Params:AlmondMAC

   Queue
   10.Send AffiliationUserRequest to config.HTTP_SERVER_NAME

   Functional
   1.Command 1023

   8.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   9.delete store[id]

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(affiliation.execute)->affiliation_getCode->2.RM(getCode)->get_emailid->3.SM(getEmail)->CB(incCommandID)->generator(getCode)->4.RM(redisExecute)->RM(setAndExpire)->5.redisClient(setex)->6.SM(getCMSCode)->RM(setCode)->7.redisClient(setex)->dispatcher(dispatchResponse)->8.socketStore(writeToMobile)->dispatcher(socketHandler)->MS(setUnicastID)->9.requestQueue(set).


<a name="1011a"></a>
command type:SubscribeMe
## 14)Command 1011
   Command no
  1011- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on UID_:<UserID>

   Queue
   4.Send SubscribeMeResponse to config.HTTP_SERVER_NAME

   Functional
   1.Command 1011

   3.delete store[id] 

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(SC.subscriptionCommands)->RM(getAlmonds)->requestQueue(set)->AQP(sendToQueue)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


<a name="1011b"></a>
command type:PaymentDetails
## 15)Command 1011
   Command no
  1011- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on UID_:<UserID>

   Queue
   4.Send PaymentDetailsResponse to config.HTTP_SERVER_NAME

   Functional
   1.Command 1011

   3.delete store[id]

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   FLOW
   socket(packet)->validator(do)->processor(do)->commandMapping(SC.subscriptionCommands)->RM(getAlmonds)->requestQueue(set)->AQP(sendToQueue)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


<a name="1011c"></a>
command type:UpdateCard
## 16)Command 1011
   Command no
  1011- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on UID_:<UserID>

   Queue
   4.Send UpdateCardResponse to config.HTTP_SERVER_NAME

   Functional
   1.Command 1011

   3.delete store[id]

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(packet)->validator(do)->processor(do)->commandMapping(SC.subscriptionCommands)->RM(getAlmonds)->requestQueue(set)->AQP(sendToQueue)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


<a name="1011d"></a>
command type:DeleteSubscription
## 17)Command 1011
   Command no
  1011- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on UID_:<UserID>

   Queue
   4.Send DeleteSubscriptionResponse to config.HTTP_SERVER_NAME

   Functional
   1.Command 1011

   3.delete store[id]

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(packet)->validator(do)->processor(do)->commandMapping(SC.subscriptionCommands)->RM(getAlmonds)->requestQueue(set)->AQP(sendToQueue)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


<a name="1013"></a>
command type:IOTScanResults
## 18)Command 1013
   Command no
  1013- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM IOT_Scanner
   Params:mac

   Functional
   1.Command 1013

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(packet)->validator(do)->processor(do)->commandMapping(almond.IOTScan)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="61"></a>
command type:AlmondModeChange
## 19)Command 61
   Command no
   61- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   3.hgetall on AL_<AlmondMAC>

   4.get on ICID_<string>    // here <string> = random string data)

   5.setex on ICID:<Timeout>:config.SERVER_NAME   

   Queue
   7.Send response to config.SERVER_NAME       // (payload,command,almondMAC) to QUEUE

   Functional
   1.Command 61

   2.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   6.delete store[commandID]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(almond.onlyUnicast)->almond(onlyUnicast)->RM(getAlmond)->RM(redisExecute)->redisClient(query)->RM(setAndExpire)-> redisClient(setex)->dispatcher(dispatchResponse)->socketStore(writeToMobile).



   <a name="1060a"></a>
command type:ChangeUser(action:add)
## 20)Command 1060
   Command no
   1060- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.UPDATE on AlmondplusDB.WifiClients
   Params:NewName, payload.AlmondMAC, clientId

   Redis
   3.hgetall on AL_:<AlmondMAC>

   multi
   5.hgetall on UID_<userID>          //here, multi is done on every userID in UserList

   Queue
   6.Send ChangeUserResponse to MobileQueue

   Functional
   1.Command 1060

   4.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(clients.update)->RM(getUsers)->redisClient(query)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->redisClient(query)->AQP(sendToQueue).


    <a name="1110a"></a>
command type:UpdateUserProfileRequest
## 21)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.UPDATE on Users
     params: UserID

   Redis
   4.hgetall on UID_<userID>          //here, multi is done on every userID in UserList

   Queue
   5.Send UserProfileResponse to MobileQueue

   Functional
   1.Command 1110

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.UpdateUserProfile)->CP(queryFunction)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->redisClient(query)->dispatchToQueues->AQP(sendToQueue).



   <a name="1110b"></a>
command type:DeleteAccountRequest
## 22)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Select on Users
     params:EmailID
   3.Delete on Users
     params: UserID
   9.Delete on AlmondUsers
     params: AlmondMAC
   10.Update on AllAlmondPlus
     params: AlmondMAC

   Redis
   4.hgetall on UID_<packet.userid>
   5.del on UID_<packet.userid>

   multi
   6.hgetall on AL_<pMACs>

   multi
   7.del on AL_<pMACs>

   multi
   8.hdel on UID_<Entry[1]>           //values = SMAC_<AlmondMAC>, Entry[1] =Secondary UserID

   13.hmset on UID_<data.userid>   //values = (Q_<config.SERVER_NAME>,0)

   multi
   14.hgetall on UID_<userID>          //here multi is done on every userID in userList

   Queue
   15.Send DeleteAccountRequestResponse to MobileQueue
   16.Send DeleteAccountResponse to config.HTTP_SERVER_NAME

   Functional
   1.Command 1110
   11.Send listResponse,commandLengthType ToMobile       //where listResponse = payload
   12.delete socketStore[data.userid]

   Flow
   socket(packet)->validator(do)->validator(checkCredentials)->processor(do)->account-manager-json(DeleteAccount)->sqlManager(deleteUser)->redisManager(redisExecute),redisManager(deleteAccount)->rowBuilder(defaultReply)->dispatcher(dispatchResponse)->mongo-store(removeAll)->dispatcher(broadcast)->broadcastBuilder(removeAll)->broadcaster(broadcast)->dispatcher(broadcastToAllAlmonds)->broadcaster(broadcastModel)


  <a name="1060b"></a>
command type:ChangeUser(action:update)
## 23)Command 1060
   Command no
   1060- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.UPDATE ON AlmondplusDB.WifiClients
   Params:Name

   3.UPDATE ON AlmondplusDB.WifiClients
   Params:NewName, payload.AlmondMAC, clientId

   Redis
   4.hgetall on AL_:<AlmondMAC>

   6.hgetall on UID_<userID>          //here, multi is done on every userID in UserList

   Queue
   7.Send ChangeUserResponse to MobileQueue

   Functional
   1.Command 1060

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(clients.update)->RM(getUsers)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


  <a name="1110c"></a>
command type:ChangePasswordRequest
## 24)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Select on Users
   params:EmailID

   3.UPDATE on Users
   Params:Password,EmailID

   4.DELETE FROM UserTempPasswords              //if (rows.affectedRows == 1)
   Params:UserID

              (or)

   4.return                  //if (rows.affectedRows == 0)        

   5.DELETE FROM NotificationID
   Params:UserID

   Redis
   7.hmset on UID_<socket.userid>      // values = Q_config.SERVER_NAME,userSession.length 

   multi
   9.hgetall on UID_<userID>          //here multi is done on every userID in userList


   Queue
   10.Send ChangePasswordResponse to MobileQueue

   Functional
   1.Command 1110

   6.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   8.delete store[id]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.ChangePassword)->AM_J(saltAndHash)->removeAllTempPass->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(socketHandler)->broadcaster(broadcast)->MS(getSockets)->requestQueue(del)->MS(sendRequest)->sendToRemoteUsers->RM(redisExecute)->dispatcher(broadcast)->broadcaster(broadcast)->sendToRemoteUsers-> RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


<a name="1110d"></a>
command type:DeleteMeAsSecondaryUserRequest
## 25)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hgetall on AL_:<AlmondMAC>

   5.hdel on AL_:<AlmondMAC>      // value:SUSER_secondaryUser

   6.hdel on UID_:<secondaryUser>  // value:SMAC_AlmondMAC

   8.hgetall on AL_:<AlmondMAC>

   9.get on ICID_<string>              // here <string> = random string data

   10.setex on ICID_<string>,TIMEOUT,config.SERVER_NAME    // here <string> = random string data

   multi
   14.hgetall on UID_<userID>

   SQL
   3.DELETE FROM AlmondSecondaryUsers
   Params:AlmondMAC,userID

   4.DELETE FROM NotificationPreferences
   Params:AlmondMAC,userID
     
             (or)

   4.return       // if (rows.affectedRows == 0) 

   Queue
   11.Send  DeleteMeAsSecondaryUserResponse to config.SERVER_NAME
   15.Send DynamicAlmondDeleteResponse,DynamicUserDeleteResponse to MobileQueue
   
   Functional
   1.Command 1110

   7.Send listResponse,commandLengthType ToMobile //where listResponse = payload

  12.delete store[id]

  13.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.DeleteMeAsSecondaryUser)->RM(getAlmond)->deleteUser->SM(removeSecondaryAlmond)->RM(removeSecondaryAlmond)->RM(removeSecondaryUserFromMAC)-> RM(removeMACFromUser)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile)->dispatcher(unicast)->broadcaster(unicast)->RM(getAlmond)->CB(incCommandID)->generator(getCode)->Random_Key->RM(redisExecute)->RM(setAndExpire)->redisClient(setex)->AQP(sendToQueue)->dispatcher(broadcast)->broadcaster(broadcast)->MS(getSockets)->requestQueue(del)->MS(sendRequest)->MS(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


   <a name="1110e"></a>
command type:DeleteSecondaryUserRequest
## 26)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.DELETE FROM AlmondSecondaryUsers
   Params:AlmondMAC,userID

   3.DELETE FROM NotificationPreferences
   Params:AlmondMAC,userID

   Redis
   4.hdel on AL_:<AlmondMAC>      // value:SUSER_secondaryUser

   5.hdel on UID_:<secondaryUser>  // value:SMAC_AlmondMAC

   7.hgetall on AL_:<AlmondMAC>

   8.get on ICID_<string>              // here <string> = random string data

   9.setex on ICID_<string>,TIMEOUT,config.SERVER_NAME    // here <string> = random string data

   multi
  13.hgetall on UID_<userID>

   Queue
  10.Send  DeleteMeAsSecondaryUserResponse to config.SERVER_NAME

  14.Send DynamicAlmondDeleteResponse,DynamicUserDeleteResponse to MobileQueue

   Functional
   1.Command 1110

   6.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   11.delete store[id]

   12.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.DeleteSecondaryUser)->deleteUser->SM(removeSecondaryAlmond)->RM(removeSecondaryAlmond)->RM(removeSecondaryUserFromMAC)->RM(removeMACFromUser)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->MS(writeToMobile)->dispatcher(unicast)->broadcaster(unicast)->RM(getAlmond)->CB(incCommandID)->generator(getCode)->Random_Key->RM(redisExecute)->RM(setAndExpire)->AQP(sendToQueue)->dispatcher(broadcast)->broadcaster(broadcast)->requestQueue(del)->MS(sendRequest)->MS(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


   <a name="1110f"></a>
command type:UserInviteRequest
## 27)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM Users
   Params:EmailID

   4.select from AlmondSecondaryUsers
   Params:AlmondMAC, UserID

   5.INSERT INTO AlmondSecondaryUsers
   Params:AlmondMAC, userID

   8.Select from Users
   Params:UserID

   Redis
   3.hgetall on UID_:<packet.userid>
  
   6.hmset on AL_:<AlmondMAC>                // value=SUSER_<packet.userid>, 1

   7.hmset on UID_:<packet.userid>          // value=SMAC_<AlmondMAC>, 1

   9.hgetall on AL_:<AlmondMAC>

   11.hgetall on AL_:<AlmondMAC>

   12.get on ICID_<string>                // here <string> = random string data

   13.setex on ICID_<string>,TIMEOUT,config.SERVER_NAME    // here <string> = random string data
   
   multi
   17.hgetall on UID_:<data.SecondaryUsers>

   Queue
   14.Send  UserInviteRequestResponse to config.SERVER_NAME

   18.Send  UserInviteResponse to MobileQueue

   Functional
   1.Command 1110

   10.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   15.delete store[id]

   16.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.UserInvite)->CheckIfEmailExists-> RM(getAlmonds)->SM(checkSecondary)->SM(addSecondaryAlmond)->RM(addSecondaryAlmond)->RM(addSecondaryUserToMAC)->RM(addMACToUser)->addUser->SM(getEmail)->RM(getAlmond)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(unicast)->broadcaster(unicast)->RM(getAlmond)->CB(incCommandID)->generator(getCode)->Random_Key->RM(redisExecute)->RM(setAndExpire)->AQP(sendToQueue)->dispatcher(broadcast)->broadcaster(broadcast)->MS(getSockets)->requestQueue(del)->MS(sendRequest)->MS(writeToMobile)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).



   <a name="1110g"></a>
command type:UnlinkAlmondRequest
## 28)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT from Users
   Params: EmailID

   Redis
   3.hgetall on AL_:<AlmondMAC>

   5.hgetall on AL_:<AlmondMAC>

   Queue
   6.Send  UnlinkAlmondResponse to almondserver

   Functional
   1.Command 1110

   4.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->validator(checkCredentials)->SM(getUser)->validator(check)->RM(verifyAffiliation)->RM.getUsers->processor(do)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(unicast)->commandMapping.unicast(AM_J.getAlmond)->RM(getAlmond)->broadcaster(unicast)->AQP(sendToQueue).


   <a name="1110h"></a>
command type:UserProfileRequest
## 29)Command 1110
   Command no
   1110- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM Users
   Params:UserID

   Functional
   1.Command 1110

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(AM_J.UserProfile)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="300"></a>
command type:NotificationPreferences
## 30)Command 300
   Command no
   300- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Insert on NotificationPreferences
     params: AlmondMAC, DeviceID, UserID,IndexVal, NotificationType

   Redis
   4.hgetall on UID_:<userList>      //here, multi is done on every userID in UserList

   Queue
   5.Send NotificationPreferencesResponse to MobileQueue

   Functional
   1.Command 300

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(update_notification_preferences)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(broadcast)->broadcaster(broadcast)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


   <a name="283"></a>
command type:NotificationDeleteRegistrationRequest
## 31)Command 283
   Command no
   283- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.DELETE FROM NotificationID
   Params:HashVal, RegID, Platform

   Functional
   1.Command 283

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(Mobile_Notification_Delete_Registration)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


  <a name="281"></a>
command type:NotificationAddRegistration
## 32)Command 281
   Command no
   281- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM NotificationID
   Params:HashVal

   //if (rows.length == 0)
   3.Insert on NotificationID
     params: HashVal, RegID, UserID, Platform

           (or)

   //if (rows.length == 1)
   3.Update on NotificationID
     params:  UserID,Platform,RegID


   Functional
   1.Command 281

   4.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(Mobile_Notification_Registration)->Notification_Process_And_Add->Notification_Update->dispatcher(dispatchResponse)->socketStore(writeToMobile).


  <a name="151"></a>
command type:AlmondModeRequest
## 33)Command 151
   Command no
   151- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM AlmondPreferences
   Params:T1.AlmondMAC

   Functional
   1.Command 151

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(almond.get_almondmode)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="113"></a>
command type:NotificationPreferenceListRequest
## 34)Command  113
   Command no
   113- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM NotificationPreferences
   params:AlmondMAC, UserID 

   Functional
   1.Command 113

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(get_notification_preference_list)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="102"></a>
command type:CloudSanity
## 35)Command  102 
   Command no
   102- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Functional
   1.Command 102

   2.Send listResponse,commandLengthType ToMobile       //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do).


   <a name="6"></a>
command type:Signup
## 36)Command 6
   Command no
   6- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM Users
   Params:EmailID 

   Redis
   4.hmset on UID_:<userid>         //value=[Q_config.SERVER_NAME,userSession.length - 1]

   Functional
   1.Command 6

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   //if (userSession.length == 1)
   5.delete socketStore[socket.userid]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(accountSetup.Mob_Signup)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(socketHandler)->MS(remove)->RM(redisExecute).


   <a name="3"></a>
command type:Logout
## 37)Command 3
   Command no
   3- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.DELETE FROM UserTempPasswords
   Params:UserID, TempPassword

   Redis
   4.hmset on UID_:<userid>         //value=[Q_config.SERVER_NAME,userSession.length - 1]


   Functional
   1.Command 3

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   //if (userSession.length == 1)
   5.delete socketStore[socket.userid]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(L.logout)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(socketHandler).


  <a name="4"></a>
command type:logoutall
## 38)Command 4
   Command no
   4- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT from Users
   Params:EmailID

   3.DELETE FROM UserTempPasswords
   Params:UserID

   4.DELETE FROM NotificationID
   Params:UserID

   Redis
   7.hmset on UID_<userid>        // where values = [Q_config.SERVER_NAME,0]
  
   multi
   8.hgetall on UID_<userID>          //here, multi is done on every userID in UserList

   Queue
   9.Send logoutallResponse to MobileQueue

   Functional
   1.Command 4

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   6.delete socketStore[userid]

   Flow
   socket(on)->LOG(debug)->validator(do)->validator(checkCredentials)->SM(getUser)->processor(do)->commandMapping(L.logoutAll)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(socketHandler)->MS(removeAll)->dispatcher(broadcast)->broadcaster(broadcast)->sendToRemoteUsers->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


   <a name="2222"></a>
command type:Restore
## 39)Command 2222
   Command no
   2222- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Cassandra
   2.select from almondhistory
   Params:mac, type

   Redis
   4.hgetall on AL_:<almondMAC>

   5.get on ICID_<string>                // here <string> = random string data

   6.setex on ICID_<string>,TIMEOUT,config.SERVER_NAME    // here <string> = random string data

   Queue
   8.Send  RestoreResponse to config.SERVER_NAME

   Functional
   1.Command 2222

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   7.delete store[commandID] 

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(notificationFetcher.almondHistroy)->loggerPoint(execute)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(unicast)->broadcaster(unicast)->RM(getAlmond)->CB(incCommandID)->generator(getCode)->Random_Key->RM(redisExecute)->RM(setAndExpire)->AQP(sendToQueue).


   <a name="1525"></a>
command type:UpdateClientPreferences
## 40)Command 1525
   Command no
   1525- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   //* if data.NotificationType == 0 *//
   2.DELETE FROM WifiClientsNotificationPreferences
   Params:AlmondMAC, ClientID, UserID

   Redis
   5.hgetall on UID_:<userList>

   Queue
   6.Send UpdateClientPreferencesResponse to MobileQueue

   Functional
   1.Command 1525

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   4.delete store[id]

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(change_wificlient_notification_preferences)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(broadcast)->broadcaster(broadcast)->MS(getSockets)->requestQueue(del)->MS(sendRequest)->RM(redisExecuteAll)->dispatchToQueues->AQP(sendToQueue).


   <a name="1526"></a>
command type:GetClientPreferences
## 41)Command 1526
   Command no
   1526- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Select FROM WifiClientsNotificationPreferences
   Params:AlmondMAC, UserID

   Functional
   1.Command 1526

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(get_wifi_notification_preferences)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


  <a name="1400"></a>
command type:RuleList
## 42)Command 1400
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Functional
   1.Command 1400

   2.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)commandMapping->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1200"></a>
command type:DeviceList
## 43)Command 1200
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT from DEVICE_DATA
   Params:AlmondMAC

   Redis 
   multi
   3.hgetall on (MAC:<AlmondMAC>,DeviceValues) 
    //Here, multi is done on all AlmondMAC and the IDs present in DeviceValues  

   Functional
   1.Command 1200

   4.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(device.execute)->genericModel(get)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1300"></a>
command type:SceneList
## 44)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT from SCENE
   Params:AlmondMAC

   Functional
   1.Command 1300

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(genericModel.execute)->genericModel(get)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1"></a>
command type:Login
## 45)Command 1
   Command no
   1- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM Date, Users
   Params:EmailID

   3.INSERT INTO UserTempPasswords
   Params:UserID, TempPassword, LastUsedTime

   7.SELECT FROM Subscriptions
   Params:AlmondMAC

   Redis
   4.hgetall on UID_:<UserID>

   6.hincrby on UID_:<packet.userid>  //value=[Q_config.SERVER_NAME,1]

   Functional
   1.Command 1

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   8.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(L.Mob_Login)->L(manualLogin)->L(Mob_Add_TempPass)->L(SetMACsToUserRedis)->RM(getAllAlmonds)->dispatcher.dispatch(Response)->socketStore(writeToMobile)->dispatcher(socketHandler)->RM(redisExecute)->secondaryModel(L.GetSubscriptions)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="806"></a>
command type:
## 46)Command 806
   Command no
   806- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Functional
   1.Command 806

   2.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="804a"></a>
command type:for device
## 47)Command 804
   Command no
   804- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Cassandra
   2.Select on dynamic_log
   params: mac,id

   Functional
   1.Command 804

   3.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(notification.get_logs)->getMACFromClientID->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="804b"></a>
command type:for client
## 48)Command 804
   Command no
   804- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.Select on WifiClients
   params:AlmondMAC,ClientID
 
   Cassandra
   3.Select on dynamic_log
   params: mac,id

   Functional
   1.Command 804

   4.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(notification.get_logs)->getMACFromClientID->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1004"></a>
command type:Super_Login 
## 49)Command 1004
   Command no
   1004- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM Users
   Params:EmailID

   3.INSERT INTO UserTempPasswords
   Params:UserID, TempPassword, LastUsedTime

   Redis
   4.hgetall on UID_:<UserID>

   6.hincrby on UID_:<packet.userid>  //value=[Q_config.SERVER_NAME,1]

   Functional
   1.Command 1004

   5.Send listResponse,commandLengthType ToMobile //where listResponse = payload

   Flow
   socket(on)->LOG(debug)->validator(do)->processor(do)->commandMapping(L.Mob_Login)->L(manualLogin)->L(Mob_Add_TempPass)->L(SetMACsToUserRedis)->RM(getAllAlmonds)->dispatcher(dispatchResponse)->socketStore(writeToMobile)->dispatcher(socketHandler)->RM(redisExecute).


   <a name="800"></a>
command type:
## 50)Command 800
   Command no
   800- XML format

   Required
   Command,CommandType,Payload

   Cassandra
   2.Select on notification_store.notification_records
   params:usr_id

   Functional
   1.Command 800
   3.Send listResponse,commandLengthType ToMobile    //where listResponse = payload

   Flow
   socket(packet)->validator(do)->processor(do)->notificationFetcher(getNotifications)->oldRowBuilder(get_notifications)->dispacher(dispatchResponse).


   <a name="1050"></a>
command type:AlmondPropertiesResponse
## 51)Command 1050
   Command no
   1050- JSON format

   Required
   Command,CommandType,Payload

   SQL
   2.SELECT FROM AlmondProperties2
   Params:AlmondMAC

   Functional
   1.Command 1050

   3.Send listResponse,commandLengthType ToMobile    //where listResponse = payload

   Flow
socket(packet)->validator(do)->processor(do)->commandMapping(almond.AlmondProperties)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


   <a name="1011"></a>
command type:CheckSubscriptionStatus
## 52)Command 1011
   Command no
   1011- JSON format

   Required
   Command,CommandType,Payload

   Redis
   2.hgetall on UID_:<packet.userid>

   Queue
   3.Send  CheckSubscriptionStatus to config.SERVER_NAME

   Functional
   1.Command 1011

   4.Send listResponse,commandLengthType ToMobile    //where listResponse = payload

   Flow
socket(packet)->validator(do)->processor(do)->commandMapping(SC.subscriptionCommands)->RM(getAlmonds)->AQP(sendToQueue)->dispatcher(dispatchResponse)->socketStore(writeToMobile).


ALMOND SERVER
## 1)Command 25-AffiliationAlmondComplete
## 2)Command 63 a-AlmondModeChange
## 3)Command 1050-DynamicAlmondProperties
## 4)Command 63 b-AlmondNameChange sucess="true"
## 5)Command 1063-UpdateIndex, UpdateDeviceIndex, UpdateDeviceName, AddScene, ActivateScene, UpdateScene, RemoveScene, RemoveAllScenes, AddRule, ValidateRule, UpdateRule, RemoveRule, RemoveAllRules, UpdateClient, RemoveClient, ChangeAlmondProperties. 
## 6)Command 104-KeepAlive
## 7)Command 1030-AlmondReset
## 8)Command 21-AffiliationAlmondRequest
## 9)Command 8-CloudReset
## 10)Command 49-DynamicAlmondNameChange
## 11)Command 153-DynamicAlmondModeChangeRequest
## 12)Command 1702-HashList
## 13)Command 106-AlmondValidationRequest
## 14)Command 1600-AddWiredSlaveMobile,ReadyToAddAsSlave
## 15)Command 1200-DynamicAllDevicesRemoved
## 16)Command 1500-DynamicClientJoined "Action"="update"
## 17)Command 1500-DynamicClientLeft "Action"="update"
## 18)Command 1200-DynamicIndexUpdated "Action":"UpdateIndex"
## 19)Command 1200-DynamicDeviceRemoved
## 20)Command 1200-DynamicDeviceUpdated "Action":"update"
## 21)Command 1300-DynamicSceneAdded "Action":"add"
## 22)Command 1300-DynamicAllSceneRemoved "Action":"remove"
## 23)Command 1300-DynamicSceneUpdated "Action":"update"
## 24)Command 1300-DynamicSceneRemoved "Action":"remove"
## 25)Command 1300-DynamicSceneActivated "Action":"update"
## 26)Command 1500-DynamicClientAdded "Action":"add"
## 27)Command 1500-DynamicClientUpdated "Action":"update"
## 28)Command 1500-DynamicClientRemoved "Action":"remove"
## 29)Command 1400-DynamicRuleAdded "Action":"add"
## 30)Command 1400-DynamicRuleUpdated "Action":"update"
## 31)Command 1400-DynamicRuleRemoved "Action":"remove"
## 32)Command 1400-DynamicAllRulesRemoved "Action":"remove"
## 33)Command 1100-RouterSummary
## 34)Command 1100-GetWirelessSettings
## 35)Command 1100-SetWirelessSettings
## 36)Command 1100-RebootRouter
## 37)Command 1100-SendLogs
## 38)Command 1100-FirmwareUpdate
## 39)Command 1050-AlmondProperties
## 40)Command 1200-DynamicDeviceList
## 41)Command 1200-DynamicDeviceAdded
## 42)Command 1500-DynamicClientList
## 43)Command 1500-DynamicAllClientsRemoved
## 44) Command no-AffiliationAlmondRequest
## 45) Command no-AffiliationCompleteResponse

  <a name="25"></a>
command type:AffiliationAlmondComplete
## 1)Command 25 
   Command no
   25- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on CODE:<code>

   9.Perform multi:
     i. hmset on UID_<UserID>       // value = (PMAC_<AlmondMAC>,1)
     ii. hmset on AL_<pMAC>         // value = (userID,key)
     iii. hdel on AL_<pMAC>         // value = [subscriptionToken]


   12.get on ICID_:<packet.ICID>    // value = null

   14.hgetall on UID_<user_list>    // Returns all the queues for users in user_list

   SQL
   3.INSERT INTO AlmondUsers
   Params:userID, AlmondMAC, AlmondName, LongSecret, ownership ,FirmwareVersion, AffiliationTS

   /*if (rows.affectedRows == 1)*/
   4.INSERT INTO AlmondProperties2
   Params:AlmondMAC,Properties,MobileProperties

   5.select from Subscriptions
   Params:AlmondMAC

   6.update on Subscriptions
   Params:AlmondMAC, UserID

   /*else*/
   7.Update on Subscriptions
      Params: AlmondMAC,UserID

   8.select from UserTempPasswords
   Params:UserID

   Queue
   13.Send Response to Queue from step 12 

   15.Send Response to All Queues returned in Step 14

   Functional
   1.Command 25

   8.delete affiliationStore[id]

   10.Delete affiliationStore[data.AlmondMAC]

   11.Send AffiliationAlmondCompleteResponse to Almond

   Flow
almondProtocol(on)->processor(do)->validate->commandMapping(AU.affiliation_almond_complete)->RM(getCode)->verify_affiliation_complete->checkAlexaCompatible->broadcaster(sendToBackground)->MS(removeAff)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->broadcaster(unicast)->RM(redisExecute).


   <a name="63"></a>
command type:AlmondModeChangeResponse success="true"
## 2)Command 63 
   Command no
   63- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<unicastID>          // value = null

   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   3.Send Response to All Queues returned in Step 2

   5.Send Response to All Queues returned in Step 4

   Functional
   1.Command 63

   Flow  almondProtocol(on)->processor(do)->validate->commandMapping(AU.dummyModel)->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1050"></a>
command type:DynamicAlmondProperties
## 3)Command 1050 
   Command no
   1050-JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Queue
   3.Send  DynamicAllDevicesRemovedResponse to BACKGROUND_QUEUEE

   5.Send Response to All Queues returned in Step 

   Redis
   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Functional
   1.Command 1050

   2.Send DynamicAlmondPropertiesResponse to Almond

   Flow
almondProtocol(on)->processor(do)->validate->commandMapping(AU.properties)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


<a name="63"></a>
command type:AlmondNameChange sucess="true"
## 4)Command 63
   Command no
   63-XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<unicastID>            // value = null

   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   3.Send Response to All Queues returned in Step 2

   5.Send Response to All Queues returned in Step 4

   Functional
   1.Command 63

   Flow
almondProtocol(on)->processor(do)->validate->commandMapping(AU.dummyModel)->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


<a name="1063"></a>
command type:UpdateIndex, UpdateDeviceIndex, UpdateDeviceName, AddScene, ActivateScene, UpdateScene, RemoveScene, RemoveAllScenes, AddRule, ValidateRule, UpdateRule, RemoveRule, RemoveAllRules, UpdateClient, RemoveClient, ChangeAlmondProperties. 
  ## 5)Command 1063
   1063-JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>                 // value = null

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1063

   Flow
   almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->RM(redisExecute)->publisher(sendToQueue).


<a name="104"></a>
command type:KeepAlive
## 6)Command 104
   Command no
   104- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   3.hmset on AL_:<socket.almondMAC>   
                           // value=[status, 1, serverconfig.Connections.RabbitMQ.Queue]
                  
   Cassandra
   // if (socket.zenAlmond)
   4.Update on cloudlogs.connection_log
     params: dateyear, mac

   Functional
   1.Command 104

   2.delete socket.almondOnline

   Flow
   almondProtocol(on)->processor(do)->commandMapping(MS.keepAlive)->RS(updateAlmond).


   <a name="1030"></a>
command type:AlmondReset
## 7)Command 1030
   Command no
   1030- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Functional
   1.Command 1030

   2.Send AlmondResetResponse to Almond

   Flow
   almondProtocol(on)->processor(do)->commandMapping(AU.almondReset)->sendToAlmond->socketStore(writeToAlmond).


  x<a name="21"></a>
command type:AffiliationAlmondRequest
## 8)Command 21
   Command no
   21- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM AlmondUsers
   Params:AlmondMAC, ownership

   3.SELECT FROM AllAlmondPlus
   Params:AlmondMAC

   Redis
   4.hgetall on CODE:<code>           // here code= get_random_string

   5.setex on CODE:<code>        
      // where code = random string,values =AlmondMAC+config.Connections.RabbitMQ.Queue

   Functional
   1.Command 21

   6.Send AffiliationAlmondResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.affiliation_almond)->AFF(affiliate_almond)->Check_If_Affiliated->Almond_ID_Check->generator(getCode)->Random_Key->RM(redisExecute)->RM(setAndExpire)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond).


   <a name="8"></a>
command type:CloudReset
## 9)Command 8
   Command no
   8- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   3.Send CloudReset to BACKGROUND_QUEUE

   5.Send Response to All Queues returned in Step 4 

   Functional
   1.Command 8

   2.Send CloudResetResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.almondReset)->sendToAlmond->socketStore(writeToAlmond)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues.


<a name="49"></a>
command type:DynamicAlmondNameChange
## 10)Command 49
   Command no
   49- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Queue
   3.Send DynamicAlmondNameChange to BACKGROUND_QUEUE

   5.Send Response to All Queues returned in Step 4

   Redis
   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Functional
   1.Command 49

   2.Send DynamicAlmondNameChangeResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


  <a name="153"></a>
command type:DynamicAlmondModeChange
## 11)Command 153
   Command no
   153- XML format

   Required
   Command,CommandType,Payload,almondMAC

   Queue
   3.Send DynamicAlmondNameChange to BACKGROUND_QUEUE

   5.Send Response to All Queues returned in Step 4

   Redis
   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Functional
   1.Command 153

   2.Send DynamicAlmondModeChangeResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.almondmode_change)->sendToAlmond->socketStore(writeToAlmond)->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1702"></a>
command type:HashList
## 12)Command 1702
   Command no
   1702- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   3.hmset on AL_:<socket.almondMAC>     //values=["router", payload.RouterMode]

   Functional
   1.Command 1702

   2.delete socket[i]

   4.Send HashListResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.checkAllHash)->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond).


   <a name="106"></a>
command type:AlmondValidationRequest
## 13)Command 106
   Command no
   106- XML format

   Required
   Command,CommandType,Payload,almondMAC

   SQL
   2.SELECT FROM AllAlmondPlus
   Params:AlmondMAC

   Functional
   1.Command 106

   3.Send AlmondValidationRequestResponse to Almond

   Flow
   almondProtocol(on)->processor(do)->validate->commandMapping(AU.Almond_Validate)->sendToAlmond->socketStore(writeToAlmond).


<a name="1600a"></a>
command type:ReadyToAddAsSlave,AddWiredSlaveMobile
## 14)Command 1600 
   Command no
   1600- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   multi
   2.hgetall on UID_:<userList>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1600

   Flow
almondProtocol(on)->processor(do)->validate->commandMapping(AU.dummyModel)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


 <a name="1200"></a>
command type:DynamicAllDevicesRemoved
## 15)Command 1200 
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    // value=[mapper.hashColumn, payload.HashNow]

   5.hgetall on UID_<user_list>        // Returns all the queues for users in user_list

   Queue
   4.Send  DynamicAllDevicesRemovedResponse to BACKGROUND_QUEUEE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1200

   3.Send DynamicAllDevicesRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->validate->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->publisher(sendToQueue).
  

<a name="1500"></a>
command type:DynamicClientJoined "Action"="update"
## 16)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientJoined to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500

   3.Send DynamicClientJoinedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


<a name="1500"></a>
command type:DynamicClientLeft "Action"="update"
## 17)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientLeft to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500

   3.Send DynamicClientLeftResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).
   

<a name="1200"></a>
command type:DynamicIndexUpdated "Action":"UpdateIndex"
## 18)Command 1200
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   7.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicIndexUpdated to config.ALEXA_QUEUE

   6.Send DynamicIndexUpdated to BACKGROUND_QUEUE

   8.Send Response to All Queues returned in Step 7

   Functional
   1.Command 1200

   3.Send DynamicIndexUpdatedResponse to Almond

   5.delete packet.alexa

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground-> broadcaster(sendToBackground)->sendToHttp->publisher(sendToQueue)->->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1200"></a>
command type:DynamicDeviceRemoved
## 19)Command 1200
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicDeviceRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1200

   3.Send DynamicDeviceRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground-> broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1200"></a>
command type:DynamicDeviceUpdated "Action":"update"
## 20)Command 1200
   Command no
   1200- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicDeviceUpdated to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1200

   3.Send DynamicDeviceUpdatedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground-> broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues.


   <a name="1300"></a>
command type:DynamicSceneAdded "Action":"add"
## 21)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicSceneAdded to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1300

   3.Send DynamicSceneAddedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->publisher(sendToQueue).

   
   <a name="1300"></a>
command type:DynamicAllSceneRemoved "Action":"remove"
## 22)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>       //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicAllSceneRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1300

   3.Send DynamicAllSceneRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->publisher(sendToQueue).

   
   <a name="1300"></a>
command type:DynamicSceneUpdated "Action":"update"
## 23)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>       //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicSceneUpdated to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1300

   3.Send DynamicSceneUpdatedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->publisher(sendToQueue).


   <a name="1300"></a>
command type:DynamicSceneRemoved "Action":"remove"
## 24)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>       //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicSceneRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1300

   3.Send DynamicSceneRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->publisher(sendToQueue).


   <a name="1300"></a>
command type:DynamicSceneActivated "Action":"update"
## 25)Command 1300
   Command no
   1300- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>       //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicSceneActivated to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1300

   3.Send DynamicSceneActivatedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->publisher(sendToQueue).


   <a name="1500"></a>
command type:DynamicClientAdded "Action":"add"
## 26)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]\

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientAdded to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500

   3.Send DynamicClientAddedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1500"></a>
command type:DynamicClientUpdated "Action":"update"
## 27)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]\

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientUpdated to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500

   3.Send DynamicClientUpdatedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1500"></a>
command type:DynamicClientRemoved "Action":"remove"
## 28)Command 1500
   Command no
   1500- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500

   3.Send DynamicClientRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1400"></a>
command type:DynamicRuleAdded "Action":"add"
## 29)Command 1400
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicRuleAdded to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1400

   3.Send DynamicRuleAddedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcast->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


<a name="1400"></a>
command type:DynamicRuleUpdated "Action":"update"
## 30)Command 1400
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicRuleUpdated to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1400

   3.Send DynamicRuleUpdatedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcast->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1400"></a>
command type:DynamicRuleRemoved "Action":"remove"
## 31)Command 1400
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicRuleRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1400

   3.Send DynamicRuleRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcast->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


   <a name="1400"></a>
command type:DynamicAllRulesRemoved "Action":"remove"
## 32)Command 1400
   Command no
   1400- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.hmset on AL_:<AlmondMAC>    //value=[mapper.hashColumn, payload.HashNow]

   Redis
   multi
   5.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Queue
   4.Send DynamicAllRulesRemoved to BACKGROUND_QUEUE

   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1400

   3.Send DynamicAllRulesRemovedResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.execute)->updateHash->RM(updateAlmond)->dispatchResponses->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcast->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).

   
  <a name="1100"></a>
command type:RouterSummary
## 33)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1100"></a>
command type:GetWirelessSettings
## 34)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1100"></a>
command type:SetWirelessSettings
## 35)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1100"></a>
command type:RebootRouter
## 36)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1100"></a>
command type:SendLogs
## 37)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1100"></a>
command type:FirmwareUpdate
## 38)Command 1100
   Command no
   1100- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Redis
   2.get on ICID_:<packet.ICID>

   Queue
   3.Send Response to All Queues returned in Step 2

   Functional
   1.Command 1100

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.dummyModel)->unicast->broadcaster(unicast)->RM(redisExecute)->publisher(sendToQueue).


   <a name="1050"></a>
command type:AlmondProperties
## 39)Command 1050
   Command no
   1050- JSON format

   Required
   Command,CommandType,Payload,almondMAC

   Queue
   3.Send AlmondProperties to BACKGROUND_QUEUE

   5.Send Response to All Queues returned in Step 4

   Redis
   multi
   4.hgetall on UID_:<userList>       // Returns all the queues for users in user_list

   Functional
   1.Command 1050

   2.Send AlmondPropertiesResponse to Almond

   Flow
almondProtocol(on)->processor(do)->commandMapping(AU.properties)->sendToAlmond->socketStore(writeToAlmond)->sendToBackground->broadcaster(sendToBackground)->publisher(sendToQueue)->broadcaster(send)->writeToMobileSockets->broadcaster(sendToRemoteUsers)->RM(redisExecuteAll)->sendToQueues->publisher(sendToQueue).


  <a name="1200"></a>
command type:DynamicDeviceList
## 40)Command 1200
   Command no
   1200- JSON format

   Required
   Command,UID,CommandType,Payload

   Redis  
   2.hmset on AL_<AlmondMAC>          //value = [mapper.hashColumn, payload.HashNow]
   5.hgetall on UID_<user_list>        // Returns all the queues for users in user_list
   Queue
   4.Send DynamicDeviceList to BACKGROUND_QUEUE
   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1200
   3.Send DynamicDeviceListResponse to Almond

   Flow
almondProtocol(packet)->processor(do)->processor(validate)->almondUsers(execute)->processor(dispatchResponses),processor(sendToBackground)->broadcaster(sendToBackground)->processor(broadcast)->broadcaster(send).


   <a name="1200"></a>
command type:DynamicDeviceAdded
## 41)Command 1200
   Command no
   1200- JSON format

   Reqired
   Command,UID,CommandType,Payload

   Redis   
   2.hmset on AL_<AlmondMAC>          //value = [mapper.hashColumn, payload.HashNow]
   5.hgetall on UID_<user_list>        // Returns all the queues for users in user_list

   Queue
   4.Send DynamicDevieAdded to BACKGROUND_QUEUE
   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1200
   3.Send DynamicDeviceAddedResponse to Almond

   Flow
   almondProtocol(packet)-> processor(do)->processor(validate)->almondUsers(execute)->processor(dispatchResponses),processor(sendToBackground)->broadcaster(sendToBackground)->processor(broadcast)->broadcaster(send)


   <a name="1500"></a>
command type:DynamicClientList
## 42)Command 1500
   Command no
   1500- JSON format

   Required
   Command,UID,CommandType,Payload

   Redis   
   2.hmset on AL_<AlmondMAC>           // value = [mapper.hashColumn, payload.HashNow]
   5.hgetall on UID_<user_list>        // Returns all the queues for users in user_list

   Queue
   4.Send DynamicClientList to BACKGROUND_QUEUE
   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500
   3.Send DynamicClientListResponse to Almond

   Flow
almondProtocol(packet)->processor(do)->processor(validate)->almondUsers(execute)->processor(dispatchResponses),processor(sendToBackground)->broadcaster(sendToBackground)->processor(broadcast)->broadcaster(send).


  <a name="1500"></a>
command type:DynamicAllClientsRemoved
## 43)Command 1500
   Command no
   1500- JSON format

   Required
   Command,UID,CommandType,Payload

   Redis   
   2.hmset on AL_<AlmondMAC>           // value = [mapper.hashColumn, payload.HashNow]
   5.hgetall on UID_<user_list>        // Returns all the queues for users in user_list

   Queue
   4.Send DynamicAllClientsRemoved to BACKGROUND_QUEUE
   6.Send Response to All Queues returned in Step 5

   Functional
   1.Command 1500
   3.Send DynamicAllClientsRemovedResponse to Almond

   Flow
almondProtocol(packet)->processor(do)->processor(validate)->almondUsers(execute)->processor(dispatchResponses),processor(sendToBackground)->broadcaster(sendToBackground)->processor(broadcast)->broadcaster(send).


   <a name="1020a"></a>
command type: AffiliationAlmondRequest
## 44) Command no
   Command no
   1020- JSON format

  Required
  Command,CommandType,Payload,AlmondMAC

  SQL -
  2.Select on AlmondUsers
      params: AlmondMAC, ownership
  3.Select on AllAlmondPlus
      params:AlmondMAC
  4.Insert on AllAlmondPlus
      params: AlmondMAC, AlmondID, FactoryDate, FactoryAdmin

  Redis
  5.hgetall on CODE:code                  // where code = random string 
  6.setex on CODE:code  
    // where code = random string,values =AlmondMAC + config.Connections.RabbitMQ.Queue

  Functional
  1.Command 1020
  7.Send AffiliationAlmondRequestResponse to Almond

 Flow
 almondProtocol(packet)-> processor(do)->processor(validate)->almondUsers(affiliation_almond)->affiliate-almond(affiliate_almond)->processor(dispatchResponses).


<a name="1020a"></a>
 command type: AffiliationCompleteResponse
  ## 45) Command no
  Command no
  1020- JSON format

  Required
  Command,CommandType,Payload,AlmondMAC

  SQL 
  3.INSERT on AlmondUsers
    Parameters: userID,AlmondMAC,AlmondName,LongSecret,ownership,FirmwareVersion,AffiliationTS
   
  // If(rows are affected)
  4.INSERT on AlmondProperties2
     Parameters: AlmondMAC,Properties,MobileProperties
  5.Select on Subscriptions
     params: AlmondMAC

  // if ((rsData.CMSCode && sRows[i].CMSCode == rsData.CMSCode) || (!rsData.CMSCode &&
  !sRows[i].CMSCode))
  6.Update on Subscriptions
    params: AlmondMAC, UserID

  //else
  7.Update on Subscriptions
    Params: AlmondMAC,UserID

  //check alexa compatible
  8.Select on UserTempPasswords
      Params: UserID

  Redis
  2.Get CODE:<code>                 // value = null
  9.Perform multi:
    i. hmset on UID_<UserID>       // value = (PMAC_<AlmondMAC>,1)
    ii. hmset on AL_<pMAC>         // value = (userID,key)
    iii. hdel on AL_<pMAC>         // value = [subscriptionToken]

  12.Get ICID_<packet.ICID>        // value = null
  14.hgetall on UID_<user_list>    // Returns all the queues for users in user_list

  Queue
  13.Send Response to Queue from step 12 
  15.Send Response to All Queues returned in Step 14

  Functional
  1.Command 1020
  10.Delete affiliationStore[data.AlmondMAC]
  11.Send AffiliationAlmondCompleteResponse to Almond

  Flow
almondProtocol(packet)->processor(do)->processor(validate)->almondUsers(affiliation_almond_complete),almondUsers(verify_affiliaion_complete)->processor(dispatchResponses),processor(unicast)->broadcaster(unicast)->processor(broadcaster)->broadcaster(send).
 
 
 
