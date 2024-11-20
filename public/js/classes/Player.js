class Player {
  constructor({ x, y, radius, color, username, imgSrc }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
    this.imgSrc = imgSrc;

    // imgSrc 경로를 사용하여 이미지 객체 생성
    this.image = new Image();
    this.image.src = imgSrc;

    // 이미지 로드 확인
    this.image.onload = () => {
      console.log('Image loaded successfully ', imgSrc);
    };

    this.image.onerror = () => {
      console.error('Failed to load image:', imgSrc);
      this.image = null; // 이미지 로드 실패 시 null로 설정
    };
  }

  draw() {
    // 플레이어 이름을 이미지 위에 그리기
    c.font = '12px sans-serif';
    c.fillStyle = 'white';
    c.fillText(this.username, this.x - 10, this.y + 30);

    // 이미지가 로드된 경우 그리기, 그렇지 않으면 원을 그리기
    const imgSize = this.radius * 4; // 이미지 크기를 반경의 4배로 설정 (필요에 따라 조정 가능)
    if (this.image && this.image.complete) {
      c.drawImage(
        this.image,
        this.x - imgSize / 2,
        this.y - imgSize / 2,
        imgSize,
        imgSize
      );
    } else {
      // 이미지가 없을 경우 기본 원으로 그리기
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color;
      c.fill();
    }

    c.restore();
  }
}