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
    const fetchContentHeader = menu.querySelector('.fetch-content-header')
    const menuLinkHeader = menu.querySelector('.menu-link-header')

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

    function updateHeaderLink(dataLink, dataMid, dataId, dataName) {
      if (!menuLinkHeader) return
      let href = getLinkHref(dataLink, dataMid, dataId)
    
      if (href && !href.startsWith('/')) {
        href = '/' + href
      }
    
      menuLinkHeader.href = href
      menuLinkHeader.textContent = dataName || ''
    }

    menuItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dataId = btn.dataset.id
        const dataMid = btn.dataset.mid
        const dataLink = btn.dataset.link
        const dataName = btn.dataset.name

        resetTabs()
        activateTab(btn)
        loadContent(dataId, dataMid)
        updateHeaderLink(dataLink, dataMid, dataId, dataName)
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

      loadContent(dataId, dataMid)
      updateHeaderLink(dataLink, dataMid, dataId, dataName)
    }
  })
})

//----------fixed header-----------
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header");
  let placeholder = null;
  const headerHeight = header.offsetHeight;
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      header.classList.add(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "z-50",
        "bg-white"
      );
      header.classList.add("shadow-lg");
      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.style.height = headerHeight + "px";
        header.parentNode.insertBefore(placeholder, header.nextSibling);
      }
    } else {
      header.classList.remove(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "z-50",
        "bg-white"
      );
      header.classList.remove("shadow-lg");
      if (placeholder) {
        placeholder.remove();
        placeholder = null;
      }
    }
  });
});

//-----------form contact--------
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('.btn-contact')
  const form = document.querySelector('.form-contact')
  const overlay = document.querySelector('.contact-overlay')
  const closeBtn = document.querySelector('.close-contact')

  function openForm() {
    overlay.classList.remove('hidden', 'opacity-0')
    form.classList.remove('hidden', 'opacity-0', 'scale-90')
    form.classList.add('flex')

    requestAnimationFrame(() => {
      overlay.classList.add('opacity-100')
      form.classList.add('opacity-100', 'scale-100')
    })
  }

  function closeForm() {
    overlay.classList.remove('opacity-100')
    form.classList.remove('opacity-100', 'scale-100')
    overlay.classList.add('opacity-0')
    form.classList.add('opacity-0', 'scale-90')

    setTimeout(() => {
      overlay.classList.add('hidden')
      form.classList.add('hidden')
      form.classList.remove('flex')
    }, 300)
  }

  openBtn.addEventListener('click', openForm)
  overlay.addEventListener('click', closeForm)
  closeBtn.addEventListener('click', closeForm)
})

document.addEventListener("DOMContentLoaded", function () {
  const faqBoxes = document.querySelectorAll(".faq-box");

  faqBoxes.forEach((box) => {
    const btn = box.querySelector(".faq-btn");
    const answer = box.querySelector(".faq-answer");

    box.addEventListener("click", function () {
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

      faqBoxes.forEach((otherBox) => {
        const otherAnswer = otherBox.querySelector(".faq-answer");
        const otherBtn = otherBox.querySelector(".faq-btn");
        if (otherBox !== box) {
          otherAnswer.style.maxHeight = 0;
          otherAnswer.classList.remove("opacity-100", "mt-2");
          otherAnswer.classList.add("opacity-0");
          otherBtn.classList.remove("rotate-180");
        }
      });

      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.classList.remove("opacity-0");
        answer.classList.add("opacity-100", "mt-2");
        btn.classList.add("rotate-180");
      } else {
        answer.style.maxHeight = 0;
        answer.classList.remove("opacity-100", "mt-2");
        answer.classList.add("opacity-0");
        btn.classList.remove("rotate-180");
      }
    });
  });
});

(function () {
  const btn = document.getElementById('shareBtn');
  const menu = document.getElementById('shareMenu');
  const wrap = document.getElementById('shareWrap');

  function getSharePayload() {
      const title = btn.dataset.title?.trim() || document.title;
      const text = btn.dataset.text?.trim() || document.title;
      const url = (btn.dataset.url && btn.dataset.url.trim()) || window.location.href;
      return { title, text, url };
  }

  function setFallbackLinks() {
      const { title, text, url } = getSharePayload();
      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(title);
      const encodedText = encodeURIComponent(text);

      const tg = document.getElementById('shareTelegram');
      tg.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText || encodedTitle}`;

      const tw = document.getElementById('shareTwitter');
      tw.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText || encodedTitle}`;

      const wa = document.getElementById('shareWhatsapp');
      wa.href = `https://api.whatsapp.com/send?text=${encodedText || encodedTitle}%20${encodedUrl}`;
  }

  function openMenu() {
      setFallbackLinks();
      menu.classList.remove('invisible', 'pointer-events-none', 'opacity-0');
      menu.classList.add('opacity-100');
      btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
      menu.classList.add('opacity-0');
      menu.classList.remove('opacity-100');
      setTimeout(() => {
          menu.classList.add('invisible', 'pointer-events-none');
      }, 200);
      btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const payload = getSharePayload();

      if (navigator.share) {
          try {
              await navigator.share({
                  title: payload.title,
                  text: payload.text,
                  url: payload.url
              });
              return;
          } catch (err) {
              openMenu();
          }
      } else {
          openMenu();
      }
  });

  document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
          closeMenu();
      }
  });

  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
  });
})();