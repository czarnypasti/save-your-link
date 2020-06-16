const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('index', {}))
app.get('/links', (req, res) => res.render('links', {}))

const server = app.listen(port, () => console.log(`Server running -> PORT ${port}`))

const io = require('socket.io')(server)

io.on('connection', socket => {
  socket.on('linkData', linkData => {
    const linkId = Date.now()
    linkData.id = linkId.toString()

    fs.readFile('./links/links.json', 'utf-8', (err, data) => {
      if (err) throw err

      let arrayOfLinks = JSON.parse(data)
      arrayOfLinks.links.push(linkData)

      fs.writeFile('./links/links.json', JSON.stringify(arrayOfLinks), 'utf-8', err => {
        if (err) throw err
      })
    })
  })

  socket.on('linksRequest', () => {
    fs.readFile('./links/links.json', 'utf-8', (err, data) => {
      if (err) throw err
      socket.emit('parsedLinks', JSON.parse(data).links)
    })
  })

  socket.on('editedData', editedLink => {
    fs.readFile('./links/links.json', 'utf-8', (err, data) => {
      if (err) throw err

      let arrayOfLinks = JSON.parse(data)
      let previousLink = arrayOfLinks.links.find(link => link.id == editedLink.id)
      let index = arrayOfLinks.links.indexOf(previousLink)

      arrayOfLinks.links.splice(index, 1, editedLink)

      fs.writeFile('./links/links.json', JSON.stringify(arrayOfLinks), 'utf-8', err => {
        if (err) throw err
      })
    })
  })

  socket.on('deletedLink', id => {
    fs.readFile('./links/links.json', 'utf-8', (err, data) => {
      if (err) throw err

      let arrayOfLinks = JSON.parse(data)
      let linkToDelete = arrayOfLinks.links.find(link => link.id == id)
      let index = arrayOfLinks.links.indexOf(linkToDelete)

      arrayOfLinks.links.splice(index, 1)

      fs.writeFile('./links/links.json', JSON.stringify(arrayOfLinks), 'utf-8', err => {
        if (err) throw err
      })
    })
  })
})
