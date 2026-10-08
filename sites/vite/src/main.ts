import './style.css'
import { bunnyImage } from './bunny-image'

const pages: Record<string, string> = {
  '/': `<h1>Home</h1>${bunnyImage('/images/hero.png', 'A bunny watching a machine turn HTML into Markdown', 1737, 893)}`,
  '/about': '<h1>About</h1><p>Reload this page to check that client-side routing works.</p>',
}

const app = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const page = pages[location.pathname] ?? '<h1>Not found</h1>'
  app.innerHTML = `
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
    <main>${page}</main>
  `
}

document.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest('a')
  if (!link || link.origin !== location.origin) return
  event.preventDefault()
  history.pushState(null, '', link.pathname)
  render()
})

window.addEventListener('popstate', render)

render()
