document.addEventListener('DOMContentLoaded', function () {
  const isDesktop = window.innerWidth > 1024
  const requiredFiles = isDesktop
    ? ['gato.ui.min.css']
    : ['gato-mob.ui.min.css']

  function checkAllResourcesLoaded() {
    const resources = performance.getEntriesByType('resource')
    const loadedFiles = resources
      .map((res) => res.name.split('/').pop())
      .filter((name) => requiredFiles.includes(name))

    return requiredFiles.every((file) => loadedFiles.includes(file))
  }

  if (document.getElementById('search-box')) {
    function fetchEngine() {
      try {
        const xhrobj = new XMLHttpRequest()
        xhrobj.open('GET', 'search-engine.bc')
        xhrobj.send()

        xhrobj.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            const container = document.getElementById('search-box')
            container.innerHTML = xhrobj.responseText
            ;['.Basis_Date.end_date', '.Basis_Date.start_date'].forEach(
              (selector) => {
                const dateInputs = document.querySelectorAll(selector)
                dateInputs.forEach((input) => {
                  input.placeholder = ''
                })
              },
            )

            const r = document.querySelector('.flighttype-field')
            r.classList.add('flighttype-dropDown')

            const scripts = container.getElementsByTagName('script')
            for (let i = 0; i < scripts.length; i++) {
              const scriptTag = document.createElement('script')
              if (scripts[i].src) {
                scriptTag.src = scripts[i].src
                scriptTag.async = false
              } else {
                scriptTag.text = scripts[i].textContent
              }
              document.head
                .appendChild(scriptTag)
                .parentNode.removeChild(scriptTag)
            }
          }
        }
      } catch (error) {
        console.error('مشکلی پیش آمده است. لطفا صبور باشید', error)
      }
    }

    function waitForFiles() {
      if (checkAllResourcesLoaded()) {
        fetchEngine()
      } else {
        setTimeout(waitForFiles, 500)
      }
    }
    waitForFiles()
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const nonRefreshPages = [
    '/',
    '/hotel',
    '/flight',
    '/tour',
    '/flighthotel',
    '/insurance',
  ]

  const isNotHome = !nonRefreshPages.includes(window.location.pathname)

  const hotelItem = document.querySelector('li[data-id="hotel"]')

  if (hotelItem) {
    hotelItem.addEventListener('click', function (e) {
      e.preventDefault()

      if (isNotHome) {
        window.location.href = '/hotel'
      } else {
        check_searchHistory('hotel')
        check_landing('hotel')
      }
    })
  }
})

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

