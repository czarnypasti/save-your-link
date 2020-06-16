const socket = io.connect('localhost:3000')

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
    let splitedTags = tags.value.length > 1 ? 
      tags.value.split(',').map(x => x.trim()) : 
      tags.value

    socket.emit('linkData', {name: name.value, link: link.value, tags: splitedTags})
    
    inputs.map(item => item.value = '')
  }
})
