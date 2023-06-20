function $(id) {
    return document.getElementById(id)
}

function initMarkdown() {
    // 初始化Markdown
    window.md = new remarkable.Remarkable('full', {
        breaks: true,
    })
}

function createLi() {
    // 创建一个列表内容
    const li = document.createElement('li')
    li.classList.add('mdui-list-item', 'mdui-ripple')
    return li
}

async function loadDiaryList() {
    // 加载日记列表
    const list = JSON.parse(await zhr('api/list','get'))    // 请求列表并解析
    $('list').innerHTML = ''
    if (list.filter((time) => Date.parse(time) === Date.parse(moment().format('YYYY-MM-DD'))).length === 0) {
        // 如果今天还没有写日记，则写一个“写日记”按钮
        let li = createLi()
        li.id = 'create-diary'
        li.textContent = '写日记'
        li.onclick = (e) => {
            const today = moment().format('YYYY-MM-DD')
            saveDiary(today, '').then(() => {
                loadDiaryList()
                editDiary(today)
                mdui.snackbar('快去写日记吧', { position: 'right-bottom' })
            })
        }
        $('list').appendChild(li)
    }
    list.forEach((time) => {
        let li = createLi()
        li.id = time
        li.textContent = time
        li.onclick = async (e) => {
            showDiary(e.target.id)    // 展示日记
        }
        $('list').appendChild(li)
    })
}

async function getDiary(date) {
    // 获取指定日期的日记，date是string
    const diary = await zhr('api/diary-get/?date='+date, 'get')
    return diary
}

async function showDiary(date) {
    // 展示日记
    showReader()
    enableEditButton()
    const diary = await getDiary(date)    // 获取内容
    const title = date + ' 的日记'    // 标题
    const text = `# ${title}\n${diary}`    // 显示的内容
    $('reader').setAttribute('data-date', date)    // 设置自定义属性
    showText(text)    // 渲染Markdown并展示
}

async function editDiary(date) {
    // 展示编辑器
    showEditor()    // 显示编辑器
    disableEditButton()    // 禁用编辑按钮
    const diary = await getDiary(date)    // 获取内容
    $('text-input').value = diary
    $('editor').setAttribute('data-date', date)
    mdui.updateTextFields()
}

async function saveDiary(date, content) {
    await zhr.json('api/diary-write', {    // 向服务器发送写日记的请求
        date,
        content,
    })
}

function showElement(e) {
    e.classList.remove('hidden')
}

function showElementById(id) {
    showElement($(id))
}

function hideElement(e) {
    e.classList.add('hidden')
}

function hideElementById(id) {
    hideElement($(id))
}

function enableElement(element) {
    element.disabled = false
}

function disableElement(element) {
    element.disabled = true
}

function enableElementById(id) {
    enableElement($(id))
}

function disableElementById(id) {
    disableElement($(id))
}

function showReader() {
    // 显示阅读器，隐藏编辑器
    hideElementById('editor')    // 隐藏编辑器
    showElementById('reader')    // 显示阅读器
}

function showEditor() {
    // 显示编辑器，隐藏阅读器
    hideElementById('reader')    // 隐藏阅读器
    showElementById('editor')    // 显示阅读器
}

function showText(text) {
    // 把文字写在阅读器上，需渲染Markdown
    const html = md.render(text)
    $('reader').innerHTML = html
}

function enableEditButton() {
    enableElementById('edit')
}

function disableEditButton() {
    disableElementById('edit')
}

$('edit').onclick = async () => {
    // 当编辑按钮点击以后
    const date = $('reader').getAttribute('data-date')    // 获取日期
    if (!date) return mdui.snackbar('看上去还没有打开日记本 去侧边栏看看吧', { position: 'right-bottom' })    // 未知异常，可能是程序的BUG，那么就弹出提示
    editDiary(date)
}

$('save').onclick = () => {
    const date = $('editor').getAttribute('data-date')    // 获取日期
    const content = $('text-input').value    // 日记内容
    if (!date) return mdui.snackbar('DOM 未知错误：找不到属性 data-date', { position: 'right-bottom' })
    saveDiary(date, content).then((result) => {
        // 完毕
        mdui.snackbar('日记保存成功', { position: 'right-bottom' })
        showDiary($('editor').getAttribute('data-date'))    // 展示日记
    })
}

$('exit').onclick = () => {
    mdui.confirm('日记将不会被保存', '直接退出编辑器？', () => {
        // 点击确认按钮的回调
        showDiary($('editor').getAttribute('data-date'))
    }, undefined, {
        confirmText: '确定',
        cancelText: '取消',
    })
}

window.onload = () => {    // 网页成功加载以后
    initMarkdown()
    loadDiaryList()    // 加载日记列表
}