//--------fetch mega-menu--------------
document.addEventListener('DOMContentLoaded', function () {
  const megaMenus = document.querySelectorAll('.mega-menu-li')

  const ACTIVE_CLASS = 'bg-primary-100'
  const contentCache = new Map()

  function getLinkHref(dataLink, dataMid, dataId) {
    if (!dataLink) {
      if (dataMid === '20') return `/tour-list.bc?catid=${dataId}`
      if (dataMid === '1') return `/article-list.bc?catid=${dataId}`
      return '#'
    }
    return dataLink
  }

  megaMenus.forEach((menu) => {
    const menuItems = menu.querySelectorAll('.menu-item')
    const fetchContentHeader = menu.querySelector('.fetch-content-header')
    const menuLinkHeader = menu.querySelector('.menu-link-header')
    const menuImageHeader = menu.querySelector('.menu-image-header')

    function resetTabs() {
      menuItems.forEach((btn) => btn.classList.remove(ACTIVE_CLASS))
    }
    function activateTab(btn) {
      btn.classList.add(ACTIVE_CLASS)
    }

    async function loadContent(dataId, dataMid) {
      if (!fetchContentHeader || !dataId) return
      const cacheKey = `${dataMid}-${dataId}`

      if (contentCache.has(cacheKey)) {
        fetchContentHeader.innerHTML = contentCache.get(cacheKey)
        return
      }

      fetchContentHeader.innerHTML =
        '<div class="flex justify-center mt-20"><span class="fetch-loader"></span></div>'

      try {
        const response = await fetch(
          `/header-menu-load-items.bc?catid=${dataId}&mid=${dataMid}`,
        )
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`)
        const data = await response.text()
        contentCache.set(cacheKey, data)
        fetchContentHeader.innerHTML = data
      } catch (error) {
        fetchContentHeader.innerHTML =
          '<p>خطا در بارگذاری محتوا: ' + error.message + '</p>'
      }
    }

    function updateHeaderLink(
      dataLink,
      dataMid,
      dataId,
      dataName,
      dataImage = '',
    ) {
      if (menuLinkHeader) {
        let href = getLinkHref(dataLink, dataMid, dataId)
        if (href && !href.startsWith('/')) href = '/' + href
        menuLinkHeader.href = href
        menuLinkHeader.textContent = dataName || ''
      }

      if (menuImageHeader) {
        if (!dataImage) {
          const sourceBtn =
            Array.from(menuItems).find((b) => b.dataset.id === dataId) ||
            Array.from(menuItems).find((b) =>
              b.classList.contains(ACTIVE_CLASS),
            ) ||
            menu.querySelector('.menu-item')
          dataImage = sourceBtn?.dataset?.image || ''
          if (!dataName) dataName = sourceBtn?.dataset?.name || ''
        }

        let src = dataImage || ''
        if (src && !/^https?:\/\//i.test(src) && !src.startsWith('/'))
          src = '/' + src
        if (src) menuImageHeader.src = src
        if (dataName) menuImageHeader.alt = dataName
      }
    }

    menuItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dataId = btn.dataset.id
        const dataMid = btn.dataset.mid
        const dataLink = btn.dataset.link
        const dataName = btn.dataset.name
        const dataImage = btn.dataset.image || ''

        resetTabs()
        activateTab(btn)
        loadContent(dataId, dataMid)
        updateHeaderLink(dataLink, dataMid, dataId, dataName, dataImage)
      })
    })

    const firstBtn = menu.querySelector('.menu-item')
    if (firstBtn) {
      resetTabs()
      activateTab(firstBtn)
      const dataId = firstBtn.dataset.id
      const dataMid = firstBtn.dataset.mid
      const dataLink = firstBtn.dataset.link
      const dataName = firstBtn.dataset.name
      const dataImage = firstBtn.dataset.image || ''

      loadContent(dataId, dataMid)
      updateHeaderLink(dataLink, dataMid, dataId, dataName, dataImage)
    }
  })
})

//----------fixed header-----------
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;

  let placeholder = null;

  function applyFixed() {
    const headerHeight = header.offsetHeight;

    if (window.scrollY > 100) {
      header.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-50', 'bg-white', 'shadow-lg');

      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.style.height = headerHeight + 'px';
        header.parentNode.insertBefore(placeholder, header.nextSibling);
      }
    } else {
      header.classList.remove('fixed', 'top-0', 'left-0', 'w-full', 'z-50', 'bg-white', 'shadow-lg');

      if (placeholder) {
        placeholder.remove();
        placeholder = null;
      }
    }
  }

  applyFixed();
  window.addEventListener('scroll', applyFixed, { passive: true });
});


//-----------form contact--------
document.addEventListener('DOMContentLoaded', () => {
  const openBtns = document.querySelectorAll('.btn-contact')
  const form = document.querySelector('.form-contact')
  const overlay = document.querySelector('.contact-overlay')
  const closeBtn = document.querySelector('.close-contact')
  const TRANSITION_MS = 300

  function openForm(e) {
    e?.preventDefault?.()
    document.body.style.overflow = 'hidden'
    
    overlay?.classList.remove('hidden', 'opacity-0')
    form?.classList.remove('hidden', 'opacity-0', 'scale-90')
    form?.classList.add('flex')

    requestAnimationFrame(() => {
      overlay?.classList.add('opacity-100')
      form?.classList.add('opacity-100', 'scale-100')
    })
  }

  function closeForm() {
    overlay?.classList.remove('opacity-100')
    form?.classList.remove('opacity-100', 'scale-100')
    overlay?.classList.add('opacity-0')
    form?.classList.add('opacity-0', 'scale-90')

    setTimeout(() => {
      document.body.style.overflow = ''
      
      overlay?.classList.add('hidden')
      form?.classList.add('hidden')
      form?.classList.remove('flex')
    }, TRANSITION_MS)
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openForm))

  overlay?.addEventListener('click', closeForm)
  closeBtn?.addEventListener('click', closeForm)

  form?.addEventListener('click', (e) => e.stopPropagation())

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeForm()
  })
})

//--------faq---------
document.addEventListener('DOMContentLoaded', function () {
  const faqBoxes = document.querySelectorAll('.faq-box')

  faqBoxes.forEach((box) => {
    const btn = box.querySelector('.faq-btn')
    const answer = box.querySelector('.faq-answer')

    box.addEventListener('click', function () {
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px'

      faqBoxes.forEach((otherBox) => {
        const otherAnswer = otherBox.querySelector('.faq-answer')
        const otherBtn = otherBox.querySelector('.faq-btn')
        if (otherBox !== box) {
          otherAnswer.style.maxHeight = 0
          otherAnswer.classList.remove('opacity-100', 'mt-2')
          otherAnswer.classList.add('opacity-0')
          otherBtn.classList.remove('rotate-180')
        }
      })

      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px'
        answer.classList.remove('opacity-0')
        answer.classList.add('opacity-100', 'mt-2')
        btn.classList.add('rotate-180')
      } else {
        answer.style.maxHeight = 0
        answer.classList.remove('opacity-100', 'mt-2')
        answer.classList.add('opacity-0')
        btn.classList.remove('rotate-180')
      }
    })
  })

  document.addEventListener('click', function (event) {
    const isClickInside = Array.from(faqBoxes).some((box) =>
      box.contains(event.target),
    )
    if (!isClickInside) {
      faqBoxes.forEach((box) => {
        const answer = box.querySelector('.faq-answer')
        const btn = box.querySelector('.faq-btn')
        answer.style.maxHeight = 0
        answer.classList.remove('opacity-100', 'mt-2')
        answer.classList.add('opacity-0')
        btn.classList.remove('rotate-180')
      })
    }
  })
})
;(function () {
  const btn = document.getElementById('shareBtn')
  const menu = document.getElementById('shareMenu')
  const wrap = document.getElementById('shareWrap')

  function getSharePayload() {
    const title = btn.dataset.title?.trim() || document.title
    const text = btn.dataset.text?.trim() || document.title
    const url =
      (btn.dataset.url && btn.dataset.url.trim()) || window.location.href
    return { title, text, url }
  }

  function setFallbackLinks() {
    const { title, text, url } = getSharePayload()
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedText = encodeURIComponent(text)

    const tg = document.getElementById('shareTelegram')
    tg.href = `https://t.me/share/url?url=${encodedUrl}&text=${
      encodedText || encodedTitle
    }`

    const tw = document.getElementById('shareTwitter')
    tw.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${
      encodedText || encodedTitle
    }`

    const wa = document.getElementById('shareWhatsapp')
    wa.href = `https://api.whatsapp.com/send?text=${
      encodedText || encodedTitle
    }%20${encodedUrl}`
  }

  function openMenu() {
    setFallbackLinks()
    menu.classList.remove('invisible', 'pointer-events-none', 'opacity-0')
    menu.classList.add('opacity-100')
    btn.setAttribute('aria-expanded', 'true')
  }
  function closeMenu() {
    menu.classList.add('opacity-0')
    menu.classList.remove('opacity-100')
    setTimeout(() => {
      menu.classList.add('invisible', 'pointer-events-none')
    }, 200)
    btn.setAttribute('aria-expanded', 'false')
  }

  btn?.addEventListener('click', async (e) => {
    e.preventDefault()
    const payload = getSharePayload()

    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        })
        return
      } catch (err) {
        openMenu()
      }
    } else {
      openMenu()
    }
  })

  document.addEventListener('click', (e) => {
    if (wrap && !wrap.contains(e.target)) closeMenu()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu()
  })
})()

