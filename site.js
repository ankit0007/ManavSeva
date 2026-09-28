(function () {
  "use strict";

  const data = window.siteContent;
  const pageName = document.body.dataset.page || "home";
  const page = data.pages[pageName] || data.pages.home;

  function header() {
    const links = data.nav.map(([href, label]) => {
      const current = href === `${pageName === "home" ? "index" : pageName}.html`;
      return `<li><a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a></li>`;
    }).join("");
    return `
      <header class="site-header">
        <div class="header-inner">
          <a class="brand-mark" href="index.html" aria-label="देवी अहिल्या वेद विद्यालय मुख्य पृष्ठ">ॐ</a>
          <div class="brand-text">
            <strong>${data.site.name}</strong>
            <span>${data.site.tagline}</span>
          </div>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">Menu</button>
        </div>
        <nav class="site-nav" id="site-navigation" aria-label="मुख्य नेविगेशन">
          <div class="nav-inner"><ul class="nav-list">${links}</ul></div>
        </nav>
      </header>`;
  }

  function footer() {
    const footerLinks = data.nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
    return `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <p><strong>${data.site.name}</strong><br>${data.site.location}</p>
          <nav class="footer-nav" aria-label="फुटर नेविगेशन">${footerLinks}</nav>
          <p><a href="mailto:${data.site.email}">${data.site.email}</a><br>${data.site.mobile}</p>
        </div>
      </footer>`;
  }

  function sectionCards(items) {
    return `<div class="section-grid">${items.map((item) => `
      <article class="content-card">
        <h2>${item.title}</h2>
        <p>${item.text}</p>
      </article>`).join("")}</div>`;
  }

  function standardPage() {
    return `
      <section class="page-intro">
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.title}</h1>
        ${page.lead ? `<p>${page.lead}</p>` : ""}
      </section>
      ${page.hindi ? `<p class="hindi">${page.hindi}</p>` : ""}
      ${page.sections ? sectionCards(page.sections) : ""}
      ${page.callout ? `<p class="callout">${page.callout}</p>` : ""}`;
  }

  function homePage() {
    return `
      <section class="hero">
        <img src="${page.heroImage}" alt="Devi Ahilya Ved Vidyalaya campus">
        <div class="hero-content">
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.title}</h1>
          <p>${page.intro}</p>
        </div>
      </section>
      ${page.sections && page.sections.length ? `
        <section class="page-intro">
          <p class="eyebrow">Welcome</p>
          <h2>Learning rooted in values</h2>
          <p>Explore our purpose, campus, Vedic tradition, and the people supporting this educational mission.</p>
        </section>
        ${sectionCards(page.sections)}
        ${page.callout ? `<p class="callout">${page.callout}</p>` : ""}` : ""}`;
  }

  function patronPage() {
    return `
      <section class="page-intro">
        <p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.lead}</p>
      </section>
      <div class="split">
        <div>${sectionCards(page.sections.slice(0, 1))}</div>
        <img class="feature-image portrait" src="${page.image}" alt="${page.imageAlt}">
      </div>
      ${sectionCards(page.sections.slice(1))}`;
  }

  function campusPage() {
    return `
      <section class="page-intro">
        <p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.lead}</p>
      </section>
      <div class="split">
        <div>${sectionCards(page.sections)}</div>
        <img class="feature-image" src="${page.image}" alt="${page.imageAlt}">
      </div>`;
  }

  function galleryPage() {
    return `
      <section class="page-intro">
        <p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.lead}</p>
      </section>
      <div class="gallery-grid">${page.images.map((image, index) => `
        <figure class="gallery-item">
          <button type="button" data-lightbox="${index}" aria-label="View ${image.alt}">
            <img src="${image.src}" alt="${image.alt}">
          </button>
          <figcaption>${image.caption}</figcaption>
        </figure>`).join("")}</div>
      <div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="चित्र पूर्वावलोकन">
        <button class="lightbox-close" type="button" aria-label="चित्र बंद करें">&times;</button>
        <img src="" alt="">
      </div>`;
  }

  function trusteesPage() {
    return `
      <section class="page-intro"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1></section>
      <div class="trustee-grid">${page.columns.map((column) => `
        <article class="info-card"><h2>${column.title}</h2>
          <dl class="person-list">${column.people.map(([role, name]) => `
            <div><dt>${role}</dt><dd>${name}</dd></div>`).join("")}</dl>
        </article>`).join("")}</div>`;
  }

  function donationsPage() {
    return `
      <section class="page-intro"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p>${page.lead}</p></section>
      <article class="bank-card">
        <h2>बैंक विवरण</h2>
        <dl class="bank-list">${page.bank.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>
        <p class="hindi">${page.note}</p>
      </article>`;
  }

  function contactPage() {
    return `
      <section class="page-intro"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1></section>
      <div class="contact-grid">${page.addresses.map(([label, address]) => `
        <article class="contact-card"><strong>${label}</strong><p>${address}</p></article>`).join("")}
        <article class="contact-card">
          <strong>संपर्क विवरण</strong>
          <p>${page.phone}<br>${page.mobile}<br><a href="mailto:${page.email}">${page.email}</a></p>
          <div class="contact-actions">
            <a class="button" href="tel:${page.mobile.replace(/[^\d+]/g, "")}">कॉल करें</a>
            <a class="button" href="mailto:${page.email}">ईमेल करें</a>
          </div>
        </article>
      </div>`;
  }

  function render() {
    document.querySelector("#site-header").innerHTML = header();
    document.querySelector("#site-footer").innerHTML = footer();
    const app = document.querySelector("#app");
    app.innerHTML = pageName === "home" ? homePage()
      : pageName === "patron" ? patronPage()
      : pageName === "campus" ? campusPage()
      : pageName === "gallery" ? galleryPage()
      : pageName === "trustees" ? trusteesPage()
      : pageName === "donations" ? donationsPage()
      : pageName === "contact" ? contactPage()
      : standardPage();
    bindMenu();
    bindLightbox();
  }

  function bindMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function bindLightbox() {
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;
    const preview = lightbox.querySelector("img");
    const close = () => {
      lightbox.hidden = true;
      preview.src = "";
    };
    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => {
        const image = page.images[Number(button.dataset.lightbox)];
        preview.src = image.src;
        preview.alt = image.alt;
        lightbox.hidden = false;
        lightbox.querySelector(".lightbox-close").focus();
      });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) close();
    });
  }

  document.addEventListener("DOMContentLoaded", render);
}());
