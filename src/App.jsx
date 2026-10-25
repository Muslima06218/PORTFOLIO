import React, { useEffect, useState } from 'react';
import { copy } from './translations.js';
import AdminPage from './Admin.jsx';

const words = [
  { ar: 'كِتابٌ', uz: 'kitob', ru: 'книга', en: 'book' },
  { ar: 'قَلَمٌ', uz: 'qalam', ru: 'ручка', en: 'pen' },
  { ar: 'مَكْتَبَةٌ', uz: 'kutubxona', ru: 'библиотека', en: 'library' },
];

function safeMarkup(value) {
  const html = String(value).replace(/<\/?\s*(br|strong|em|span)\b[^>]*>/gi, (tag) => {
    const match = tag.match(/<\/?\s*(br|strong|em|span)/i);
    const name = match[1].toLowerCase();
    return tag.startsWith('</') ? `</${name}>` : `<${name}>`;
  }).replace(/<[^>]*>/g, '');
  return { __html: html };
}

function HtmlText({ html }) {
  return <span className="rich-text" dangerouslySetInnerHTML={safeMarkup(html)} />;
}

export default function App() {
  return window.location.pathname.startsWith('/admin') ? <AdminPage /> : <Portfolio />;
}

function Portfolio() {
  const [lang, setLang] = useState(() => localStorage.getItem('muslima-lang') || 'uz');
  const [theme, setTheme] = useState(() => localStorage.getItem('muslima-theme') || 'dark');
  const [translations, setTranslations] = useState(copy);
  const [wordIndex, setWordIndex] = useState(0);
  const [palette, setPalette] = useState(0);
  const text = translations[lang] || translations.uz;
  const word = words[wordIndex % words.length];

  useEffect(() => {
    fetch('/api/content').then((response) => response.ok ? response.json() : null)
      .then((saved) => { if (saved) setTranslations(saved); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('muslima-lang', lang); } catch {}
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    try { localStorage.setItem('muslima-theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const t = (key) => text[key] ?? key;
  const html = (key) => safeMarkup(t(key));
  const meaning = lang === 'ar' ? word.ar : (word[lang] || word.en);

  return (
    <>
      <header className="topbar">
        <div className="container nav">
          <a href="#home" className="brand" aria-label="Muslima portfolio">
            <span className="brand-mark">M</span><span>ERKINOVA <br /> MUSLIMA</span>
          </a>
          <nav className="menu" aria-label="Main navigation">
            <a href="#about">{t('navAbout')}</a><a href="#work">{t('navWork')}</a><a href="#skills">{t('navSkills')}</a>
          </nav>
          <div className="nav-right">
            <div className="controls" role="group" aria-label="Language">
              {['uz', 'ru', 'en', 'ar'].map((code) => (
                <button key={code} className={`lang ${lang === code ? 'active' : ''}`} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>{code.toUpperCase()}</button>
              ))}
            </div>
            <button className="icon-btn" type="button" aria-label="Switch color theme" title="Switch color theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '☾' : '☼'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="reveal">
              <div className="eyebrow">{t('heroKicker')}</div>
              <h1><HtmlText html={t('heroTitle')} /></h1>
              <p className="hero-copy" dangerouslySetInnerHTML={html('heroCopy')} />
              <div className="actions">
                <a className="btn primary" href="#work"><span>{t('heroCta')}</span><span className="arrow">↗</span></a>
                <a className="btn" href="#about"><span>{t('heroMore')}</span><span className="arrow">↓</span></a>
              </div>
            </div>
            <div className="hero-art reveal" aria-hidden="true">
              <div className="orbit"><i className="orbit-dot" /></div>
              <div className="medallion"><span className="initials">م</span></div>
              <div className="float-card cert"><span className="float-icon">✦</span><span><b>{t('badgeB2')}</b><small>{t('badgeCert')}</small></span></div>
              <div className="float-card globe"><span className="float-icon">⌖</span><span><b>{t('badgeWorld')}</b><small>{t('badgeDream')}</small></span></div>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="section-head reveal">
              <div><div className="section-kicker">{t('aboutKicker')}</div><h2>{t('aboutTitle')}</h2></div>
              <p className="section-intro">{t('aboutIntro')}</p>
            </div>
            <div className="about-grid">
              <aside className="quote-panel reveal"><div className="quote-mark">“</div><blockquote>{t('quote')}</blockquote><small>{t('quoteBy')}</small></aside>
              <div className="about-text reveal">
                <p dangerouslySetInnerHTML={html('aboutP1')} /><p dangerouslySetInnerHTML={html('aboutP2')} /><p dangerouslySetInnerHTML={html('aboutP3')} />
                <div className="pill-row">{['pillTeacher', 'pillB2', 'pillIT', 'pillTravel'].map((key) => <span className="pill" key={key}>{t(key)}</span>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="work">
          <div className="container">
            <div className="section-head reveal">
              <div><div className="section-kicker">{t('workKicker')}</div><h2>{t('workTitle')}</h2></div>
              <p className="section-intro">{t('workIntro')}</p>
            </div>
            <div className="work-grid">
              <article className="work-card reveal" style={{ '--wash': '#6ad4ae' }}>
                <div className="work-number"><span>01</span><span>{t('workLabel')}</span></div>
                <div className="project-preview flashcard-demo">
                  <div className="demo-top"><span>{t('flashLabel')}</span><span className="sparkle">✦</span></div>
                  <div className="word-ar" key={word.ar}>{word.ar}</div><div className="word-meaning">{meaning}</div>
                  <button className="demo-button" type="button" onClick={() => setWordIndex((index) => index + 1)}><HtmlText html={t('wordNext')} /></button>
                </div>
                <h3>{t('workCard1')}</h3><p>{t('workDesc1')}</p>
              </article>
              <article className="work-card reveal" style={{ '--wash': '#a9a2ff' }}>
                <div className="work-number"><span>02</span><span>{t('workLabel')}</span></div>
                <div className="project-preview orbit-demo"><span className="orbit-star">✦</span><span className="planet p-one" /><span className="planet p-two" /><span className="planet p-three" /><span className="orbit-label">{t('orbitLabel')}</span></div>
                <h3>{t('workCard2')}</h3><p>{t('workDesc2')}</p>
              </article>
              <article className="work-card reveal" style={{ '--wash': '#efc36b' }}>
                <div className="work-number"><span>03</span><span>{t('workLabel')}</span></div>
                <div className="project-preview palette-demo" data-scheme={palette}>
                  <div className="palette-title">{t('paletteTitle')}</div><div className="palette-bars"><i /><i /><i /><i /></div>
                  <button className="demo-button palette-button" type="button" onClick={() => setPalette((value) => (value + 1) % 3)}><HtmlText html={t('paletteNext')} /></button>
                </div>
                <h3>{t('workCard3')}</h3><p>{t('workDesc3')}</p>
              </article>
            </div>
            <p className="work-foot reveal">{t('workFoot')}</p>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="container skills-layout">
            <div className="reveal"><div className="section-kicker">{t('skillsKicker')}</div><h2><HtmlText html={t('skillsTitle')} /></h2><p className="skills-note" dangerouslySetInnerHTML={html('skillsNote')} /></div>
            <div className="skill-list reveal">
              <div className="skill"><span className="skill-icon">ع</span><span><b>{t('skill1')}</b><small>{t('skill1d')}</small></span><span className="skill-tag">{t('skillTag1')}</span></div>
              <div className="skill"><span className="skill-icon">⌘</span><span><b>{t('skill2')}</b><small>{t('skill2d')}</small></span><span className="skill-tag">{t('skillTag2')}</span></div>
              <div className="skill"><span className="skill-icon">◎</span><span><b>{t('skill3')}</b><small>{t('skill3d')}</small></span><span className="skill-tag">{t('skillTag3')}</span></div>
            </div>
          </div>
        </section>

        <section className="journey"><div className="container"><div className="journey-box reveal">
          <div><div className="section-kicker">{t('nextKicker')}</div><h2>{t('nextTitle')}</h2><p>{t('nextText')}</p></div>
          <a href="#home" className="btn primary"><span>{t('backTop')}</span><span className="arrow">↑</span></a>
        </div></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><span className="footer-name">ERKINOVA MUSLIMA</span><span>{t('footer')}</span><a className="footer-admin" href="/admin">Admin panel</a></div></footer>
    </>
  );
}
