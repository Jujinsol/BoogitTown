document.addEventListener('DOMContentLoaded', () => {
    // 현재  가져오기
    const now = new Date();
    // 12시간 기준 시와 분
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0'); // 분 (2자리로 표시)
    const period = hours >= 12 ? 'PM' : 'AM'; // AM/PM 결정
    // 12시간제로 변환
    hours = hours % 12 || 12; // 0시를 12시로 변경
    // 첫 줄: 연도와 요일
    const year = now.getFullYear();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    // 두 번째 줄: 월과 일
    const month = now.getMonth() + 1;
    const day = now.getDate();
    // id="date" 객체에 내용 추가
    document.getElementById('date').innerHTML = `
        <div id="line1">${year} ${weekday}</div>
        <div id="line2">${month} ${day}</div>
    `;
    // id="time" 요소에 시간 표시
    document.getElementById('time').innerHTML = `
        <div id="hhmm">${hours}:${minutes}</div> 
        <div id="ampm">${period}</div>
    `;

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

    
});

// 방 만들기 창 표시 함수
function showcreateRoom(event) {
    event.preventDefault(); // 폼 제출 방지
    document.getElementById("createRoom").classList.add("active");
}
// 방 만들기 창 닫기 함수
function closecreateRoom() {
    document.getElementById("createRoom").classList.remove("active");
}
