const data = [
  {
    'folder': true,
    'title': 'Grow',
    'children': [
      {
        'title': 'logo.png'
      },
      {
        'folder': true,
        'title': 'English',
        'children': [
          {
            'title': 'Present_Perfect.txt'
          }
        ]
      }
    ]
  },
  {
    'folder': true,
    'title': 'Soft',
    'children': [
      {
        'folder': true,
        'title': 'NVIDIA',
        'children': null
      },
      {
        'title': 'nvm-setup.exe'
      },
      {
        'title': 'node.exe'
      }
    ]
  },
  {
    'folder': true,
    'title': 'Doc',
    'children': [
      {
        'title': 'project_info.txt'
      }
    ]
  },
  {
    'title': 'credentials.txt'
  }
];

const rootNode = document.getElementById('root')
const mainDomContainer = document.createElement('ul')
mainDomContainer.className = 'main-dom-container'
rootNode.appendChild(mainDomContainer)

// ---------- Recursive function to create DOM ---------- //

function createDomTree(data, parent) {
  for (let i = 0; i < data.length; i++) {
    const rootObject = data[i]
    const isFolder = !!rootObject.hasOwnProperty('folder')
    const rootFile = createDomElement(rootObject, isFolder)
    parent.appendChild(rootFile)

    if (rootObject.hasOwnProperty('children') && rootObject.children !== null) {
      createDomTree(rootObject.children, rootFile.querySelector('.file-list'))
    }
  }
}

// --------------- Opens and closes folders -------------------- //

function manageFolders(newIcon, newFileList) {
  if (!isFileBeingRenamed) {
    newIcon.innerText = newIcon.innerText === 'folder' ? 'folder_open' : 'folder'
    newFileList.classList.toggle('hidden')
  }
}

// ----------------Creates new DOM elements --------------------- //

function createDomElement(rootObject, isFolder) {
  const newMainContainer = document.createElement('li')
  newMainContainer.className = 'main-container'

  const newFileContainer = document.createElement('div')
  newFileContainer.className = 'file-container'

  const newIcon = document.createElement('i')
  newIcon.classList.add('material-icons', `${isFolder ? 'folder' : 'non-folder'}`)
  newIcon.innerText = isFolder ? 'folder' : 'insert_drive_file'

  const newFileName = document.createElement('span')
  newFileName.className = 'file-name'
  newFileName.innerText = rootObject.title

  newFileContainer.appendChild(newIcon)
  newFileContainer.appendChild(newFileName)
  newMainContainer.appendChild(newFileContainer)

  if (isFolder) {
    const newFileList = document.createElement('ul')
    newFileList.classList.add('file-list', 'hidden')

    setEmptyFolderContent(rootObject, newFileList)
    newMainContainer.appendChild(newFileList)

    newFileContainer.onclick = () => manageFolders(newIcon, newFileList)
  }
  return newMainContainer
}

// ----------------- Renames DOM elements ---------------------- //

let isFileBeingRenamed = false
let spanWithName

function startRenaming() {
  if (!isFileBeingRenamed) {
    isFileBeingRenamed = true
    const allMainContainers = document.querySelectorAll('.main-container')
    for (let i = 0; i < allMainContainers.length; i++) {
      if (allMainContainers[i].classList.contains('targeted')) {
        const fileContainerToRename = allMainContainers[i].children[0]
        spanWithName = fileContainerToRename.children[1]
        spanWithName.contentEditable = 'true'
        spanWithName.focus()

        // Selects only filename without extension
        const lengthOfExtension = 4
        const newSelection = document.createRange()
        newSelection.setStart(spanWithName.firstChild, 0)
        newSelection.setEnd(
          spanWithName.firstChild,
          spanWithName.textContent.includes('.')
            ? spanWithName.firstChild.length - lengthOfExtension
            : spanWithName.firstChild.length
        )
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(newSelection)

        // Prevents pressing enter while renaming
        const enter = 13
        spanWithName.onkeydown = e => {
          if (e.which === enter) {
            e.preventDefault()
          }
        }
      }
    }
  }
}

