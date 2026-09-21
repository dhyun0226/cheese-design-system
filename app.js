const $ = (selector, context = document) => context.querySelector(selector)
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)]

if (window.lucide) {
  window.lucide.createIcons({ attrs: { 'aria-hidden': 'true', focusable: 'false' } })
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

$$('[data-menu-open]').forEach((button) => {
  button.onclick = () => {
    const menu = $('[data-menu]', button.parentElement)
    menu.hidden = !menu.hidden
    button.setAttribute('aria-expanded', String(!menu.hidden))
  }
})

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
    $$('[data-menu]').forEach((menu) => { menu.hidden = true })
    panel.classList.remove('open')
    $$('[data-play-popover-panel]').forEach((popover) => { popover.hidden = true })
    $$('[data-play-popover]').forEach((button) => button.setAttribute('aria-expanded', 'false'))
    $$('[data-context-menu]').forEach((contextMenu) => { contextMenu.hidden = true })
    closeSheet()
  }
})

// Documentation demos use the same production layers instead of imitations.
$$('[data-play-dialog]').forEach((button) => { button.onclick = () => openLayer(dialog, $('[data-close]')) })
$$('[data-play-alert]').forEach((button) => { button.onclick = () => openLayer(alertDialog, $('[data-alert-close]')) })
$$('[data-play-toast]').forEach((button) => { button.onclick = () => showToast('저장했습니다', 'Toast 컴포넌트를 실행했습니다.') })
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

$$('[data-range]').forEach((range) => {
  range.oninput = () => { $('[data-range-output]', range.closest('.sample-card')).textContent = `${range.value}%` }
})

$$('[data-number-minus], [data-number-plus]').forEach((button) => {
  button.onclick = () => {
    const input = $('[data-number]', button.parentElement)
    const delta = button.hasAttribute('data-number-plus') ? 1 : -1
    input.value = String(Math.max(0, Number(input.value || 0) + delta))
  }
})

$$('[data-otp] input').forEach((input, index, inputs) => {
  input.oninput = () => { if (input.value && inputs[index + 1]) inputs[index + 1].focus() }
  input.onkeydown = (event) => { if (event.key === 'Backspace' && !input.value && inputs[index - 1]) inputs[index - 1].focus() }
})

$$('[data-tags] input').forEach((input) => {
  input.onkeydown = (event) => {
    if (event.key !== 'Enter' || !input.value.trim()) return
    event.preventDefault()
    const chip = document.createElement('button')
    chip.className = 'cs-chip selected'
    chip.textContent = `${input.value.trim()} ×`
    chip.onclick = () => chip.remove()
    input.before(chip)
    input.value = ''
  }
  $$('button', input.parentElement).forEach((chip) => { chip.onclick = () => chip.remove() })
})

$$('[data-combobox]').forEach((root) => {
  const input = $('input', root)
  const panel = $('[role="listbox"]', root)
  input.onfocus = input.oninput = () => {
    panel.hidden = false
    input.setAttribute('aria-expanded', 'true')
    const query = input.value.toLowerCase()
    $$('.cs-option', panel).forEach((option) => { option.hidden = !option.textContent.toLowerCase().includes(query) })
  }
  $$('.cs-option', panel).forEach((option) => {
    option.onclick = () => { input.value = option.childNodes[0].textContent.trim(); panel.hidden = true; input.setAttribute('aria-expanded', 'false') }
  })
})

$$('.cs-listbox .cs-option').forEach((option) => {
  option.onclick = () => {
    $$('.cs-option', option.parentElement).forEach((item) => { item.setAttribute('aria-selected', String(item === option)); const check = $('span', item); if (check) check.remove() })
    option.insertAdjacentHTML('beforeend', '<span>✓</span>')
  }
})

$$('[data-rating] button').forEach((button) => {
  button.onclick = () => {
    const value = Number(button.dataset.value)
    $$('button', button.parentElement).forEach((item) => item.setAttribute('aria-checked', String(Number(item.dataset.value) <= value)))
    $('[data-rating-output]', button.closest('.sample-card')).textContent = `${value}점`
  }
})

$$('[data-collapsible]').forEach((button) => {
  button.onclick = () => {
    const content = button.nextElementSibling
    content.hidden = !content.hidden
    button.setAttribute('aria-expanded', String(!content.hidden))
  }
})

$$('.cs-hover-card').forEach((root) => {
  const content = $('.cs-hover-card-content', root)
  root.onmouseenter = root.onfocusin = () => { content.hidden = false }
  root.onmouseleave = root.onfocusout = () => { content.hidden = true }
})

