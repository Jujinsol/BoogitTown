document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0'); // 분 (2자리로 표시)
    const period = hours >= 12 ? 'PM' : 'AM'; // AM/PM 결정
    hours = hours % 12 || 12; // 0시를 12시로 변경
    const year = now.getFullYear();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    document.getElementById('date').innerHTML = `
        <div id="line1">${year} ${weekday}</div>
        <div id="line2">${month} ${day}</div>
    `;
    document.getElementById('time').innerHTML = `
        <div id="hhmm">${hours}:${minutes}</div> 
        <div id="ampm">${period}</div>
    `;
    // 내프로필 클릭
    const myProfile = document.querySelector('.myProfile');
    myProfile.addEventListener('click', () => {
        window.location.href = 'myinfo.html';
    });
    // 방 만들기 암호 4자리
    const input = document.getElementById('number-input');
    input.addEventListener('input', (event) => {
        let value = event.target.value;
        // 숫자 외의 값 제거
        value = value.replace(/[^0-9]/g, '');
        // 4자리 초과 입력 방지
        if (value.length > 4) {
            value = value.slice(0, 4);
        }
        // 값 반영
        event.target.value = value;
    });

    // 방 만들기 버튼 클릭
    const roomMake = document.getElementById('roomMake');
    roomMake.addEventListener('click', (event) => {
        event.preventDefault(); // 버튼 기본 동작 방지
        closecreateRoom();
        updateLayout(); // 스타일 및 요소 추가
    });
    // 채팅방 클릭
    const room = document.getElementById('room');
    room.addEventListener('click', (event) => {
        updateLayout(); // 동일한 스타일 및 요소 추가
    });
    // 알림창 띄우기
    const notificationButton = document.getElementById('notificationButton');
    const notification = document.getElementById('notification');
    notificationButton.addEventListener('click', () => {
        notification.classList.add('active'); // 알림창에 'active' 클래스 추가
    });
    document.addEventListener('click', (event) => {
        if (notification.contains(event.target) || event.target === notificationButton) {
            return;
        }
        notification.classList.remove('active'); // 'active' 클래스 제거
    });
});
// enter키로 전송가능
document.getElementById('sendInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {  // Enter 키가 눌렸을 때
        event.preventDefault();  // 기본 동작(입력값 전송)을 방지
        document.getElementById('sendButton').click();  // sendButton 클릭 실행
    }
});
// 채팅방 레이아웃으로 변경
function updateLayout() {
    const screen = document.getElementById('screen');
    const bottom = document.getElementById('bottom');
    const chat = document.getElementById('chat');
    const sendInput = document.getElementById('sendInput');

    // 채팅방 상단 생성
    const roomTop = document.createElement('div');
    roomTop.id = 'roomTop';
    bottom.appendChild(roomTop);

    // 새로 만든 뒤로가기 버튼
    const newBackButton = document.createElement('button');
    newBackButton.textContent = '←';
    newBackButton.id = 'newBackButton';
    roomTop.appendChild(newBackButton);

    // 방제목 표시
    const roomTitle = document.createElement('div');
    roomTitle.textContent = '방제';
    roomTitle.id = 'roomTitle';
    roomTop.appendChild(roomTitle);

    // 스타일 변경
    screen.style.width = '60%';
    screen.style.height = '765px';
    bottom.style.width = '39%';
    bottom.style.height = '765px';
    bottom.style.margin = '0px';
    bottom.style.marginLeft = '15px';
    bottom.style.gap = '5px';
    bottom.style.paddingLeft = '0px';
    chat.style.flexDirection = 'column';
    chat.style.height = '80%';
    chat.style.margin = '70px 10px 5px 0';
    sendInput.style.width = '70%';

    // 뒤로가기 버튼 클릭 시 초기화
    newBackButton.addEventListener('click', () => {
        resetLayout();
        roomTop.removeChild(newBackButton);
        roomTop.removeChild(roomTitle);
        bottom.removeChild(roomTop);
    });
}
// 채팅방 뒤로가기 버튼 기능
function resetLayout() {
    const screen = document.getElementById('screen');
    const bottom = document.getElementById('bottom');
    const chat = document.getElementById('chat');
    const sendInput = document.getElementById('sendInput');

    screen.style.width = '';
    screen.style.height = '';
    bottom.style.width = '';
    bottom.style.height = '';
    bottom.style.margin = '';
    bottom.style.marginLeft = '';
    bottom.style.gap = '';
    bottom.style.paddingLeft = '';
    chat.style.flexDirection = '';
    chat.style.height = '';
    chat.style.margin = '';
    sendInput.style.width = '';
}
// 방 만들기 창 표시 함수
function showcreateRoom(event) {
    event.preventDefault(); // 폼 제출 방지
    document.getElementById("createRoom").classList.add("active");
}
// 방 만들기 창 닫기 함수
function closecreateRoom() {
    document.getElementById("createRoom").classList.remove("active");
}