// dont repeat breadcrumb
document.addEventListener('DOMContentLoaded', function () {
  const breadcrumbContainer = document.querySelector('.breadcrumb')
  if (!breadcrumbContainer) return

  const items = breadcrumbContainer.querySelectorAll('li')
  if (!items || items.length === 0) return

  const uniqueLinks = new Map()

  items.forEach((li) => {
    if (!li) return

    const link = li.querySelector('a')
    if (!link) return

    const text = link.textContent.trim()
    if (!text) return

    if (!uniqueLinks.has(text)) {
      uniqueLinks.set(text, li)
    } else {
      li.remove()
    }
  })
})

// header form
function uploadDocumentHeader(args) {
  document.querySelector('#header-form-resize .Loading_Form').style.display =
    'block'
  const captcha = document
    .querySelector('#header-form-resize')
    .querySelector("#captchaContainer input[name='captcha']").value
  const captchaid = document
    .querySelector('#header-form-resize')
    .querySelector("#captchaContainer input[name='captchaid']").value
  const stringJson = JSON.stringify(args.source?.rows[0])
  $bc.setSource('cms.uploadHeader', {
    value: stringJson,
    captcha: captcha,
    captchaid: captchaid,
    run: true,
  })
}

function refreshCaptchaHeader(e) {
  $bc.setSource('captcha.refreshHeader', true)
}

