const host = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.hostname
const socket = io.connect(host)

const linksContainer = document.querySelector('.links-container')
const searchBar = document.querySelector('#search')
const editModule = document.querySelector('.edit-module-wrapper')
const nameEdit = document.querySelector('#name-edit')
const linkEdit = document.querySelector('#link-edit')
const tagsEdit = document.querySelector('#tags-edit')
const idEdit = document.querySelector('#id-edit')

socket.emit('linksRequest', '')
socket.on('parsedLinks', async data => {
  let links = []

  data.map((link) => {
    links.push({
      name: link.name,
      link: link.link,
      tags: link.tags.split(','),
      id: link.link_id
    })
  })

  await generateLinksList(links)

  const editBtns = [...document.querySelectorAll('.edit-btn')]
  const deleteBtns = [...document.querySelectorAll('.delete-btn')]
  const linksWrappers = [...document.querySelectorAll('.link-wrapper')]

  editLink(editBtns, linksWrappers)
  deleteLink(deleteBtns)
  filterLinks(linksWrappers)
})

function generateLinksList(array) {
  array.forEach(item => {
    let div = document.createElement('div')
    let name = document.createElement('span')
    let link = document.createElement('a')
    let tags = document.createElement('span')
    let editBtn = document.createElement('button')
    let deleteBtn = document.createElement('button')

    div.setAttribute('class', 'link-wrapper')
    div.setAttribute('data-id', item.id)

    name.textContent = item.name
    name.setAttribute('class', 'name')

    link.textContent = 'link'
    link.setAttribute('class', 'link')
    link.setAttribute('href', item.link)
    link.setAttribute('target', '_blank')

    tags.textContent = `tags: ${item.tags.join(', ')}`
    tags.setAttribute('class', 'tags')

    editBtn.textContent = 'edit'
    editBtn.setAttribute('class', 'edit-btn')
    editBtn.setAttribute('type', 'button')
    editBtn.setAttribute('data-id', item.id)

    deleteBtn.textContent = 'delete'
    deleteBtn.setAttribute('class', 'delete-btn')
    deleteBtn.setAttribute('type', 'button')
    deleteBtn.setAttribute('data-id', item.id)

    div.append(name)
    div.append(link)
    div.append(tags)
    div.append(editBtn)
    div.append(deleteBtn)
    linksContainer.append(div)
  })
}

function editLink(btns, wrappers) {
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      const thisId = this.dataset.id

      const { name, link, tags } = findById(wrappers, thisId)

      nameEdit.value = name.textContent
      linkEdit.value = link.href
      tagsEdit.value = tags.textContent.replace('tags: ', '')
      idEdit.value = thisId

      editModule.classList.add('module--display')
    })
  })
}

function deleteLink(btns) {
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      const thisId = this.dataset.id

      const linksWrappers = [...document.querySelectorAll('.link-wrapper')]
      const linkWrapper = linksWrappers.find(item => item.dataset.id.match(thisId))

      linkWrapper.remove()
      socket.emit('deletedLink', thisId)
    })
  })
}

function filterLinks(links) {
  searchBar.addEventListener('input', e => {
    const linksWrappers = [...links]
    const tagsArrays = links.map(link => {
      return link.childNodes[2].textContent.replace('tags: ', '').split(', ')
    })

    let searchedTag = e.target.value

    tagsArrays.map((tagsArray, index) => {
      if (tagsArray.some(tag => tag !== searchedTag)) {
        linksWrappers[index].classList.add('hide-link')
      }  
      if (tagsArray.some(tag => tag.match(new RegExp(searchedTag, 'gi'))) || searchedTag == '') {
        linksWrappers[index].classList.remove('hide-link')
      }
    })
  })
}

function findById(array, id) {
  const arrayElement = array.find(item => item.dataset.id.match(id))
  const children = arrayElement.childNodes
  return { name: children[0], link: children[1], tags: children[2] }
}