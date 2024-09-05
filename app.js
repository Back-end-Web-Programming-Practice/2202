const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer')
const fs = require('fs')

try {
    fs.readdirSync('uploads')
} catch(error){
    console.error('uploads folder cannot be find -> mkdir uploads folder')
    fs.mkdirSync('uploads')
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req,file,done) {
            done(null, 'uploads/')
        },
        filename(req,file,done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024 }
})

dotenv.config();
const app = express();
app.set('port',process.env.PORT || 3000);

app.use(morgan('dev')); // 이것은 개발용 , 좀 더 상세한 log 확인가능
app.use('/',express.static(path.join(__dirname,'public')))
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name:'session-cookie'
}));

app.use((req,res,next) => {
    console.log('모든 요청에 다 실행됩니다');
    next();
})

// Get요청 처리하는 미들웨어
app.get('/',(req,res,next) =>{
    // res.send('Hello, Express')
    console.log('GET / 요청에서만 실행됩니다.')
    next();
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기중')
});

app.post('/upload', upload.single('image'),(req,res)=> {
    console.log(req.file,req.body);
    res.send('ok');
});
app.post('/upload',upload.none(), (req,res) => {
    console.log(req.body);
    res.send('ok');
})

app.get('/upload', (req,res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'))
})
app.post('/upload',upload.single('image'),(req,res) => {
    console.log(req.file);
    res.send('ok')
})

// 오류처리 미들웨어
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).send(err.message);
});