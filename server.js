const express = require('express')
const session = require('express-session')({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
})
const sharedsession = require('express-socket.io-session')
const bodyParser = require('body-parser')

const dbCon = require('./db/db')

const app = express()
const port = process.env.PORT || 3000

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'))

app.use(session)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('login', {})
})

app.post('/auth', (req, res) => {
  const username = req.body.username
  const password = req.body.password
  if (username && password) {
    dbCon.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
      if (err) throw err
      if (result.length > 0) {
        req.session.loggedin = true
        req.session.userId = result[0].id
        res.redirect('/home')
      } else {
        res.send('Incorrect username and/or password')
      }
      res.end()
    })
  } else {
    res.send('Please enter username and password')
    res.end()
  }
})

app.get('/home', (req, res) => {
  if (req.session.loggedin) {
    res.render('index', {})
  } else {
    res.send('Please login to view this page')
  }
  res.end()
})

app.get('/links', (req, res) => {
  if (req.session.loggedin) {
    res.render('links', {})
  } else {
    res.send('Please login to view this page')
  }
  res.end()
})

const server = app.listen(port, () => console.log(`Server running -> PORT ${port}`))

const io = require('socket.io')(server)

io.use(sharedsession(session, { autoSave: true }))

io.on('connection', socket => {
  const userId = socket.handshake.session.userId

  socket.on('newLinkData', linkData => {
    const linkId = Date.now()
    const { name, link, tags } = linkData

    dbCon.query('INSERT INTO links VALUES (?)', [[linkId, userId, name, link, tags]], err => {
      if (err) throw err
    })
  })

  socket.on('linksRequest', () => {
    dbCon.query('SELECT * FROM links WHERE user_id = ?', [userId], (err, result, fields) => {
      const linksFromDB = JSON.parse(JSON.stringify([...result]))
      socket.emit('parsedLinks', linksFromDB)
    })
  })

  socket.on('editedData', editedLink => {
    const { name, link, tags, id } = editedLink

    dbCon.query('UPDATE links SET name = ?, link = ?, tags = ? WHERE user_id = ? AND link_id = ?', [name, link, tags, userId, id], err => {
      if (err) throw err
    })
  })

  socket.on('deletedLink', id => {
    dbCon.query('DELETE FROM links WHERE link_id = ? AND user_id = ?', [id, userId], err => {
      if (err) throw err
    })
  })
})