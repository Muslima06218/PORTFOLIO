import React, { useEffect, useState } from 'react';
import { copy } from './translations.js';

const languages = [
  ['uz', 'O‘zbekcha'], ['ru', 'Русский'], ['en', 'English'], ['ar', 'العربية'],
];
const groups = [
  ['Bosh sahifa', ['heroKicker', 'heroTitle', 'heroCopy', 'heroCta', 'heroMore', 'badgeB2', 'badgeCert', 'badgeWorld', 'badgeDream']],
  ['Men haqimda', ['aboutKicker', 'aboutTitle', 'aboutIntro', 'quote', 'quoteBy', 'aboutP1', 'aboutP2', 'aboutP3', 'pillTeacher', 'pillB2', 'pillIT', 'pillTravel']],
  ['Loyihalar', ['workKicker', 'workTitle', 'workIntro', 'workLabel', 'workCard1', 'workDesc1', 'workCard2', 'workDesc2', 'workCard3', 'workDesc3', 'workFoot', 'flashLabel', 'wordNext', 'orbitLabel', 'paletteTitle', 'paletteNext']],
  ['Yo‘nalishlar va pastki qism', ['skillsKicker', 'skillsTitle', 'skillsNote', 'skill1', 'skill1d', 'skill2', 'skill2d', 'skill3', 'skill3d', 'skillTag1', 'skillTag2', 'skillTag3', 'nextKicker', 'nextTitle', 'nextText', 'backTop', 'footer']],
];
const labels = {
  heroKicker: 'Qisqa sarlavha', heroTitle: 'Ism ko‘rinishi', heroCopy: 'Bosh sahifa tanishtiruvi', heroCta: 'Loyiha tugmasi', heroMore: 'Men haqimda tugmasi',
  badgeB2: 'B2 yorlig‘i', badgeCert: 'Sertifikat yorlig‘i', badgeWorld: 'Dunyo yorlig‘i', badgeDream: 'Maqsadlar yorlig‘i',
  aboutKicker: 'Bo‘lim yorlig‘i', aboutTitle: 'Bo‘lim sarlavhasi', aboutIntro: 'Qisqa kirish', quote: 'Iqtibos', quoteBy: 'Iqtibos muallifi', aboutP1: '1-paragraf', aboutP2: '2-paragraf', aboutP3: '3-paragraf',
  pillTeacher: 'Kasb belgisi', pillB2: 'B2 belgisi', pillIT: 'IT belgisi', pillTravel: 'Sayohat belgisi', workKicker: 'Loyihalar yorlig‘i', workTitle: 'Loyihalar sarlavhasi', workIntro: 'Loyihalar izohi', workLabel: 'Mini-demo belgisi',
  workCard1: '1-loyiha nomi', workDesc1: '1-loyiha izohi', workCard2: '2-loyiha nomi', workDesc2: '2-loyiha izohi', workCard3: '3-loyiha nomi', workDesc3: '3-loyiha izohi', workFoot: 'Loyiha bo‘limi pastki matni', flashLabel: 'Arabcha karta sarlavhasi', wordNext: 'Keyingi so‘z tugmasi', orbitLabel: 'Orbit animatsiyasi yozuvi', paletteTitle: 'Ranglar namunasi sarlavhasi', paletteNext: 'Palitra tugmasi',
  skillsKicker: 'Qiziqishlar yorlig‘i', skillsTitle: 'Qiziqishlar sarlavhasi', skillsNote: 'Qiziqishlar izohi', skill1: '1-yo‘nalish', skill1d: '1-yo‘nalish izohi', skill2: '2-yo‘nalish', skill2d: '2-yo‘nalish izohi', skill3: '3-yo‘nalish', skill3d: '3-yo‘nalish izohi', skillTag1: '1-yorliq', skillTag2: '2-yorliq', skillTag3: '3-yorliq', nextKicker: 'Yakuniy bo‘lim yorlig‘i', nextTitle: 'Yakuniy sarlavha', nextText: 'Yakuniy izoh', backTop: 'Yuqoriga tugmasi', footer: 'Pastki qism matni',
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [lang, setLang] = useState('uz');
  const [content, setContent] = useState(copy);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fields = useMemo(() => groups.flatMap(([, keys]) => keys), []);

  useEffect(() => {
    fetch('/api/admin/session').then((r) => r.json()).then(async ({ authenticated }) => {
      if (authenticated) {
        setAuthorized(true);
        const response = await fetch('/api/admin/content');
        if (response.ok) setContent(await response.json());
      }
    }).catch(() => {}).finally(() => setChecking(false));
  }, []);

  async function login(event) {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kirish amalga oshmadi.');
      setAuthorized(true); setPassword(''); setContent(result.content || copy); setMessage('Panelga xush kelibsiz.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function saveContent() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Saqlash amalga oshmadi.');
      setContent(result.content); setMessage('O‘zgarishlar saqlandi. Saytni yangilasangiz, yangi matnlar ko‘rinadi.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthorized(false); setMessage('');
  }

  async function changePassword(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Parolni almashtirib bo‘lmadi.');
      setCurrentPassword(''); setNewPassword(''); setMessage('Admin paroli yangilandi.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  if (checking) return <div className="admin-page"><div className="admin-card">Yuklanmoqda…</div></div>;
  if (!authorized) return (
    <main className="admin-page">
      <form className="admin-card login-card" onSubmit={login}>
        <a className="admin-back" href="/">← Portfolio saytiga qaytish</a>
        <div className="section-kicker">MUSLIMA PORTFOLIO</div>
        <h1>Admin panel</h1>
        <p className="section-intro">Sayt matnlarini boshqarish uchun parolni kiriting.</p>
        <label className="admin-label">Admin paroli<input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {message && <p className="admin-message" role="status">{message}</p>}
        <button className="btn primary admin-submit" disabled={busy}>{busy ? 'Tekshirilmoqda…' : 'Kirish'} <span>↗</span></button>
      </form>
    </main>
  );

  return (
    <main className="admin-page">
      <div className="admin-wrap">
        <header className="admin-header">
          <div><a className="admin-back" href="/">← Portfolio saytini ko‘rish</a><div className="section-kicker">MUSLIMA PORTFOLIO</div><h1>Admin panel</h1><p>Saytingizdagi matnlarni shu yerdan tahrirlang.</p></div>
          <button className="btn admin-logout" type="button" onClick={logout}>Chiqish</button>
        </header>
        <section className="admin-card editor-card">
          <div className="admin-toolbar"><div><h2>Sayt matnlari</h2><p>Tilni tanlab, kerakli maydonlarni o‘zgartiring.</p></div>
            <label className="admin-label language-picker">Tahrir tili<select value={lang} onChange={(e) => setLang(e.target.value)}>{languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
          </div>
          {groups.map(([title, keys]) => <section className="editor-group" key={title}><h3>{title}</h3><div className="editor-fields">
            {keys.filter((key) => fields.includes(key)).map((key) => {
              const value = content[lang]?.[key] ?? '';
              const long = value.length > 100 || /Copy|Desc|Intro|aboutP|Note|Foot|Text|Title|Next/.test(key);
              return <label className="admin-label" key={key}><span>{labels[key] || key}<small>{key.match(/Title|Copy|Note|P[123]|Next|wordNext|skillsNote/)?' · oddiy HTML mumkin: <br>, <strong>, <em>':''}</small></span>
                {long ? <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={3} value={value} onChange={(e) => setContent((old) => ({ ...old, [lang]: { ...old[lang], [key]: e.target.value } }))} /> : <input dir={lang === 'ar' ? 'rtl' : 'ltr'} value={value} onChange={(e) => setContent((old) => ({ ...old, [lang]: { ...old[lang], [key]: e.target.value } }))} />}
              </label>;
            })}
          </div></section>)}
          <div className="admin-save-row">{message && <p className="admin-message" role="status">{message}</p>}<button className="btn primary" type="button" onClick={saveContent} disabled={busy}>{busy ? 'Saqlanmoqda…' : 'O‘zgarishlarni saqlash'} <span>✓</span></button></div>
        </section>
        <form className="admin-card password-card" onSubmit={changePassword}>
          <h2>Admin parolini almashtirish</h2><p>Yangi parol kamida 12 ta belgidan iborat bo‘lsin.</p>
          <div className="password-fields"><label className="admin-label">Joriy parol<input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></label>
            <label className="admin-label">Yangi parol<input type="password" minLength={12} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></label>
            <button className="btn" disabled={busy}>Parolni yangilash</button></div>
        </form>
      </div>
    </main>
  );
}
