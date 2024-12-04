const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 맵 및 캐릭터 설정
const mapWidth = 2000; // 맵의 너비
const mapHeight = 2000; // 맵의 높이
const character = {
    x: mapWidth / 2, // 캐릭터 초기 위치
    y: mapHeight / 2,
    size: 20,
    speed: 5
};

// 카메라와 줌 설정
const camera = {
    x: character.x,
    y: character.y,
    width: canvas.width,
    height: canvas.height,
    zoom: 1.5 // 확대 배율 (1 이상으로 설정)
};

// 키 입력 상태 저장
const keys = {};

// 키 입력 이벤트
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// 게임 루프
function gameLoop() {
    // 캐릭터 이동
    if (keys['ArrowUp']) character.y -= character.speed;
    if (keys['ArrowDown']) character.y += character.speed;
    if (keys['ArrowLeft']) character.x -= character.speed;
    if (keys['ArrowRight']) character.x += character.speed;

    // 카메라를 캐릭터 중심으로 설정
    camera.x = character.x - (camera.width / 2) / camera.zoom;
    camera.y = character.y - (camera.height / 2) / camera.zoom;

    // 화면 그리기
    draw();

    requestAnimationFrame(gameLoop);
}

// 그리기 함수
function draw() {
    // 배경 및 카메라 줌 설정
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom); // 확대 설정
    ctx.translate(-camera.x, -camera.y); // 카메라 이동

    // 맵 그리기
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // 캐릭터 그리기
    ctx.fillStyle = 'blue';
    ctx.fillRect(
        character.x - character.size / 2,
        character.y - character.size / 2,
        character.size,
        character.size
    );

    ctx.restore(); // 화면 상태 복원
}

// 게임 시작
gameLoop();