function finishRenaming(e) {
  if (e.target.tagName !== 'A') {
    isFileBeingRenamed = false
  }
}

// ----------------- Deletes DOM elements ---------------------- //

function deleteElement() {
  if (!isFileBeingRenamed) {
    const allMainContainers = document.querySelectorAll('.main-container')
    for (let i = 0; i < allMainContainers.length; i++) {
      if (allMainContainers[i].classList.contains('targeted')) {
        allMainContainers[i].remove()
      }
    }

    const allFileLists = document.querySelectorAll('.file-list')
    for (let i = 0; i < allFileLists.length; i++) {
      setEmptyFolderContent(allFileLists[i], allFileLists[i])
    }
  }
}

// -----------------------Checks if folder is empty ----------------- //

function setEmptyFolderContent(folder, folderParent) {
  if (folder.children === null || folder.children.length === 0) {
    const emptyFolderContent = document.createElement('i')
    emptyFolderContent.innerText = 'Folder is empty'
    folderParent.appendChild(emptyFolderContent)
  }
}

// ---------------------- Creates context menu ---------------------- //

function createContextMenu(isDisabled) {
  const contextMenu = document.createElement('nav')
  contextMenu.className = 'context-nav'

  const contextList = document.createElement('ul')
  contextList.className = 'context-list'

  const renameButton = document.createElement('a')
  renameButton.innerText = 'Rename'
  renameButton.classList.add('context-option', `${!isDisabled && 'disabled'}`)
  renameButton.onclick = startRenaming

  const deleteButton = document.createElement('a')
  deleteButton.innerText = 'Delete item'
  deleteButton.classList.add('context-option', `${!isDisabled && 'disabled'}`)
  deleteButton.onclick = deleteElement

  contextList.appendChild(renameButton)
  contextList.appendChild(deleteButton)
  contextMenu.appendChild(contextList)
  rootNode.appendChild(contextMenu)

  return contextMenu
}

// ----------------------- Sets element focus ----------------------- //

let elementOnFocus
document.addEventListener('mouseover', e => {
  elementOnFocus = e.target
})

function addFocus(rightClickedElement) {

  function setFocus(element) {
    element.classList.add('targeted')
    element.tabIndex = 0
    element.focus()
  }

  if (rightClickedElement.parentNode.className === 'main-container') {
    setFocus(rightClickedElement.parentNode)
  } else {
    if (rightClickedElement.tagName !== 'HTML' && rightClickedElement.tagName !== 'BODY') {
      setFocus(rightClickedElement.parentNode.parentNode)
    }
  }
}

function removeFocus() {
  const allElements = document.getElementsByTagName('*')
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].classList.remove('targeted')
    if (allElements[i].hasAttribute('tabindex')) {
      allElements[i].removeAttribute('tabindex')
    }
  }
}

// ---------------------- Manages context menu ---------------------- //

document.addEventListener('contextmenu', e => {
  if (rootNode.children.length > 1) {
    rootNode.removeChild(rootNode.lastChild)
  }
  removeFocus()
  addFocus(elementOnFocus)
  const contextMenu = createContextMenu(mainDomContainer.contains(elementOnFocus))
  const posX = e.clientX
  const posY = e.clientY
  setMenuPosition(contextMenu, posX, posY)
  e.preventDefault()
}, false)

document.addEventListener('click', e => {
  removeFocus()
  const contextMenu = document.querySelector('.context-nav')
  if (contextMenu !== null) {
    contextMenu.style.opacity = '0'
    contextMenu.remove()
  }

  if (isFileBeingRenamed) {
    finishRenaming(e)
  }
}, false)

function setMenuPosition(contextMenu, x, y) {
  contextMenu.style.top = `${y}px`
  contextMenu.style.left = `${x}px`
  contextMenu.style.visibility = 'visible'
  contextMenu.style.opacity = '1'
}

// ---------------------------------------------------------------- //

window.addEventListener('load', createDomTree(data, mainDomContainer))