/* globals fetch:false */

import {createStore} from 'redux'
import fountain from './vendor/fountain'

import scripts from './scripts/*.fountain'

function createAction (type) {
  const action = payload => ({type, payload})
  action.type = type
  return action
}

const selectScript = createAction('select script')

function reducer (state = {}, action) {
  switch (action.type) {
    case selectScript.type: {
      return Object.assign({}, state, {
        script: action.payload
      })
    }
    default: return state
  }
}

const store = createStore(reducer)

async function renderScript (id) {
  const text = await (await fetch(`/dist/${scripts[id]}`)).text()
  const {html} = fountain(text)
  return `

    <section class="title-page">
      ${html.title_page}
    </section>

    <section class="script">
      ${html.script}
    </section>
  `
}

const scriptElement = document.getElementById('script')
const navElement = document.getElementById('nav')

navElement.addEventListener('click', event => {
  const {id} = event.target

  if (id && id !== 'nav') {
    store.dispatch(selectScript(id))
  }
})

async function render () {
  const state = store.getState()
  const ids = Object.keys(scripts)

  navElement.innerHTML = `
    <ul>
      ${ids.map(id => `
        <li>
          <button id="${id}">
            ${id.replace(/-/g, ' ').toUpperCase()}
          </button>
        </li>
      `).join('')}
    </ul>
  `

  if (state.script && state.script !== scriptElement.dataset.script) {
    scriptElement.innerHTML = await renderScript(state.script)
    scriptElement.dataset.script = state.script
  }
}

store.subscribe(render)

store.dispatch(selectScript('s01e01-the-banner'))
