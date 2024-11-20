document.getElementById('moveButton').addEventListener('click', function () {
    var moveModalContainer = document.querySelector('.moveModalContainer');
    moveModalContainer.classList.add('active'); // 모달을 보이도록 active 클래스 추가
});

document.getElementById('myChatBox').innerHTML = (
    "hi"
);