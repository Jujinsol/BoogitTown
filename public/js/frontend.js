const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        imgSrc: `./img/${backEndPlayer.imgSrc}.png`,
      });

      document.querySelector(
        '#playerLabels'
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}`

      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute('data-score', backEndPlayer.score)

      // sorts the players divs
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        return scoreB - scoreA
      })

      // removes old elements
      childDivs.forEach((div) => {
        parentDiv.removeChild(div)
      })

      // adds sorted elements
      childDivs.forEach((div) => {
        parentDiv.appendChild(div)
      })

      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

      if (id === socket.id) {
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      }
    }
  }

  // this is where we delete frontend players
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if (id === socket.id) {
        document.querySelector('#loginForm').style.display = 'block'
      }

      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]

    // linear interpolation
    if (frontEndPlayer.target) {
      frontEndPlayers[id].x +=
        (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
      frontEndPlayers[id].y +=
        (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
    }

    frontEndPlayer.draw()
  }
}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 5
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    // frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    // frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    // frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  document.querySelector('#loginForm').style.display = 'none'

  if (response.ok) {
    socket.emit('initGame', {
      width: canvas.width,
      height: canvas.height,
      devicePixelRatio,
      username: data.nickname,
      imgSrc: data.img
    })
  } else {
    window.location.href = '/index.html';
  }
  document.getElementById('hiddenContent').style.display = 'block';
})

document.getElementById('createRoom').addEventListener('submit', async (e) => {
  e.preventDefault();

  var name = document.getElementById('titleInput').value;

  const response = await fetch('/chat/create-chatroom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  const data = await response.json();

  if (response.ok) {
    alert('Create Room successful!');
  } else {
    const errorText = await response.text(); // JSON이 아니면 텍스트로 읽기
    console.error('Error:', errorText);
    throw new Error(`Failed to create room: ${response.statusText}`);
  }
});

function openModal() {
  var moveModalContainer = document.querySelector('.moveModalContainer');
  moveModalContainer.classList.add('active'); // 모달을 보이도록 active 클래스 추가
  document.getElementById('getRoom').style.display = 'block';
  loadChatRooms(); // 채팅방 목록 로드
}

document.getElementById('makeRoomButton').addEventListener('click', function () {
  var roomModalContainer = document.querySelector('.roomModalContainer');
  roomModalContainer.classList.add('active'); // 모달을 보이도록 active 클래스 추가
});

let currentRoomId = null;
let currentPlayerId = null;

// 채팅방 로드 함수
async function loadChatRooms() {
  try {
    const response = await fetch('/chat/load-chatroom', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load chat rooms: ${errorText}`);
    }

    const chatRooms = await response.json();
    const chatRoomList = document.getElementById('chatRoomList');
    chatRoomList.innerHTML = ''; // 기존 목록 초기화

    // 채팅방 목록 생성
    chatRooms.forEach((room) => {
      const btn = document.createElement('button');
      btn.className = 'chat-room-btn';
      btn.textContent = `채팅방: ${room.name}`;
      btn.onclick = () => {
        currentRoomId = room.name; // 선택된 채팅방 ID 저장
        enterChatRoom(); // 채팅방 입장
      };

      chatRoomList.appendChild(btn);
    });
  } catch (err) {
    console.error('Error:', err.message);
    alert(`Error: ${err.message}`);
  }
}

// 채팅방 입장
function enterChatRoom() {
  document.getElementById('roomTitle').textContent = `채팅방: ${currentRoomId}`;
  document.getElementById('getRoom').style.display = 'none';
  document.getElementById('hiddenContent').style.display = 'none';
  document.getElementById('chatRoom').style.display = 'block';
  loadMessages(); // 메시지 로드
}

async function loadMessages() {
  try {
    const response = await fetch(`/chat/get-messages/${currentRoomId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load messages: ${errorText}`);
    }

    // 응답 데이터를 JSON으로 파싱
    const data = await response.json();
    const messages = data.messages; // messages 배열 추출

    if (!Array.isArray(messages)) {
      throw new Error('Invalid data format: messages should be an array.');
    }

    // 기존 메시지 초기화
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    // 메시지 목록 생성
    messages.forEach((msg) => {
      const messageDiv = document.createElement('div');
      messageDiv.style.display = 'flex';
      messageDiv.style.justifyContent = 'space-between';

      const senderSpan = document.createElement('span');
      senderSpan.textContent = `${msg.user_id}: ${msg.content}`;

      const timestampSpan = document.createElement('span');
      timestampSpan.textContent = `${msg.timestamp}`;
      timestampSpan.style.paddingRight = '1px';

      messageDiv.appendChild(senderSpan);
      messageDiv.appendChild(timestampSpan);
      chatMessages.appendChild(messageDiv);
    });

    // 스크롤을 맨 아래로 이동
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error('Error:', err.message);
    alert(`Error: ${err.message}`);
  }
}

async function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (!message) {
    alert('메시지를 입력해주세요.');
    return;
  }
  
  try {
    // HTTP POST 요청으로 메시지 전송
    const response = await fetch('/chat/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatroom_id: currentRoomId,
        user_id: frontEndPlayers[socket.id]?.username,
        content: message
      }),
    }); 
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      senderId: frontEndPlayers[socket.id]?.username, // 로그인한 사용자 ID
      message,
    });
    loadMessages(); messageInput.value = '';

  } catch (err) {
    console.error('Error:', err.message);
    alert(`Error: ${err.message}`);
  }
}

// 새 메시지를 서버에서 수신했을 때 처리
socket.on('newMessage', ({ user_id, content, timestamp }) => {
  console.log(`새 메시지: ${user_id} - ${content}`);
  loadMessages(); // 새 메시지 조회
});

// 채팅방 나가기
function exitRoom() {
  currentRoomId = null;
  document.getElementById('chatRoom').style.display = 'none';
  document.getElementById('getRoom').style.display = 'block';
  document.getElementById('hiddenContent').style.display = 'block';
}

function CloseModal() {
  var moveModalContainer = document.querySelector('.moveModalContainer');
  moveModalContainer.classList.remove('active'); // active 클래스를 제거하여 모달 닫기

  var roomModalContainer = document.querySelector('.roomModalContainer');
  roomModalContainer.classList.remove('active'); // active 클래스를 제거하여 모달 닫기
}

function goToSignup() {
  window.location.href = 'signup.html';
}