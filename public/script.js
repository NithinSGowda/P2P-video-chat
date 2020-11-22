const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

document.querySelector('.fac').addEventListener("click",()=>{
  document.querySelector('.ask').style.display='none'
  navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideo, {stream: stream,screen:true})
  
    myPeer.on('call', call => {
      console.log("line 17");
      call.answer(stream, {stream: stream,screen:true})
      const video = document.createElement('video')
      call.on('stream', (userVideoStream, obj) => {
        console.log("line 20", userVideoStream.metadata);
        addVideoStream(video, {stream: userVideoStream.stream,screen: userVideoStream.screen})
      })
    })
  
    socket.on('user-connected', userId => {
      connectToNewUser(userId, {stream: stream,screen:true})
    })
  })
})

document.querySelector('.stu').addEventListener("click",()=>{
  document.querySelector('.ask').style.display='none'
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideo, {stream: stream,screen:false})
  
    myPeer.on('call', call => {
      console.log("line 41");
      call.answer(stream, {stream: stream,screen:false})
      const video = document.createElement('video')
      call.on('stream', (userVideoStream, obj) => {
        console.log("line 44", userVideoStream.metadata);
        addVideoStream(video, {stream: userVideoStream, screen:userVideoStream.screen})
      })
    })
  
    socket.on('user-connected', userId => {
      connectToNewUser(userId, {stream: stream,screen:false})
    })
  })
})


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, nstream) {
  console.log("line 66", nstream);
  const call = myPeer.call(userId, nstream.stream, nstream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream, obj) => {
    console.log("line 68", userVideoStream.metadata);
    addVideoStream(video, {stream: userVideoStream, screen:userVideoStream.screen})
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream.stream
  if(stream.screen){
    video.setAttribute("class","screen")
  }
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}