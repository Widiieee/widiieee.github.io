import { useState, useEffect, useRef } from 'react'
import './App.css'

// ─── Aurora Background ───────────────────────────────────────────────────────
function Aurora() {
  return (
    <div className="aurora-wrap" aria-hidden="true">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <div className="aurora a4" />
      <div className="noise" />
    </div>
  )
}

// ─── Floating Particles ───────────────────────────────────────────────────────
// Dibuat sekali di module level - deterministik, tidak pakai Math.random di render
const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 5 + ((i * 4.7 + 13) % 90),
  y: 5 + ((i * 7.3 + 7) % 90),
  size: 1.5 + (i % 3),
  delay: (i * 0.41) % 8,
  duration: 8 + (i * 0.63) % 6,
}))

function Particles() {
  const particles = PARTICLE_DATA
  return (
    <div className="particles" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = to / 40
        const timer = setInterval(() => {
          start += step
          if (start >= to) { setCount(to); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 30)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [to])
  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Skill Bar ────────────────────────────────────────────────────────────────
function SkillBar({ name, pct }) {
  const [width, setWidth] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setWidth(pct); observer.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [pct])
  return (
    <div className="skill-row" ref={ref}>
      <div className="skill-meta">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

// ─── Section Reveal ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = ['Beranda','Tentang','Keahlian','Pengalaman','Portfolio','Pendidikan','Kontak']
  const hrefs = ['#home','#about','#skills','#experience','#portfolio','#education','#contact']
  const handleClick = (href) => {
    setOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="nav-inner">
        <a className="nav-brand" href="#home" onClick={e => { e.preventDefault(); handleClick('#home') }}>
          <span className="brand-dot" />
          <span>Widiieee</span>
        </a>
        <button className={`nav-burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="menu">
          <span /><span /><span />
        </button>
        <ul className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          {links.map((l, i) => (
            <li key={l}>
              <a href={hrefs[i]} onClick={e => { e.preventDefault(); handleClick(hrefs[i]) }}>{l}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

// Helper pure function - aman dipanggil di useState initializer
function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'Selamat Pagi'
  if (h >= 11 && h < 15) return 'Selamat Siang'
  if (h >= 15 && h < 20) return 'Selamat Sore'
  return 'Selamat Malam'
}

// Di luar komponen - referensi stabil, tidak trigger exhaustive-deps warning
const TYPING_ROLES = ['Web Developer', 'UI/UX Enthusiast', 'Creative Designer', 'PPLG Student', 'Tech Explorer', 'Problem Solver', 'Team Player', 'Lifelong Learner', 'Passionate Coder', 'Innovative Thinker']

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  // useState dengan initializer function - dihitung sekali, tidak butuh useEffect
  const [greeting] = useState(getGreeting)

  const [typed, setTyped] = useState('')
  const roleRef = useRef(0)
  const charRef = useRef(0)
  const delRef = useRef(false)
  useEffect(() => {
    const tick = () => {
      const word = TYPING_ROLES[roleRef.current]
      if (!delRef.current) {
        charRef.current++
        setTyped(word.slice(0, charRef.current))
        if (charRef.current === word.length) { delRef.current = true; setTimeout(tick, 1800); return }
      } else {
        charRef.current--
        setTyped(word.slice(0, charRef.current))
        if (charRef.current === 0) {
          delRef.current = false
          roleRef.current = (roleRef.current + 1) % TYPING_ROLES.length
        }
      }
      setTimeout(tick, delRef.current ? 60 : 100)
    }
    const t = setTimeout(tick, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="home" className="hero">
      <Aurora />
      <Particles />
      <div className="hero-inner container">
        <div className="hero-text">
          <Reveal>
            <p className="hero-greeting">{greeting}! 👋</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title">
              Saya <span className="gradient-text">Widi</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-role">
              <span className="typed">{typed}</span>
              <span className="cursor">|</span>
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="hero-desc">
              Siswa SMKN 1 Bawang jurusan PPLG yang antusias di pengembangan web
              dan desain UI/UX. Senang mengeksplorasi ide kreatif dan kolaboratif.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="hero-cta">
              <a href="#portfolio" className="btn-primary" onClick={e => { e.preventDefault(); document.querySelector('#portfolio').scrollIntoView({ behavior:'smooth' }) }}>
                <span>Lihat Portfolio</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#contact" className="btn-ghost" onClick={e => { e.preventDefault(); document.querySelector('#contact').scrollIntoView({ behavior:'smooth' }) }}>
                Hubungi Saya
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="hero-avatar-wrap">
          <div className="hero-avatar">
            <div className="avatar-ring ring1" />
            <div className="avatar-ring ring2" />
            <img
              src="/assets/images/saya.JPG"
              alt="Widiatri Nur Zahra"
              onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Widi&size=400&background=22c55e&color=fff&bold=true' }}
            />
            <div className="avatar-badge">PPLG</div>
          </div>
        </Reveal>
      </div>
      <a className="scroll-hint" href="#about" onClick={e => { e.preventDefault(); document.querySelector('#about').scrollIntoView({ behavior:'smooth' }) }} aria-label="scroll">
        <div className="scroll-dot" />
      </a>
    </section>
  )
}

// ─── About Section ────────────────────────────────────────────────────────────
function About() {
  const stats = [
    { label: 'Proyek Selesai', value: 3, suffix: '+' },
    { label: 'Keahlian Teknis', value: 4, suffix: '' },
    { label: 'Tahun Belajar', value: 2, suffix: '+' },
  ]
  const info = [
    { icon: '👤', label: 'Nama', value: 'Widiatri Nur Zahra' },
    { icon: '📧', label: 'Email', value: 'widiatrinurzahra.22@gmail.com' },
    { icon: '📱', label: 'Telepon', value: '+62 822-6447-8231' },
    { icon: '🎂', label: 'Usia', value: '18 Tahun' },
    { icon: '📍', label: 'Lokasi', value: 'Banjarnegara, Jawa Tengah' },
    { icon: '🌐', label: 'Website', value: 'widiieee.my.id' },
  ]
  return (
    <section id="about" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">01 / Tentang</span>
            <h2 className="section-title">Tentang <span className="gradient-text">Saya</span></h2>
          </div>
        </Reveal>
        <div className="about-grid">
          <Reveal className="about-img-col">
            <div className="about-img-wrap">
              <img
                src="/assets/images/about.jpg"
                alt="About Widi"
                onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=W&size=500&background=16a34a&color=fff&bold=true' }}
              />
              <div className="img-frame" />
              <div className="img-badge">
                <span>SMKN 1</span>
                <span>Bawang</span>
              </div>
            </div>
          </Reveal>
          <div className="about-content-col">
            <Reveal>
              <p className="about-lead">
                Web Developer & Designer dengan semangat belajar yang tinggi
              </p>
              <p className="about-body">
                Saya adalah siswa jurusan PPLG di SMKN 1 Bawang yang aktif mengembangkan
                diri melalui proyek nyata, organisasi, dan pengalaman kerja. Minat saya
                ada di pengembangan web, desain grafis, dan konten kreatif.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="info-grid">
                {info.map(item => (
                  <div key={item.label} className="info-card">
                    <span className="info-icon">{item.icon}</span>
                    <div>
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="stats-row">
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <strong><Counter to={s.value} suffix={s.suffix} /></strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="about-actions">
                <a href="/assets/files/CV-Widiieee.pdf" className="btn-primary" target="_blank" rel="noopener">
                  <span>Download CV</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Skills Section ───────────────────────────────────────────────────────────
function Skills() {
  const technical = [
    { name: 'Microsoft Office', pct: 85 },
    { name: 'Graphic Design', pct: 78 },
    { name: 'Web Development', pct: 10 },
    { name: 'English', pct: 15 },
  ]
  const soft = [
    { name: 'Team Work', pct: 90 },
    { name: 'Responsible', pct: 95 },
    { name: 'Communication', pct: 90 },
  ]
  const tools = ['Figma','Canva','Adobe Illustrator','VS Code','Git','PHP','HTML / CSS','JavaScript','MySQL','Bootstrap','Laragon']
  return (
    <section id="skills" className="section section--alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">02 / Keahlian</span>
            <h2 className="section-title">Keahlian <span className="gradient-text">Saya</span></h2>
          </div>
        </Reveal>
        <div className="skills-grid">
          <Reveal>
            <div className="glass-card">
              <h3 className="card-title">
                <span className="card-icon">⚡</span> Teknis
              </h3>
              {technical.map(s => <SkillBar key={s.name} {...s} />)}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="glass-card">
              <h3 className="card-title">
                <span className="card-icon">💡</span> Non-Teknis
              </h3>
              {soft.map(s => <SkillBar key={s.name} {...s} />)}
            </div>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <div className="tools-wrap">
            <p className="tools-title">Tools & Teknologi</p>
            <div className="tools-chips">
              {tools.map(t => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Experience Section ───────────────────────────────────────────────────────
function Experience() {
  const items = [
    {
      year: '2024 – 2025',
      role: 'Sekretaris',
      org: 'PSPG — Perhimpunan Siswa PPLG',
      desc: 'Mengelola administrasi dan dokumentasi kegiatan organisasi, koordinasi antar anggota, serta mendukung kelancaran program kerja PSPG.',
      tags: ['Administrasi', 'Koordinasi', 'Dokumentasi', 'Leadership'],
    },
    {
      year: '2025',
      role: 'Live Sales & Desain Konten',
      org: 'Shopkey',
      desc: 'Menjalankan live sales di platform e-commerce dan membuat konten desain visual untuk promosi produk, meningkatkan engagement dan penjualan.',
      tags: ['Live Streaming', 'Graphic Design', 'Content Creation', 'Marketing'],
    },
  ]
  return (
    <section id="experience" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">03 / Pengalaman</span>
            <h2 className="section-title">Pengalaman <span className="gradient-text">Kerja</span></h2>
          </div>
        </Reveal>
        <div className="timeline">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="timeline-item">
                <div className="tl-line">
                  <div className="tl-dot" />
                </div>
                <div className="tl-card glass-card">
                  <span className="tl-year">{item.year}</span>
                  <h3 className="tl-role">{item.role}</h3>
                  <p className="tl-org">{item.org}</p>
                  <p className="tl-desc">{item.desc}</p>
                  <div className="chip-row">
                    {item.tags.map(t => <span key={t} className="chip chip--sm">{t}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Portfolio Section ────────────────────────────────────────────────────────
function Portfolio() {
  const items = [
    {
      title: 'Website POS',
      cat: 'Web Application',
      desc: 'Aplikasi Point of Sale berbasis web untuk pengelolaan transaksi penjualan, stok barang, dan laporan keuangan.',
      tags: ['PHP', 'MySQL', 'Bootstrap'],
      img: '/assets/images/portfolio/pos.png',
      demo: '#',
    },
  ]
  return (
    <section id="portfolio" className="section section--alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">04 / Portfolio</span>
            <h2 className="section-title">Karya <span className="gradient-text">Saya</span></h2>
          </div>
        </Reveal>
        <div className="portfolio-grid">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="port-card glass-card">
                <div className="port-img">
                  <img
                    src={item.img}
                    alt={item.title}
                    onError={e => { e.target.src = `https://placehold.co/600x360/0f172a/22c55e?text=${encodeURIComponent(item.title)}` }}
                  />
                  <div className="port-overlay">
                    {item.demo && item.demo !== '#' && (
                      <a href={item.demo} target="_blank" rel="noopener" className="port-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className="port-body">
                  <span className="port-cat">{item.cat}</span>
                  <h3 className="port-title">{item.title}</h3>
                  <p className="port-desc">{item.desc}</p>
                  <div className="chip-row">
                    {item.tags.map(t => <span key={t} className="chip chip--sm">{t}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Education Section ────────────────────────────────────────────────────────
function Education() {
  const items = [
    {
      period: '2023 – Sekarang',
      title: 'SMK Jurusan PPLG',
      school: 'SMKN 1 Bawang',
      desc: 'Menempuh pendidikan di jurusan Pengembangan Perangkat Lunak dan Gim. Aktif di organisasi dan praktik kerja lapangan.',
      tags: ['Aktif Organisasi', 'PKL'],
      icon: '🎓',
    },
    {
      period: '2020 – 2023',
      title: 'Sekolah Menengah Pertama',
      school: 'SMP N 2 Bawang',
      desc: 'Menyelesaikan pendidikan menengah pertama dengan aktif dalam berbagai kegiatan akademis dan non-akademis.',
      tags: [],
      icon: '📚',
    },
  ]
  return (
    <section id="education" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">05 / Pendidikan</span>
            <h2 className="section-title">Riwayat <span className="gradient-text">Pendidikan</span></h2>
          </div>
        </Reveal>
        <div className="edu-grid">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="edu-card glass-card">
                <div className="edu-icon">{item.icon}</div>
                <div>
                  <span className="tl-year">{item.period}</span>
                  <h3 className="tl-role">{item.title}</h3>
                  <p className="tl-org">{item.school}</p>
                  <p className="tl-desc">{item.desc}</p>
                  {item.tags.length > 0 && (
                    <div className="chip-row">
                      {item.tags.map(t => <span key={t} className="chip chip--accent chip--sm">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function Contact() {
  const items = [
    { icon: '📧', label: 'Email', value: 'widiatrinurzahra.22@gmail.com', href: 'mailto:widiatrinurzahra.22@gmail.com' },
    { icon: '💬', label: 'WhatsApp', value: '+62 822-6447-8231', href: 'https://wa.me/6282264478231' },
    { icon: '📍', label: 'Lokasi', value: 'Banjarnegara, Jawa Tengah', href: null },
    { icon: '🌐', label: 'Website', value: 'widiieee.my.id', href: 'https://widiieee.my.id' },
  ]
  return (
    <section id="contact" className="section section--alt">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-tag">06 / Kontak</span>
            <h2 className="section-title">Hubungi <span className="gradient-text">Saya</span></h2>
            <p className="section-sub">Jangan ragu untuk menghubungi saya kapan saja!</p>
          </div>
        </Reveal>
        <div className="contact-grid">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="contact-card glass-card">
                <span className="contact-icon">{item.icon}</span>
                <div>
                  <span className="info-label">{item.label}</span>
                  {item.href
                    ? <a className="contact-val" href={item.href} target="_blank" rel="noopener">{item.value}</a>
                    : <span className="contact-val">{item.value}</span>
                  }
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const socials = [
    { icon: 'GH', href: 'https://github.com/widiieee', label: 'GitHub' },
    { icon: 'LI', href: 'https://linkedin.com/in/widiatrinurzahra', label: 'LinkedIn' },
    { icon: 'IG', href: 'https://instagram.com/zahraalowvaa', label: 'Instagram' },
  ]
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <p className="footer-copy">© 2025 Widiieee · Widiatri Nur Zahra</p>
        <div className="footer-socials">
          {socials.map(s => (
            <a key={s.label} href={s.href} className="social-pill" target="_blank" rel="noopener" aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Back to Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button
      className={`back-top ${show ? 'back-top--show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kembali ke atas"
    >
      ↑
    </button>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Portfolio />
        <Education />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}