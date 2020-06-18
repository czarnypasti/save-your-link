const host = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.hostname
const socket = io.connect(host)

const name = document.querySelector('#name')
const link = document.querySelector('#link')
const tags = document.querySelector('#tags')
const saveBtn = document.querySelector('.save-btn')
const alerts = [...document.querySelectorAll('.alert')]

const inputs = [name, link, tags]

saveBtn.addEventListener('click', () => {
  alerts.map(item => item.classList.remove('alert--display'))
  const emptyInputs = inputs.filter(input => !input.value).map(input => input.id)

  if (emptyInputs.length != 0) {
    alerts.filter(item => 
      emptyInputs.includes(item.dataset.alert) ? 
        item.classList.add('alert--display') : 
        null
    )
  } else {
    const tagsArray = tags.value.split(',').map(x => x.replace(/ /g, '')).filter(x => x != '')
    const uniqueTags = [...new Set(tagsArray)].join(',')
    const _link = link.value.match(/^((http|https):\/\/)/g) ? link.value : `http://${link.value}`

    socket.emit('newLinkData', {name: name.value, link: _link, tags: uniqueTags})
    
    inputs.map(item => item.value = '')
  }
})