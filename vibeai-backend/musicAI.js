// 필요한 모듈 불러오기
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import multer from 'multer';
import FormData from 'form-data';

const app = express();
const PORT = 3000;

// API 키 설정 (실제 키로 대체)
const apiKey = 'cm352t7890033l20cvxmi4trw';

// CORS 설정
app.use(cors());

// multer를 사용해 파일 업로드 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 정적 파일 제공
app.use(express.static(path.join(process.cwd(), '../vibeai-frontend', 'public')));

// 기본 경로('/')에서 Musicindex.html 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), '../vibeai-frontend', 'public', 'Musicindex.html'));
});

// 목소리 목록 가져오는 API 엔드포인트
app.get('/api/voices', (req, res) => {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    fetch('https://api.musicfy.lol/v1/voices?voice_types=parody', options)
        .then(response => response.json())
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ error: err.message }));
});

// 음성 변환 API 엔드포인트
app.post('/api/convert-voice', upload.single('file'), (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received voice ID:', req.body.voice_id);

    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.body.voice_id) {
        console.error('Voice ID missing');
        return res.status(400).json({ error: 'Voice ID missing' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });
    formData.append('voice_id', req.body.voice_id);

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${apiKey}`
        }
    };

    fetch('https://api.musicfy.lol/v1/convert-voice', options)
        .then(response => response.json())
        .then(data => {
            console.log('Data received from Muscify:', data);
            if (data && data[0] && data[0].file_url) {
                res.json(data);
            } else {
                res.status(400).json({ error: 'file_url not found in response', details: data });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});














