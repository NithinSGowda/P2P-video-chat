const socket = io('/')
const myPeer = new Peer(undefined);
let myVideoStream;
const myVideo = document.getElementById('my-video')
if(myVideo != null) myVideo.muted = true;
const chat_messages = document.getElementById('messages')
let peers = {}
const currentUserId = "";
var pathArray = window.location.pathname.split('/');
type=pathArray[2]

var peerUpdateInterval = setInterval(()=>{
  if(myPeer){
    updateDB()
    clearInterval(peerUpdateInterval)
  }
},500)


if(type=="screen"){
  navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream)

    myPeer.on('call', (call) => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(myVideo, stream)
        console.log(userVideoStream, myPeer._id);
        addchildVideoStream(myPeer._id, video, userVideoStream)
      })

      call.on('close', () => {
        video.parentElement.remove()
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
      fetch("http://localhost:8080/user/"+userId)
        .then(response => response.text())
        .then(result => {
          console.log(JSON.parse(result));
          var msg_reciever = document.createElement('div');
          msg_reciever.className='msg-reciever';
          var name = document.createElement('div');
          name.className='name';
          var msg = document.createElement('div');
          msg.className='msg';
          msg_reciever.appendChild(name);
          name.innerHTML=JSON.parse(result)[0].name;
          msg_reciever.appendChild(msg);
          msg.innerHTML=message;
          document.getElementById('messages').appendChild(msg_reciever);
        })
        .catch(error => console.log('error', error));
    })
    socket.on('user-connected', userId => {
      fetch("http://localhost:8080/user/"+userId)
        .then(response => response.text())
        .then(result => {
          postAboutpeer(`${JSON.parse(result)[0].name} joined the room`);
          connectToNewUser(userId, myVideoStream)
        })
        .catch(error => console.log('error', error));
    })

    socket.on('user-disconnected', userId => {
      fetch("http://localhost:8080/user/"+userId)
        .then(response => response.text())
        .then(result => {
          if (peers[userId]) {
            postAboutpeer(`${JSON.parse(result)[0].name} left the room`);
            document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log(JSON.parse(result)[0].name+" was already removed");
            peers[userId].close()
          }else{
            postAboutpeer(`${JSON.parse(result)[0].name} left the room`);
            document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log(JSON.parse(result)[0].name+" already removed");
          }
        })
        .catch(error => console.log('error', error));
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
            console.log(userVideoStream, myPeer._id);
            addchildVideoStream(myPeer._id, video, userVideoStream)
          })

          call.on('close', () => {
            video.parentElement.remove()
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
    fetch("http://localhost:8080/user/"+userId)
      .then(response => response.text())
      .then(result => {
        // console.log(JSON.parse(result));
        var msg_reciever = document.createElement('div');
        msg_reciever.className='msg-reciever';
        var name = document.createElement('div');
        name.className='name';
        var msg = document.createElement('div');
        msg.className='msg';
        msg_reciever.appendChild(name);
        name.innerHTML=JSON.parse(result)[0].name;
        msg_reciever.appendChild(msg);
        msg.innerHTML=message;
        document.getElementById('messages').appendChild(msg_reciever);
      })
      .catch(error => console.log('error', error));
  })

  socket.on('user-connected', userId => {
    fetch("http://localhost:8080/user/"+userId)
        .then(response => response.text())
        .then(result => {
          postAboutpeer(`${JSON.parse(result)[0].name} joined the room`);
          connectToNewUser(userId, myVideoStream)
        })
        .catch(error => console.log('error', error));
  })
  
  socket.on('user-disconnected', userId => {
    fetch("http://localhost:8080/user/"+userId)
      .then(response => response.text())
      .then(result => {
        if (peers[userId]) {
          postAboutpeer(`${JSON.parse(result)[0].name} left the room`);
          document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log(JSON.parse(result)[0].name+" was already removed");
          peers[userId].close()
        }else{
          postAboutpeer(`${JSON.parse(result)[0].name} left the room`);
          document.getElementById('peer-'+userId) ? document.getElementById('peer-'+userId).remove() : console.log(JSON.parse(result)[0].name+" already removed");
        }
      })
      .catch(error => console.log('error', error));
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
    video.parentElement.remove()
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

  fetch("http://localhost:8080/user/"+userId)
  .then(response => response.text())
  .then(result => {
    var card_title = document.createElement('div');
    card_title.className="card-title";
    card_title.innerHTML=JSON.parse(result)[0].name;
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
  })
  .catch(error => console.log('error', error));
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

function updateDB(){
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({"name":localStorage.getItem("name"),"peerId":myPeer._id});
  var requestOptions={
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://localhost:8080/user/add", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}