document.addEventListener('DOMContentLoaded', function () {
  const headerMenu = document.querySelector('.header-menu')
  const headerMenuClose = document.querySelector('.header-menu-close')
  const bars3 = document.querySelector('.bars3')

  if (!headerMenu || !headerMenuClose || !bars3) return

  const isDesktop = () => window.innerWidth >= 1024

  const openMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = 'visible'
      headerMenu.style.opacity = '1'
    } else {
      headerMenu.style.transform = 'translateX(0)'
    }
    document.body.classList.add('overflow-hidden')
  }

  const closeMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = 'hidden'
      headerMenu.style.opacity = '0'
    } else {
      headerMenu.style.transform = 'translateX(1024px)'
    }
    document.body.classList.remove('overflow-hidden')
  }

  bars3.addEventListener('click', openMenu)
  headerMenuClose.addEventListener('click', closeMenu)

  headerMenu.addEventListener('click', (e) => {
    const toggle = e.target.closest('.toggle-dropdown')
    if (!toggle) return

    const submenu = toggle.nextElementSibling
    if (!submenu) return

    const dropdownIcon = toggle.querySelector('.dropdown-icon')
    const isOpen = submenu.style.maxHeight

    if (isOpen) {
      submenu.style.maxHeight = null
      submenu.style.opacity = '0'
    } else {
      submenu.style.maxHeight = submenu.scrollHeight * 30 + 'px'
      submenu.style.opacity = '1'
    }

    if (dropdownIcon) dropdownIcon.classList.toggle('rotate-180')

    e.stopPropagation()
  })
})

document.addEventListener('DOMContentLoaded', function () {
  const megaMenus = document.querySelectorAll('.mega-menu-li')

  const ACTIVE_CLASSES = ['ring-2', 'ring-primary-600', 'bg-primary-200']
  const ACTIVE_SCALE_CLASSES = ['scale-x-100', 'scale-y-100']
  const LINK_ACTIVE_CLASS = 'text-primary-700'

  function getLinkHref(dataLink, dataMid, dataId) {
    // اگر dataLink خالی بود، بر اساس dataMid لینک پیش‌فرض بساز
    if (!dataLink) {
      if (dataMid === '20') {
        return `/tour-list.bc?catid=${dataId}`
      } else if (dataMid === '1') {
        return `/article-list.bc?catid=${dataId}`
      } else {
        return '#'
      }
    }
    return dataLink
  }

  megaMenus.forEach((menu) => {
    const menuItems = menu.querySelectorAll('.menu-item')
    const contents = menu.querySelectorAll('.tab-content')
    const fetchContentHeader = menu.querySelector('.fetch-content-header')
    const menuLinkHeaders = menu.querySelectorAll('.menu-link-header')

    menuItems.forEach((btn, index) => {
      const tab = btn.dataset.tab
      if (contents[index]) {
        contents[index].setAttribute('data-tab-content', tab)
      }
    })

    function resetTabs() {
      menuItems.forEach((btn) => {
        btn.classList.remove(...ACTIVE_CLASSES)
        btn.querySelectorAll('.active-indicator').forEach((span) => {
          span.classList.remove(...ACTIVE_SCALE_CLASSES)
          if (span.classList.contains('w-full')) {
            span.classList.add('scale-x-0')
          } else {
            span.classList.add('scale-y-0')
          }
        })
      })

      if (menuLinkHeaders) {
        menuLinkHeaders.forEach((link) => {
          link.classList.remove(LINK_ACTIVE_CLASS)
          link.href = '#'
          link.textContent = ''
        })
      }
    }

    function activateTab(btn) {
      const target = btn.dataset.tab
      const content = menu.querySelector(`[data-tab-content="${target}"]`)
      btn.classList.add(...ACTIVE_CLASSES)
      btn.querySelectorAll('.active-indicator').forEach((span) => {
        if (span.classList.contains('w-full')) {
          span.classList.remove('scale-x-0')
          span.classList.add('scale-x-100')
        } else {
          span.classList.remove('scale-y-0')
          span.classList.add('scale-y-100')
        }
      })
      if (content) {
        content.classList.remove('hidden')
      }
    }

    async function loadContent(dataId, dataMid) {
      if (!fetchContentHeader || !dataId) return

      fetchContentHeader.innerHTML =
        '<div class="flex justify-center mt-20"><span class="fetch-loader"></span></div>'
      try {
        const response = await fetch(
          `/header-menu-load-items.bc?catid=${dataId}&mid=${dataMid}`,
        )
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`)
        const data = await response.text()
        fetchContentHeader.innerHTML = data
      } catch (error) {
        fetchContentHeader.innerHTML =
          '<p>خطا در بارگذاری محتوا: ' + error.message + '</p>'
      }
    }

    menuItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dataId = btn.dataset.id
        const dataMid = btn.dataset.mid
        const dataLink = btn.dataset.link
        const dataTab = btn.dataset.tab

        resetTabs()
        activateTab(btn)
        loadContent(dataId, dataMid)

        if (menuLinkHeaders) {
          menuLinkHeaders.forEach((link) => {
            link.href = getLinkHref(dataLink, dataMid, dataId)
            link.textContent = dataTab || ''
            link.classList.add(LINK_ACTIVE_CLASS)
          })
        }
      })
    })

    const firstBtn = menu.querySelector('.menu-item')
    if (firstBtn) {
      resetTabs()
      activateTab(firstBtn)
      const dataId = firstBtn.dataset.id
      const dataMid = firstBtn.dataset.mid
      const dataLink = firstBtn.dataset.link
      const dataTab = firstBtn.dataset.tab

      loadContent(dataId, dataMid)

      if (menuLinkHeaders) {
        menuLinkHeaders.forEach((link) => {
          link.href = getLinkHref(dataLink, dataMid, dataId)
          link.textContent = dataTab || ''
          link.classList.add(LINK_ACTIVE_CLASS)
        })
      }
    }
  })
})