$$('[data-context-area]').forEach((area) => {
  const menu = $('[data-context-menu]', area.parentElement)
  area.oncontextmenu = (event) => {
    event.preventDefault()
    menu.style.left = `${event.clientX}px`
    menu.style.top = `${event.clientY}px`
    menu.hidden = false
  }
  $$('button', menu).forEach((button) => { button.onclick = () => { menu.hidden = true; showToast(button.textContent, '컨텍스트 메뉴 작업을 실행했습니다.') } })
})

const sheet = $('[data-sheet]')
const sheetScrim = $('[data-sheet-scrim]')
function closeSheet() { sheet?.classList.remove('open'); sheet?.setAttribute('aria-hidden', 'true'); if (sheetScrim) sheetScrim.hidden = true }
$$('[data-sheet-open]').forEach((button) => { button.onclick = () => { sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); sheetScrim.hidden = false; $('[data-sheet-close]', sheet).focus() } })
$$('[data-sheet-close]').forEach((button) => { button.onclick = closeSheet })
if (sheetScrim) sheetScrim.onclick = closeSheet

$$('.cs-month-grid button, .cs-year-grid button, .cs-nav-menu button, .cs-pagination button').forEach((button) => {
  button.onclick = () => { $$('button', button.parentElement).forEach((item) => item.classList.remove('active')); button.classList.add('active') }
})

$$('[data-carousel]').forEach((carousel) => {
  const slides = ['평가 현황', '조직별 진행률', '마감 예정 업무']
  let index = 0
  const buttons = $$('button', carousel)
  buttons[0].onclick = () => { index = (index + slides.length - 1) % slides.length; $('[data-carousel-slide]', carousel).textContent = slides[index] }
  buttons[1].onclick = () => { index = (index + 1) % slides.length; $('[data-carousel-slide]', carousel).textContent = slides[index] }
})

$$('[data-date-open]').forEach((button) => {
  button.onclick = () => {
    const input = $('[data-date-field]', button.parentElement)
    if (input.showPicker) input.showPicker()
    else input.focus()
  }
})

$$('.cs-toolbar button').forEach((button) => {
  button.onclick = () => button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'))
})

$$('.cs-menubar button').forEach((button) => { button.onclick = () => showToast(button.textContent, `${button.textContent} 메뉴를 선택했습니다.`) })
$$('.cs-tree [role="treeitem"]').forEach((item) => { item.tabIndex = 0; item.onclick = () => item.classList.toggle('active') })
$$('.cs-stepper div').forEach((step) => { step.tabIndex = 0; step.onclick = () => { $$('.cs-stepper div', step.parentElement).forEach((item) => item.classList.remove('active')); step.classList.add('active') } })
$$('.calendar-days button').forEach((day) => { day.onclick = () => { $$('.calendar-days button', day.parentElement).forEach((item) => item.classList.remove('selected')); day.classList.add('selected') } })

$$('[data-splitter]').forEach((splitter) => {
  const handle = $('button', splitter)
  handle.onpointerdown = (event) => {
    handle.setPointerCapture(event.pointerId)
    handle.onpointermove = (moveEvent) => {
      const rect = splitter.getBoundingClientRect()
      const left = Math.min(75, Math.max(25, ((moveEvent.clientX - rect.left) / rect.width) * 100))
      splitter.style.gridTemplateColumns = `${left}% 7px ${100 - left}%`
    }
  }
  handle.onpointerup = () => { handle.onpointermove = null }
})

const catalogTargets = {
  'Form & Selection': 'form-selection',
  'Date & Time': 'date-time',
  'Navigation & Disclosure': 'navigation-disclosure',
  'Overlay & Feedback': 'overlay-feedback',
  'Data & Layout': 'data-layout',
}
$$('.catalog-group').forEach((group) => {
  const target = document.getElementById(catalogTargets[$('h3', group).textContent])
  $$('.catalog-grid span', group).forEach((item) => {
    item.tabIndex = 0
    item.setAttribute('role', 'link')
    item.setAttribute('aria-label', `${item.textContent} 예제 보기`)
    item.onclick = () => target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    item.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        item.click()
      }
    }
  })
})

$('[data-search]').addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase()
  $$('.searchable').forEach((section) => {
    section.hidden = Boolean(query) && !(`${section.dataset.keywords || ''} ${section.textContent}`).toLowerCase().includes(query)
  })
})
