const saveEditBtn = document.querySelector('.save-edit-btn')
const exitBtn = document.querySelector('.exit-btn')
const alerts = [...document.querySelectorAll('.alert')]

const editInputs = [nameEdit, linkEdit, tagsEdit, idEdit]

exitBtn.addEventListener('click', () => {
  editInputs.map(x => x.value = '')
  editModule.classList.remove('module--display')
})

saveEditBtn.addEventListener('click', () => {
  alerts.map(item => item.classList.remove('alert--display'))
  const emptyInputs = editInputs.filter(input => !input.value).map(input => input.id)

  if (emptyInputs.length != 0) {
    alerts.filter(item => 
      emptyInputs.includes(item.dataset.alert) ? 
        item.classList.add('alert--display') : 
        null
    )
  } else {
    const tagsArray = tagsEdit.value.split(',').map(x => x.replace(/ /g, '')).filter(x => x != '')
    const uniqueTags = [...new Set(tagsArray)].join(',')
    const _link = linkEdit.value.match(/^((http|https):\/\/)/g) ? linkEdit.value : `http://${linkEdit.value}`

    const linksWrappers = [...document.querySelectorAll('.link-wrapper')]

    const { name, link, tags } = findById(linksWrappers, idEdit.value)

    name.textContent = nameEdit.value
    link.setAttribute('href', _link)
    tags.textContent = `tags: ${uniqueTags.replace(/,/g, ', ')}`
    socket.emit('editedData', {name: nameEdit.value, link: _link, tags: uniqueTags, id: idEdit.value})

    editInputs.map(x => x.value = '')
    editModule.classList.remove('module--display')
  }
})