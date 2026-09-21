const $ = (selector, context = document) => context.querySelector(selector)
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)]

if (window.lucide) {
  window.lucide.createIcons({ attrs: { 'aria-hidden': 'true', focusable: 'false' } })
}

const catalogLink = $('.sidebar a[href="#catalog"]')
if (catalogLink && !$('.sidebar a[href="#component-lab"]')) {
  catalogLink.insertAdjacentHTML('beforebegin', '<a href="#component-lab">Component Lab</a>')
}

let toastTimer
const toast = $('[data-toast]')

function showToast(title = '저장했습니다', message = '변경사항이 반영되었습니다') {
  toast.querySelector('b').textContent = title
  toast.querySelector('span').textContent = message
  toast.classList.add('open')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('open'), 2600)
}

function openLayer(element, focusTarget) {
  element.hidden = false
  ;(focusTarget || $('button', element))?.focus()
}

function closeLayer(element, returnTarget) {
  element.hidden = true
  returnTarget?.focus()
}

$('[data-theme]').onclick = () => {
  const isDark = document.documentElement.dataset.theme === 'dark'
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark'
}

$('[data-toast-open]').onclick = () => showToast()

$$('[data-toggle]').forEach((button) => {
  button.onclick = () => button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true')
})

$$('.cs-chip').forEach((button) => {
  button.onclick = () => {
    button.parentElement.querySelectorAll('.cs-chip').forEach((item) => item.classList.remove('selected'))
    button.classList.add('selected')
  }
})

$$('.cs-segment button, .cs-tabs button').forEach((button) => {
  button.onclick = () => {
    button.parentElement.querySelectorAll('button').forEach((item) => item.classList.remove('active'))
    button.classList.add('active')
  }
})

const dialog = $('[data-dialog]')
const dialogOpen = $('[data-dialog-open]')
dialogOpen.onclick = () => openLayer(dialog, $('[data-close]'))
$('[data-close]').onclick = () => closeLayer(dialog, dialogOpen)
$('[data-confirm]').onclick = () => {
  closeLayer(dialog, dialogOpen)
  showToast('제출했습니다', '평가가 인사담당자에게 전달되었습니다')
}

const alertDialog = $('[data-alert]')
const alertOpen = $('[data-alert-open]')
alertOpen.onclick = () => openLayer(alertDialog, $('[data-alert-close]'))
$('[data-alert-close]').onclick = () => closeLayer(alertDialog, alertOpen)
$('[data-alert-confirm]').onclick = () => {
  closeLayer(alertDialog, alertOpen)
  showToast('삭제했습니다', '평가가 삭제되었습니다')
}

const menu = $('[data-menu]')
$('[data-menu-open]').onclick = () => { menu.hidden = !menu.hidden }

const panel = $('[data-panel]')
const panelOpen = $('[data-panel-open]')
panelOpen.onclick = () => {
  panel.classList.add('open')
  panel.setAttribute('aria-hidden', 'false')
}
$('[data-panel-close]').onclick = () => {
  panel.classList.remove('open')
  panel.setAttribute('aria-hidden', 'true')
  panelOpen.focus()
}

$$('.overlay').forEach((overlay) => {
  overlay.onclick = (event) => { if (event.target === overlay) overlay.hidden = true }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    $$('.overlay').forEach((overlay) => { overlay.hidden = true })
    menu.hidden = true
    panel.classList.remove('open')
    $$('[data-play-popover-panel]').forEach((popover) => { popover.hidden = true })
    $$('[data-play-popover]').forEach((button) => button.setAttribute('aria-expanded', 'false'))
  }
})

// Component Lab uses the same production layers instead of documentation-only imitations.
$$('[data-play-dialog]').forEach((button) => { button.onclick = () => openLayer(dialog, $('[data-close]')) })
$$('[data-play-alert]').forEach((button) => { button.onclick = () => openLayer(alertDialog, $('[data-alert-close]')) })
$$('[data-play-toast]').forEach((button) => { button.onclick = () => showToast('저장했습니다', 'Component Lab에서 Toast를 실행했습니다.') })
$$('[data-play-drawer]').forEach((button) => {
  button.onclick = () => {
    panel.classList.add('open')
    panel.setAttribute('aria-hidden', 'false')
  }
})
$$('[data-play-popover]').forEach((button) => {
  button.onclick = () => {
    const popover = $('[data-play-popover-panel]', button.parentElement)
    popover.hidden = !popover.hidden
    button.setAttribute('aria-expanded', String(!popover.hidden))
  }
})

$('[data-search]').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase()
  $$('.searchable').forEach((section) => {
    section.hidden = Boolean(query) && !(`${section.dataset.keywords || ''} ${section.textContent}`).toLowerCase().includes(query)
  })
})
