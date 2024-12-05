const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/db'); // DB 연결 파일

const chatRouter = require('./chat'); // chat.js 불러오기

const app = express();
const path = require('path');
require('dotenv').config();

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' folder
app.use('/chat', chatRouter);
app.use(express.static(__dirname + '/boogietown-dadadadamin'));

// Backend data structures
const backEndPlayers = {};

const SPEED = 5;
const RADIUS = 10;

// 미들웨어 설정
app.use(bodyParser.json());

// 회원가입 API
app.post('/signup', async (req, res) => {
    const { email, password, nickname, character, name, studentnum, major } = req.body;

    if (!email || !password || !nickname || !name || !studentnum || !major) {
        return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
        const query = `INSERT INTO users (email, password, nickname, img, name, studentnum, major) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(query, [email, hashedPassword, nickname, character, name, studentnum, major], (err, result) => {
            if (err) {
                console.error('회원가입 오류:', err);
                return res.status(500).json({ message: '회원가입 실패' });
            }
            res.status(201).json({ message: '회원가입 성공' });
        });
    } catch (err) {
        console.error('회원가입 처리 중 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인 API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해야 합니다.' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('로그인 오류:', err);
            return res.status(500).json({ message: '로그인 실패' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        res.status(200).json({
            message: '로그인 성공', userId: user.id, nickname: user.nickname,
            img: user.img, major: user.major, studentnum: user.studentnum, name: user.name
        });
    });
});

// 로그아웃 API
app.post('/logout', (req, res) => {
    res.status(200).json({ message: '로그아웃 성공' });
});

// 회원탈퇴 API
app.delete('/delete', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
    }

    const query = `DELETE FROM users WHERE id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('회원탈퇴 오류:', err);
            return res.status(500).json({ message: '회원탈퇴 실패' });
        }

        res.status(200).json({ message: '회원탈퇴 성공' });
    });
});

// 정보수정 API
app.put('/update', async (req, res) => {
    const { id, password, nickname, studentnum, major } = req.body;

    if (!id || (!password && !nickname && !major)) {
        return res.status(400).json({ message: '수정할 데이터를 입력해야 합니다.' });
    }

    try {
        let updates = [];
        let values = [];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }
        if (nickname) {
            updates.push('nickname = ?');
            values.push(nickname);
        }
        if (studentnum) {
            updates.push('studentnum = ?');
            values.push(studentnum);
        }
        if (major) {
            updates.push('major = ?');
            values.push(major);
        }

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('정보수정 오류:', err);
                return res.status(500).json({ message: '정보 수정 실패' });
            }

            res.status(200).json({ message: '정보 수정 성공' });
        });
    } catch (err) {
        console.error('정보수정 처리 중 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});
// 현재 접속 인원 수를 관리할 변수
let onlineUsers = 0;
// Socket.io events
io.on('connection', (socket) => {
    console.log('a user connected');
    //접속 인원 관리 코드 추가
    onlineUsers++;
    io.emit('updateOnlineUsers', { onlineUsers }); // 모든 클라이언트에 접속 인원 브로드캐스트
    console.log(`User connected. Current online users: ${onlineUsers}`);

    io.emit('updatePlayers', backEndPlayers);
    socket.on('initGame', ({ username, width, height, imgSrc, major }) => {
        backEndPlayers[socket.id] = {
            x: 512,
            y: 288,
            color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNumber: 0,
            score: 0,
            username,
            imgSrc,
            major
        };

        // Initialize canvas properties
        backEndPlayers[socket.id].canvas = {
            width,
            height,
        };

        backEndPlayers[socket.id].radius = RADIUS;
    });

    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        console.log(`User joined room ${roomId}`);
    });

    socket.on('sendMessage', ({ roomId, senderId, message }) => {
        const timestamp = new Date();
        io.emit('newMessage', { senderId, message, timestamp });
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);

        // 접속 인원 감소 처리
        onlineUsers--;
        io.emit('updateOnlineUsers', { onlineUsers }); // 클라이언트로 접속 인원 브로드캐스트

        console.log(`User disconnected. Current online users: ${onlineUsers}`);
        delete backEndPlayers[socket.id];
        io.emit('updatePlayers', backEndPlayers);
    });

    socket.on('keydown', ({ keycode, sequenceNumber, imgSrc }) => {
        const backEndPlayer = backEndPlayers[socket.id];

        if (!backEndPlayers[socket.id]) return;

        backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case 'KeyW':
                backEndPlayers[socket.id].y -= SPEED;
                backEndPlayers[socket.id].imgSrc = imgSrc;
                break;

            case 'KeyA':
                backEndPlayers[socket.id].x -= SPEED;
                backEndPlayers[socket.id].imgSrc = imgSrc;
                break;

            case 'KeyS':
                backEndPlayers[socket.id].y += SPEED;
                backEndPlayers[socket.id].imgSrc = imgSrc;
                break;

            case 'KeyD':
                backEndPlayers[socket.id].x += SPEED;
                backEndPlayers[socket.id].imgSrc = imgSrc;
                break;
        }

        const playerSides = {
            left: backEndPlayer.x - backEndPlayer.radius,
            right: backEndPlayer.x + backEndPlayer.radius,
            top: backEndPlayer.y - backEndPlayer.radius,
            bottom: backEndPlayer.y + backEndPlayer.radius,
        };

        if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius;
        if (playerSides.right > 1024)
            backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius;
        if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius;
        if (playerSides.bottom > 576)
            backEndPlayers[socket.id].y = 576 - backEndPlayer.radius;
    });
});

setInterval(() => {
    io.emit('updatePlayers', backEndPlayers);
}, 15);

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
