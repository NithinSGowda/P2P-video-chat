# N-Chat

Project presentation can be found <a href="https://github.com/qazi9amaan/DecentralisedVIdeoConference/raw/master/presentation_team12.ppt">here</a>.
<br><br>

## Inroduction
Privacy is the driving force behind this project. It uses secure technologies like WebRTC , PeerJs , SocketIO to directly connect between participants. The website that provides the web app and mediates the communication stores as few data as possible (nearly negligible) and does not know anything about the contents of established conversations. No accounts are required. No cookies are used. No data is being saved!.  

Our Conferencing Chat Room is completely decentralised and transfers your video directly to the peer you are talking to without the need of servers in the middle. <br>
This project was developed with [Peer JS][NodeJs] [SocketIO].


## Deployment server

Run `npm start` or `nodemon server.js` to start the server Then  Navigate to `http://localhost:8080/` or  `https://nchat.ml/` (which is locally hosted). The app will start loading and you can join any room and start a conference in a secure environment.

## Screenshots

### Room Page
<img src="/ss/2.png"></img>

## Features
1. Decentralised Servers 
2. Live chat (connection oriented) can support multiple users
3. Only initial connection depends on server, once connected to a specific room your network is secure and decentralised.
4. Mongo DB used
4. No login / register .

## Extension
1. Include ScreenShare
2. Provide dedicated rooms
3. Record Meetings
4. Allow short urls to join meeting
