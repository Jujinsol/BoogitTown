const express = require('express');
const router = express.Router();
const db = require('./config/db'); // DB 연결 모듈

// 채팅방 생성
router.post('/create-chatroom', (req, res) => {
    const { name, creator_id } = req.body;

    if (!name || !creator_id) {
        return res.status(400).json({ message: '채팅방 이름과 생성자를 입력해주세요.' });
    }

    const query = `INSERT INTO chatrooms (name, creator_id) VALUES (?, ?)`;

    db.query(query, [name, creator_id], (err, result) => {
        if (err) {
            console.error('채팅방 생성 오류:', err);
            return res.status(500).json({ message: '채팅방 생성 실패' });
        }

        res.status(201).json({ message: '채팅방 생성 성공', chatroomId: result.insertId });
    });
});

// 채팅방 로드
router.get('/load-chatroom', (req, res) => {
    const query = `SELECT * FROM chatrooms`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 채팅방 참여
router.get('/join-chatroom/:chatroomId', (req, res) => {
    const { chatroomId } = req.params;

    const query = `SELECT * FROM chatrooms WHERE id = ?`;

    db.query(query, [chatroomId], (err, results) => {
        if (err) {
            console.error('채팅방 참여 오류:', err);
            return res.status(500).json({ message: '채팅방 참여 실패' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '채팅방을 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '채팅방 입장 성공', chatroom: results[0] });
    });
});

// 메시지 전송
router.post('/send-message', (req, res) => {
    const { chatroom_id, user_id, content } = req.body;
    const timestamp = new Date();

    if (!chatroom_id || !user_id || !content) {
        return res.status(400).json({ message: '필수 정보를 모두 입력해주세요.' });
    }
    const query = `INSERT INTO messages (chatroom_id, user_id, content, timestamp) 
                    SELECT id, ?, ?, ?
                    FROM chatrooms
                    WHERE name = ?;`;

    db.query(query, [user_id, content, timestamp, chatroom_id], (err, result) => {
        if (err) {
            console.error('메시지 전송 오류:', err);
            return res.status(500).json({ message: '메시지 전송 실패' });
        }
        
        res.status(201).json({ message: '메시지 전송 성공' });
    });
});

// 메시지 조회
router.get('/get-messages/:chatroomId', (req, res) => {
    const { chatroomId } = req.params;
    const query = `
        SELECT m.user_id, m.content, m.timestamp
        FROM messages m
        JOIN chatrooms c ON m.chatroom_id = c.id
        WHERE c.name = ?
        ORDER BY m.id desc;`;

    db.query(query, [chatroomId], (err, results) => {
        if (err) {
            console.error('메시지 조회 오류:', err);
            return res.status(500).json({ message: '메시지 조회 실패' });
        }

        res.status(200).json({ chatroomId, messages: results });
    });
});

module.exports = router;
