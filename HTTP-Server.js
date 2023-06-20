const express = require('express')
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const app = express()    // 创建express app

// 下面的代码用来初始化这个app
// 开始

// 身份验证部分：用 Basic Auth 检查所有请求是否被授权（懒得写登录界面）
app.use(basicAuth({
    challenge: true,    // 要求浏览器弹出用户信息输入框
    realm: [...Array(Math.floor(Math.random() * 128) + 128)].map(() => (~~(Math.random() * 36)).toString(36)).join(''),    // 生成随机的会话ID，用来告诉浏览器保存密码的时机，每次重启本程序以后，正常的浏览器都会自动忘记密码。这段代码来自HC
    authorizer: (username, password) => basicAuth.safeCompare(username, global.config.username) & basicAuth.safeCompare(password, global.config.password),    // 由于网站是私人使用的，所以就没必要写SHA256加密了。**注意：必须使用safeCompare方法，不能使用标准的运算符，因为官方说有安全漏洞！！！**
}))

app.use('/', express.static(path.resolve(__dirname, 'static')))    // 静态资源

app.post('/api/*', bodyParser.json({
    type: 'application/json',
}))

app.get('/api/list', (req, res) => {    // 请求日记列表
    const diaries = fs.readdirSync(path.resolve(__dirname, 'diaries')).filter(d => !isNaN(Date.parse(d))).sort((a, b) => Date.parse(b) - Date.parse(a))    // 同步读取存日记的文件夹下的目录，然后过滤非标准日期的东西，再然后排序，从大到小
    res.json(diaries)    // 发送数据
})

app.get('/api/diary-get', (req, res) => {    // 请求指定日期的日记
    const date = req.query.date    // 目标日期
    if (!date) {
        return res.status(400).end()    // 很明显是用户直接访问，那就直接返回400，我也懒得写报错了
    }
    const target = path.resolve(__dirname, 'diaries', date, 'diary.md')
    if (!fs.existsSync(target)) return res.status(404).end()    // 找不到文件，返回404，正常情况下不会发生，除非是非法请求或后台特殊操作
    const diary = fs.readFileSync(target)    // 同步读取日记
    res.send(diary)    // 发送
})

app.post('/api/diary-write', (req, res) => {    // 写日记
    const date = req.body.date    // 要写的日记的日期
    const content = req.body.content    // 要写的内容
    const targetDir = path.resolve(__dirname, 'diaries', date)    // 日期 => 日记的文件夹的绝对路径
    const targetFile = path.join(targetDir, 'diary.md')    // 日记的文件夹的绝对路径 => 日记文件绝对路径
    if (!fs.existsSync(targetDir))  fs.mkdirSync(targetDir)    // 日记还没有被创建，那么就创建一个
    fs.writeFileSync(targetFile, content)    // 同步写入日记
    res.status(200).end()    // 返回200 OK
})

module.exports = app