async function OnProcessedEditObjectHeader(args) {
  var response = args.response
  var json = await response.json()
  var errorid = json.errorid
  if (errorid == '6') {
    document.querySelector('#header-form-resize .Loading_Form').style.display =
      'none'
    document.querySelector('#header-form-resize .message-api').innerHTML =
      'درخواست شما با موفقیت ثبت شد.'
    document.querySelector('#header-form-resize .message-api').style.color =
      'rgb(60 200 60)'
  } else {
    refreshCaptchaHeader()
    setTimeout(() => {
      document.querySelector(
        '#header-form-resize .Loading_Form',
      ).style.display = 'none'
      document.querySelector('#header-form-resize .message-api').innerHTML =
        'خطایی رخ داده, لطفا مجدد اقدام کنید.'
      document.querySelector('#header-form-resize .message-api').style.color =
        'rgb(220 38 38)'
    }, 2000)
  }
}

async function RenderFormHeader() {
  var inputElementVisa7 = document.querySelector(
    ' .name-header-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام')

  var inputElementVisa7 = document.querySelector(
    ' .family-header-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام خانوادگی')
  var inputElementVisa7 = document.querySelector(
    ' .email-header-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ایمیل')

  var inputElementVisa7 = document.querySelector(
    ' .phone-header-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'شماره تماس')

  var inputElementVisa7 = document.querySelector(
    ' .message-header-form textarea[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'متن')
}

//footer-form
function uploadDocumentFooter(args) {
  document.querySelector('#footer-form-resize .Loading_Form').style.display =
    'block'
  const captcha = document
    .querySelector('#footer-form-resize')
    .querySelector("#captchaContainer input[name='captcha']").value
  const captchaid = document
    .querySelector('#footer-form-resize')
    .querySelector("#captchaContainer input[name='captchaid']").value
  const stringJson = JSON.stringify(args.source?.rows[0])
  $bc.setSource('cms.uploadFooter', {
    value: stringJson,
    captcha: captcha,
    captchaid: captchaid,
    run: true,
  })
}

function refreshCaptchaFooter(e) {
  $bc.setSource('captcha.refreshFooter', true)
}

async function OnProcessedEditObjectFooter(args) {
  var response = args.response
  var json = await response.json()
  var errorid = json.errorid
  if (errorid == '6') {
    document.querySelector('#footer-form-resize .Loading_Form').style.display =
      'none'
    document.querySelector('#footer-form-resize .message-api').innerHTML =
      'درخواست شما با موفقیت ثبت شد.'
    document.querySelector('#footer-form-resize .message-api').style.color =
      'rgb(60 200 60)'
  } else {
    refreshCaptchaFooter()
    setTimeout(() => {
      document.querySelector(
        '#footer-form-resize .Loading_Form',
      ).style.display = 'none'
      document.querySelector('#footer-form-resize .message-api').innerHTML =
        'خطایی رخ داده, لطفا مجدد اقدام کنید.'
      document.querySelector('#footer-form-resize .message-api').style.color =
        'rgb(220 38 38)'
    }, 2000)
  }
}

async function RenderFormFooter() {
  var inputElementVisa7 = document.querySelector(
    ' .email-footer-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ایمیل')
}

//form contact
function uploadDocumentContact(args) {
  document.querySelector('#contact-form-resize .Loading_Form').style.display =
    'block'
  const captcha = document
    .querySelector('#contact-form-resize')
    .querySelector("#captchaContainer input[name='captcha']").value
  const captchaid = document
    .querySelector('#contact-form-resize')
    .querySelector("#captchaContainer input[name='captchaid']").value
  const stringJson = JSON.stringify(args.source?.rows[0])
  $bc.setSource('cms.uploadContact', {
    value: stringJson,
    captcha: captcha,
    captchaid: captchaid,
    run: true,
  })
}

function refreshCaptchaContact(e) {
  $bc.setSource('captcha.refreshContact', true)
}

async function OnProcessedEditObjectContact(args) {
  var response = args.response
  var json = await response.json()
  var errorid = json.errorid
  if (errorid == '6') {
    document.querySelector('#contact-form-resize .Loading_Form').style.display =
      'none'
    document.querySelector('#contact-form-resize .message-api').innerHTML =
      'درخواست شما با موفقیت ثبت شد.'
    document.querySelector('#contact-form-resize .message-api').style.color =
      'rgb(60 200 60)'
  } else {
    refreshCaptchaContact()
    setTimeout(() => {
      document.querySelector(
        '#contact-form-resize .Loading_Form',
      ).style.display = 'none'
      document.querySelector('#contact-form-resize .message-api').innerHTML =
        'خطایی رخ داده, لطفا مجدد اقدام کنید.'
      document.querySelector('#contact-form-resize .message-api').style.color =
        'rgb(220 38 38)'
    }, 2000)
  }
}

async function RenderFormContact() {
  var inputElementVisa7 = document.querySelector(
    ' .email-question-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ایمیل')

  var inputElementVisa7 = document.querySelector(
    ' .message-question-form textarea[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'متن')
}

// visa form
function uploadDocumentVisa(args) {
  document.querySelector('#visa-form-resize .Loading_Form').style.display =
    'block'
  const captcha = document
    .querySelector('#visa-form-resize')
    .querySelector("#captchaContainer input[name='captcha']").value
  const captchaid = document
    .querySelector('#visa-form-resize')
    .querySelector("#captchaContainer input[name='captchaid']").value
  const stringJson = JSON.stringify(args.source?.rows[0])
  $bc.setSource('cms.uploadVisa', {
    value: stringJson,
    captcha: captcha,
    captchaid: captchaid,
    run: true,
  })
}

function refreshCaptchaVisa(e) {
  $bc.setSource('captcha.refreshVisa', true)
}

async function OnProcessedEditObjectVisa(args) {
  var response = args.response
  var json = await response.json()
  var errorid = json.errorid
  if (errorid == '6') {
    document.querySelector('#visa-form-resize .Loading_Form').style.display =
      'none'
    document.querySelector('#visa-form-resize .message-api').innerHTML =
      'درخواست شما با موفقیت ثبت شد.'
    document.querySelector('#visa-form-resize .message-api').style.color =
      'rgb(60 200 60)'
  } else {
    refreshCaptchaVisa()
    setTimeout(() => {
      document.querySelector('#visa-form-resize .Loading_Form').style.display =
        'none'
      document.querySelector('#visa-form-resize .message-api').innerHTML =
        'خطایی رخ داده, لطفا مجدد اقدام کنید.'
      document.querySelector('#visa-form-resize .message-api').style.color =
        'rgb(220 38 38)'
    }, 2000)
  }
}

async function RenderFormVisa() {
  var inputElementVisa7 = document.querySelector(
    '.name-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام *')

  var inputElementVisa7 = document.querySelector(
    ' .family-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام خانوادگی*')

  var inputElementVisa7 = document.querySelector(
    '.previous-name-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute(
    'placeholder',
    'نام قبلی ( در صورت تغییر نام )',
  )

  var inputElementVisa7 = document.querySelector(
    ' .birth-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ تولد*')

  var inputElementVisa7 = document.querySelector(
    '.birth-place-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'محل تولد*')

  var inputElementVisa7 = document.querySelector(
    ' .nationality-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ملیت*')

  var inputElementVisa7 = document.querySelector(
    '.previous-nationality-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ملیت قبلی ( در صورت وجود)')

  var inputElementVisa8 = document.querySelector(
    '.address-form textarea[data-bc-text-input]',
  )
  inputElementVisa8.setAttribute('placeholder', 'آدرس محل سکونت*')

  var inputElementVisa7 = document.querySelector(
    '.phone-number-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'شماره تماس*')

  var inputElementVisa7 = document.querySelector(
    ' .fixed-number-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'شماره ثابت')

  var inputElementVisa7 = document.querySelector(
    '.email-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ایمیل*')

  var inputElementVisa7 = document.querySelector(
    '.nationality-form-two input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'ملیت*')

  var inputElementVisa7 = document.querySelector(
    ' .passport-number-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'شماره پاسپورت*')

  var inputElementVisa7 = document.querySelector(
    '.issue-date-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ صدور*')

  var inputElementVisa7 = document.querySelector(
    ' .expire-date-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ انقضا*')
  var inputElementVisa7 = document.querySelector(
    ' .country-passport-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'کشور صادرکننده پاسپورت*')
  var inputElementVisa7 = document.querySelector(
    ' .destination-country-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'کشور مقصد*')
  var inputElementVisa7 = document.querySelector(
    ' .date-in-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ ورود مورد انتظار')

  var inputElementVisa7 = document.querySelector(
    ' .date-out-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ خروج مورد انتظار')

  var inputElementVisa7 = document.querySelector(
    ' .sponsor-name-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام اسپانسر')

  var inputElementVisa7 = document.querySelector(
    ' .componey-name-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام شرکت یا موسسه آموزشی')

  var inputElementVisa7 = document.querySelector(
    ' .componey-address-form textarea[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute(
    'placeholder',
    'آدرس و شماره تماس کارفرما یا دانشگاه',
  )

  var inputElementVisa7 = document.querySelector(
    ' .wife-name-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'نام و اطلاعات همسر')

  var inputElementVisa7 = document.querySelector(
    ' .number-child-form textarea[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تعداد فرزندان و اطلاعات آنها')

  var inputElementVisa7 = document.querySelector(
    ' .completion-date-form input[data-bc-text-input]',
  )
  inputElementVisa7.setAttribute('placeholder', 'تاریخ تکمیل فرم')
}

// --------------swiper---------------
if (document.querySelector('.swiper-article-cat')) {
  var swiperArticleCat = new Swiper('.swiper-article-cat', {
    slidesPerView: 1,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 30,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next-custom',
      prevEl: '.swiper-button-prev-custom',
    },
  })
}
if (document.querySelector('.swiper-offer-tours')) {
  var swiperOfferTours = new Swiper('.swiper-offer-tours', {
    slidesPerView: 4,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 24,
    grabCursor: true,
    loop: true,
    watchOverflow: false,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  })
}
let swiperTourCat, swiperTourDescriptionCat;

if (document.querySelector('.swiper-tour-cat')) {
  const swiperEl = document.querySelector('.swiper-tour-cat');

  swiperTourCat = new Swiper(swiperEl, {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: 16,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 0,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  });

  window.addEventListener('load', () => swiperTourCat.update());
  setTimeout(() => swiperTourCat.update(), 1000);
}

if (document.querySelector('.swiper-tour-description-cat')) {
  swiperTourDescriptionCat = new Swiper('.swiper-tour-description-cat', {
    slidesPerView: 1,
    speed: 400,
    direction: 'vertical',
    spaceBetween: 16,
    grabCursor: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}

if (swiperTourCat && swiperTourDescriptionCat) {
  swiperTourCat.controller.control = swiperTourDescriptionCat;
  swiperTourDescriptionCat.controller.control = swiperTourCat;
}

if (document.querySelector('.swiper-exhibition-tours')) {
  var swiperExhibitionTours = new Swiper('.swiper-exhibition-tours', {
    slidesPerView: 4,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 24,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  })
}
if (document.querySelector('.swiper-popular-tours')) {
  var swiperPopularTours = new Swiper('.swiper-popular-tours', {
    slidesPerView: 1.45,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 16,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  })
}
if (document.querySelector('.swiper-tour-cat-mobile')) {
  var swiperTourCatMobile = new Swiper('.swiper-tour-cat-mobile', {
    slidesPerView: 1,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 16,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
  })
}
if (document.querySelector('.swiper-visa')) {
  var swiperVisa = new Swiper('.swiper-visa', {
    slidesPerView: 1.45,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 24,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
    breakpoints: {
      1024: {
        slidesPerView: 6,
        spaceBetween: 24,
      },
    },
  })
}
