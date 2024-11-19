const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./config/db'); // DB 연결 파일
const chatRouter = require('./chat'); // chat.js 불러오기
const app = express();

// 미들웨어 설정
app.use(bodyParser.json());

// 회원가입 API
app.post('/signup', async (req, res) => {
    const { email, password, nickname, name, studentnum, major } = req.body;

    if (!email || !password || !nickname || !name || !studentnum || !major) {
        return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
        const query = `INSERT INTO users (email, password, nickname, name, studentnum, major) VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(query, [email, hashedPassword, nickname, name, studentnum, major], (err, result) => {
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

        res.status(200).json({ message: '로그인 성공', userId: user.id });
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

    if (!id || (!password && !nickname && !studentnum && !major)) {
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

// 채팅 관련 라우터 사용
app.use('/chat', chatRouter);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});