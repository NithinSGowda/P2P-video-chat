const socket = io('/')
const myPeer = new Peer(undefined);
let myVideoStream;
const myVideo = document.getElementById('my-video')
if(myVideo != null) myVideo.muted = true;
const chat_messages = document.getElementById('messages')
const peers = {}
const currentUserId = "";
var pathArray = window.location.pathname.split('/');
type=pathArray[2]

if(type=="screen"){
  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always"
    },
    audio: true
  }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream)

    myPeer.on('call', (call) => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(myVideo, stream)
        addchildVideoStream("User", video, userVideoStream)

      })

      call.on('close', () => {
        video.remove()
      })
    
    })

    let text = $("#mesage-input");
    $('#mesage-input').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      if(text.val().trim() ===new String('clear').valueOf()){
        document.getElementById('messages').innerHTML ="";
        text.val('')
      }else{
        socket.emit('message', text.val());
        text.val('')
      }
    }
    });

    socket.on("createMessage", (message,userId) => {
      var msg_reciever = document.createElement('div');
      msg_reciever.className='msg-reciever';
      var name = document.createElement('div');
      name.className='name';
      var msg = document.createElement('div');
      msg.className='msg';
      msg_reciever.appendChild(name);
      name.innerHTML=userId;
      msg_reciever.appendChild(msg);
      msg.innerHTML=message;
      document.getElementById('messages').appendChild(msg_reciever);
    })
    socket.on('user-connected', userId => {
      postAboutpeer(`${userId} joined the room`);
      connectToNewUser(userId, myVideoStream)
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) {
        postAboutpeer(`${userId} left the room`);
        document.getElementById('peer-'+userId).remove();
        peers[userId].close()
      }else{
        postAboutpeer(`${userId} left the room`);
        document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log("Peer already removed");
      }
    })

    myPeer.on('open', id => {
      socket.emit('join-room', ROOM_ID, id)
    })

})

}else{
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      }
    })
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, myVideoStream)

        myPeer.on('call', (call) => {
          call.answer(stream)
          const video = document.createElement('video')
          call.on('stream', (userVideoStream) => {
            addVideoStream(myVideo, stream)
            addchildVideoStream("User", video, userVideoStream)

          })

          call.on('close', () => {
            video.remove()
          })
        
        })

        let text = $("#mesage-input");
  $('#mesage-input').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      if(text.val().trim() ===new String('clear').valueOf()){
        document.getElementById('messages').innerHTML ="";
        text.val('')
      }else{
        socket.emit('message', text.val());
        text.val('')
      }
    }
  });

  socket.on("createMessage", (message,userId) => {
      var msg_reciever = document.createElement('div');
      msg_reciever.className='msg-reciever';
      var name = document.createElement('div');
      name.className='name';
      var msg = document.createElement('div');
      msg.className='msg';
      msg_reciever.appendChild(name);
      name.innerHTML=userId;
      msg_reciever.appendChild(msg);
      msg.innerHTML=message;
      document.getElementById('messages').appendChild(msg_reciever);
  })

  socket.on('user-connected', userId => {
    postAboutpeer(`${userId} joined the room`);
    connectToNewUser(userId, myVideoStream)
  })
  
  socket.on('user-disconnected', userId => {
    if (peers[userId]) {
      postAboutpeer(`${userId} left the room`);
      document.getElementById('peer-'+userId).remove();
      peers[userId].close()
    }else{
      postAboutpeer(`${userId} left the room`);
      document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log("Peer already removed");
    }
  })
  
  myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
  })

  })
}



function connectToNewUser(userId, stream) {
  var call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(myVideo, stream)
    addchildVideoStream(userId, video, userVideoStream)

  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}


function addVideoStream(video, stream) {
  video.srcObject= stream;
  // video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

}

function addchildVideoStream(userId,video, stream) {
  video.srcObject= stream;
  video.id=`peerscreen-${userId}`;
  video.className="user-small-video card-img bg-black-dark";
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  var card = document.createElement('div');
  card.className="card single-user  text-white mb-2";
  card.id="peer-"+userId;

  var card_overlay = document.createElement('div');
  card_overlay.className="card-img-overlay";
  
  var card_title = document.createElement('div');
  card_title.className="card-title";
  card_title.innerHTML=userId;

  var show_view = document.createElement('div');
  show_view.className="show_view mt-5";
  
  var option_btn = document.createElement('div');
  option_btn.className="btn option-btn  rounded-circle";
  

  var i = document.createElement('i');
  i.className="fa fa fa-expand expand-btn";

  const host = document.createAttribute('onclick')
  host.value = `expand_to_screen('peerscreen-${userId}')`;
  i.setAttributeNode(host);

  card.appendChild(video);
  var card_child_append = card.appendChild(card_overlay);
  card_child_append.appendChild(card_title);
  card_child_append.appendChild(show_view).appendChild(option_btn).appendChild(i);


  document.getElementById('other-users-video').append(card)
}
function postAboutpeer(msg){
  var newUser = document.createElement('div');
  newUser.className ='helper';
  newUser.innerHTML=msg;
  chat_messages.append(newUser);
}


// UTILITY FUNCTIONS

document.getElementById('expand-main').addEventListener('click',()=>{
  expand(document.getElementById('my-video'));
});
document.getElementById('cpy-link-btn').addEventListener('click',()=>{
  document.getElementById("shareable-cpy-link").value="aselpanda.ml/"+ROOM_ID;
  $('#cpy-link-model').css('display','block')
})
document.getElementById('close-model-btn').addEventListener('click',()=>{
  $('#cpy-link-model').css('display','none')
})
document.getElementById('cpy-text-btn').addEventListener('click',()=>{
    let copyTextarea = document.querySelector('#shareable-cpy-link');
    copyTextarea.focus();
    copyTextarea.select();
    try {
      let successful = document.execCommand('copy');
    } catch(err) {
      alert('Unable to copy');
    }
  $('#cpy-link-model').css('display','none')
})

document.querySelector('.screen-share').setAttribute("href","/"+ROOM_ID+"/screen")

function expand_to_screen(a){
  var elem = document.getElementById(a);
  expand(elem);
}
function expand(elem)
{
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }

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
  `
  document.querySelector('#main__mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
  const html = `
    <i class="fas fa-microphone-slash"></i>
  `
  document.querySelector('#main__mute_button').innerHTML = html;
}
const setStopVideo = () => {
  const html = `
  <i class=" fas fa-video"></i>
  `
  document.querySelector('#main__video_button').innerHTML = html;
}
const setPlayVideo = () => {
  const html = `
  <i class="fas fa-video-slash"></i>

  `
  document.querySelector('#main__video_button').innerHTML = html;
}

function d(msg){
  console.log(msg)
}