const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {

})
let myVideoStream, myScreenStream;
const myVideo = document.createElement('video')
myVideo.setAttribute("class","video")
const myScreen = document.createElement('video')
myScreen.setAttribute("class","screen")
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(vstream => {
  navigator.mediaDevices.getDisplayMedia({
  video: true
  }).then(sstream => {
      myVideoStream = vstream;
      myScreenStream = sstream;
      addVideoStream(myVideo, vstream)
      addVideoStream(myScreen, sstream)
      myPeer.on('call', call => {
        call.answer(sstream,vstream)
        const video = document.createElement('video')
        const video2 = document.createElement('video')
        video.setAttribute("class","video")
        video2.setAttribute("class","video")

        call.on('stream', userStream => {
          addVideoStream(video, userStream.userVideoStream)
          addVideoStream(video2, userStream.userScreenStream)
        })
      })

      socket.on('user-connected', userId => {
        connectToNewUser(userId, sstream, vstream)
      })

      // input value
      let text = $("input");
      // when press enter send message
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          socket.emit('message', text.val());
          text.val('')
        }
      });
      socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
      })
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, sstream, vstream) {
  const call = myPeer.call(userId, {sstream, vstream})
  const video = document.createElement('video')
  const video2 = document.createElement('video')
  video.setAttribute("class","video")
  video2.setAttribute("class","video")

  call.on('stream', userStream => {
    addVideoStream(video, userStream.userVideoStream)
    addVideoStream(video2, userStream.userScreenStream)
  })
  call.on('close', () => {
    video.remove()
    video2.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
