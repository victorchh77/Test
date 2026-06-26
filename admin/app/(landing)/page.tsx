'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function LandingPage() {
  useEffect(() => {
    const els: HTMLElement[] = []

    const add = (attrs: Record<string, string>) => {
      const el = document.createElement('link')
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      document.head.appendChild(el)
      els.push(el)
    }

    add({ rel: 'preconnect', href: 'https://fonts.googleapis.com' })
    add({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' })
    add({ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap' })
    add({ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' })
    add({ rel: 'stylesheet', href: '/landing-style.css' })

    document.body.style.cssText = 'background:#fff;color:#1A1A1A;font-family:Open Sans,sans-serif;'
    document.documentElement.style.fontSize = '16px'

    return () => {
      els.forEach(el => el.parentNode?.removeChild(el))
      document.body.style.cssText = ''
      document.documentElement.style.fontSize = ''
    }
  }, [])

  function handleCalcSim() {
    const price = parseFloat((document.getElementById('simPrice') as HTMLInputElement)?.value || '0')
    const down  = parseFloat((document.getElementById('simDown')  as HTMLInputElement)?.value || '0') || 0
    const quotas = parseInt((document.getElementById('simQuotas') as HTMLSelectElement)?.value || '24')
    const resultEl = document.getElementById('simResult')
    const outEl    = document.getElementById('simOut')
    if (!price || price < 1000) { alert('Ingresá un valor de vehículo válido.'); return }
    const principal = price * (1 - down / 100)
    const rate = 0.018
    const cuota = principal * (rate * Math.pow(1 + rate, quotas)) / (Math.pow(1 + rate, quotas) - 1)
    if (outEl) outEl.textContent = '$' + cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    if (resultEl) resultEl.style.display = 'block'
  }

  return (
    <>
      <Script src="/landing-main.js" strategy="afterInteractive" />

      {/* TOPBAR */}
      <div className="topbar">
        <div className="container">
          <div className="topbar__left">
            <span><i className="fas fa-map-marker-alt"></i> Carlos Antonio López casi Villarrica, Encarnación, Paraguay</span>
            <span><i className="fas fa-clock"></i> Lun–Vie: 8:00–18:00 | Sáb: 8:00–13:00</span>
          </div>
          <div className="topbar__right">
            <a href="tel:+595985000000"><i className="fas fa-phone"></i> +595 985 000 000</a>
            <a href="https://facebook.com" target="_blank" rel="noopener"><i className="fab fa-facebook-f"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener"><i className="fab fa-instagram"></i></a>
            <a href="https://wa.me/595985000000" target="_blank" rel="noopener"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="header" id="header">
        <div className="container">
          <a href="#" className="header__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="VH Group S.R.L." />
          </a>
          <button className="nav__burger" id="burger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
          <nav className="nav" id="nav">
            <ul className="nav__list">
              <li><a href="#inicio"         className="nav__link active">Inicio</a></li>
              <li><a href="#vehiculos"      className="nav__link">Vehículos</a></li>
              <li><a href="#servicios"      className="nav__link">Servicios</a></li>
              <li><a href="#financiamiento" className="nav__link">Financiamiento</a></li>
              <li><a href="#nosotros"       className="nav__link">Nosotros</a></li>
              <li><a href="#contacto"       className="nav__link">Contacto</a></li>
            </ul>
            <a href="https://wa.me/595985000000" className="btn btn--orange nav__cta" target="_blank" rel="noopener">
              <i className="fab fa-whatsapp"></i> Consultar ahora
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero__slider" id="heroSlider">
          <div className="hero__slide active" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&q=80')" }}>
            <div className="hero__overlay"></div>
            <div className="hero__content container">
              <span className="hero__badge">Nuevo Stock Disponible</span>
              <h1 className="hero__title">Encontrá el auto<br /><span>de tus sueños</span></h1>
              <p className="hero__sub">Las mejores marcas al mejor precio, con financiamiento a tu medida en Encarnación.</p>
              <div className="hero__actions">
                <a href="#vehiculos" className="btn btn--orange">Ver vehículos <i className="fas fa-arrow-right"></i></a>
                <a href="#contacto"  className="btn btn--outline">Solicitar cotización</a>
              </div>
            </div>
          </div>
          <div className="hero__slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80')" }}>
            <div className="hero__overlay"></div>
            <div className="hero__content container">
              <span className="hero__badge">Financiamiento Flexible</span>
              <h1 className="hero__title">Manejá tu sueño<br /><span>hoy mismo</span></h1>
              <p className="hero__sub">Cuotas accesibles, aprobación rápida y los mejores planes para que arranques ya.</p>
              <div className="hero__actions">
                <a href="#financiamiento" className="btn btn--orange">Ver planes <i className="fas fa-arrow-right"></i></a>
                <a href="#contacto"       className="btn btn--outline">Contactarnos</a>
              </div>
            </div>
          </div>
          <div className="hero__slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=80')" }}>
            <div className="hero__overlay"></div>
            <div className="hero__content container">
              <span className="hero__badge">Calidad Garantizada</span>
              <h1 className="hero__title">Confianza y<br /><span>experiencia</span></h1>
              <p className="hero__sub">Años de trayectoria en Encarnación, brindando calidad y honestidad en cada venta.</p>
              <div className="hero__actions">
                <a href="#nosotros"  className="btn btn--orange">Conocenos <i className="fas fa-arrow-right"></i></a>
                <a href="#vehiculos" className="btn btn--outline">Ver stock</a>
              </div>
            </div>
          </div>
        </div>
        <button className="hero__arrow hero__arrow--prev" id="heroPrev"><i className="fas fa-chevron-left"></i></button>
        <button className="hero__arrow hero__arrow--next" id="heroNext"><i className="fas fa-chevron-right"></i></button>
        <div className="hero__dots" id="heroDots"></div>
      </section>

      {/* SEARCH BAR */}
      <section className="search-bar">
        <div className="container">
          <form className="search-form" id="searchForm">
            <div className="search-form__group">
              <label>Marca</label>
              <select name="marca">
                <option value="">Todas las marcas</option>
                <option>Toyota</option><option>Chevrolet</option><option>Ford</option>
                <option>Honda</option><option>Hyundai</option><option>Kia</option>
                <option>Volkswagen</option><option>Nissan</option><option>Suzuki</option>
              </select>
            </div>
            <div className="search-form__group">
              <label>Modelo</label>
              <select name="modelo">
                <option value="">Todos los modelos</option>
                <option>Sedán</option><option>SUV / 4x4</option><option>Pick-up</option>
                <option>Hatchback</option><option>Van / Minivan</option>
              </select>
            </div>
            <div className="search-form__group">
              <label>Año</label>
              <select name="anio">
                <option value="">Cualquier año</option>
                <option>2025</option><option>2024</option><option>2023</option>
                <option>2022</option><option>2021</option><option>2020 o anterior</option>
              </select>
            </div>
            <div className="search-form__group">
              <label>Precio máx.</label>
              <select name="precio">
                <option value="">Sin límite</option>
                <option>Hasta $15.000</option><option>Hasta $25.000</option>
                <option>Hasta $40.000</option><option>Hasta $60.000</option>
                <option>Más de $60.000</option>
              </select>
            </div>
            <button type="submit" className="btn btn--orange">
              <i className="fas fa-search"></i> Buscar
            </button>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {[
              { icon: 'fa-car',       num: 250,  label: 'Vehículos disponibles' },
              { icon: 'fa-users',     num: 1500, label: 'Clientes satisfechos' },
              { icon: 'fa-star',      num: 10,   label: 'Años de experiencia' },
              { icon: 'fa-handshake', num: 15,   label: 'Marcas representadas' },
            ].map(({ icon, num, label }) => (
              <div key={label} className="stat-card">
                <i className={`fas ${icon}`}></i>
                <span className="stat-card__num" data-target={num}>0</span>+
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VEHICLES */}
      <section className="vehicles" id="vehiculos">
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">Nuestro Stock</span>
            <h2 className="section-header__title">Vehículos <span>Destacados</span></h2>
            <p className="section-header__sub">Encontrá el auto perfecto para vos. Stock actualizado con las mejores marcas del mercado.</p>
          </div>
          <div className="vehicles__tabs">
            {['all','suv','sedan','pickup','hatch'].map((f, i) => (
              <button key={f} className={`tab-btn${i === 0 ? ' active' : ''}`} data-filter={f}>
                {['Todos','SUV / 4x4','Sedán','Pick-up','Hatchback'][i]}
              </button>
            ))}
          </div>
          <div className="vehicles__grid" id="vehiclesGrid">
            {[
              { cat:'suv',    brand:'Toyota',   name:'RAV4 2024',    km:'0 km',      fuel:'Nafta',  trans:'Automático', badge:'new', price:'$42.500', img:'https://images.unsplash.com/photo-1551830820-42f00fc5c95a?w=600&q=80' },
              { cat:'pickup', brand:'Ford',     name:'Ranger 2024',  km:'0 km',      fuel:'Diesel', trans:'Manual',     badge:'new', price:'$38.900', img:'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&q=80' },
              { cat:'sedan',  brand:'Toyota',   name:'Corolla 2023', km:'18.000 km', fuel:'Nafta',  trans:'CVT',        badge:'used',price:'$28.000', img:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80' },
              { cat:'suv',    brand:'Hyundai',  name:'Tucson 2024',  km:'0 km',      fuel:'Nafta',  trans:'Automático', badge:'new', price:'$36.500', img:'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=600&q=80' },
              { cat:'hatch',  brand:'Honda',    name:'Fit 2022',     km:'32.000 km', fuel:'Nafta',  trans:'CVT',        badge:'used',price:'$19.900', img:'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80' },
              { cat:'pickup', brand:'Chevrolet',name:'S10 2023',     km:'25.000 km', fuel:'Diesel', trans:'Manual',     badge:'used',price:'$31.000', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
            ].map(({ cat, brand, name, km, fuel, trans, badge, price, img }) => (
              <article key={name} className="car-card" data-cat={cat}>
                <div className="car-card__img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={name} loading="lazy" />
                  <span className={`car-card__badge car-card__badge--${badge}`}>{badge === 'new' ? 'Nuevo' : 'Usado'}</span>
                  <button className="car-card__fav" aria-label="Guardar"><i className="far fa-heart"></i></button>
                </div>
                <div className="car-card__body">
                  <div className="car-card__brand">{brand}</div>
                  <h3 className="car-card__name">{name}</h3>
                  <div className="car-card__specs">
                    <span><i className="fas fa-tachometer-alt"></i> {km}</span>
                    <span><i className="fas fa-gas-pump"></i> {fuel}</span>
                    <span><i className="fas fa-cog"></i> {trans}</span>
                  </div>
                  <div className="car-card__footer">
                    <div className="car-card__price">
                      <small>Desde</small>
                      <strong>{price}</strong>
                    </div>
                    <a href="#contacto" className="btn btn--orange btn--sm">Ver más</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="vehicles__more">
            <a href="#contacto" className="btn btn--dark">Ver todo el stock <i className="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="servicios">
        <div className="container">
          <div className="section-header section-header--light">
            <span className="section-header__tag">Lo que ofrecemos</span>
            <h2 className="section-header__title">Nuestros <span>Servicios</span></h2>
            <p className="section-header__sub">Te acompañamos en cada paso para que tu experiencia de compra sea perfecta.</p>
          </div>
          <div className="services__grid">
            {[
              { icon: 'fa-car',           title: 'Venta de Autos Nuevos',      desc: 'Las últimas novedades del mercado con garantía de fábrica y los mejores precios de la región.' },
              { icon: 'fa-exchange-alt',  title: 'Autos Usados Verificados',   desc: 'Selección rigurosa de vehículos usados, revisados y con documentación en orden. Comprá con confianza.' },
              { icon: 'fa-dollar-sign',   title: 'Financiamiento a tu medida', desc: 'Planes flexibles, cuotas accesibles y aprobación rápida para que no pierdas tu oportunidad.' },
              { icon: 'fa-sync-alt',      title: 'Permuta / Take-back',        desc: 'Entregá tu auto usado como parte de pago. Valuación justa y transparente en el momento.' },
              { icon: 'fa-file-contract', title: 'Gestión de Documentos',      desc: 'Nos encargamos de todos los trámites de transferencia, patente y documentación para vos.' },
              { icon: 'fa-shield-alt',    title: 'Seguros Vehiculares',         desc: 'Asesoramiento y gestión de seguros para tu vehículo con las mejores aseguradoras del mercado.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="service-card">
                <div className="service-card__icon"><i className={`fas ${icon}`}></i></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCING */}
      <section className="financing" id="financiamiento">
        <div className="financing__bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80')" }}>
          <div className="financing__overlay"></div>
        </div>
        <div className="container financing__content">
          <div className="financing__text">
            <span className="section-header__tag">Financiamiento</span>
            <h2>¿Querés comprar tu auto<br /><span>en cuotas cómodas?</span></h2>
            <p>En VH Group tenemos planes de financiamiento diseñados para adaptarse a tu presupuesto. Con pocos requisitos y aprobación rápida, podés llevarte tu auto hoy mismo.</p>
            <ul className="financing__list">
              {['Financiamiento propio sin banco','Cuotas fijas en dólares o guaraníes','Hasta 48 cuotas disponibles','Mínimos requisitos documentales','Aprobación en el día'].map(item => (
                <li key={item}><i className="fas fa-check-circle"></i> {item}</li>
              ))}
            </ul>
            <a href="https://wa.me/595985000000?text=Hola!%20Me%20interesa%20saber%20sobre%20los%20planes%20de%20financiamiento." className="btn btn--orange" target="_blank" rel="noopener">
              <i className="fab fa-whatsapp"></i> Consultar mi plan
            </a>
          </div>
          <div className="financing__card">
            <h3>Simulador rápido</h3>
            <form className="sim-form" id="simForm">
              <div className="sim-form__group">
                <label>Valor del vehículo (USD)</label>
                <input type="number" id="simPrice" placeholder="Ej: 25000" min="5000" max="200000" />
              </div>
              <div className="sim-form__group">
                <label>Entrada inicial (%)</label>
                <input type="number" id="simDown" placeholder="Ej: 30" min="0" max="80" />
              </div>
              <div className="sim-form__group">
                <label>Cantidad de cuotas</label>
                <select id="simQuotas">
                  <option value="12">12 cuotas</option>
                  <option value="18">18 cuotas</option>
                  <option value="24" defaultValue="24">24 cuotas</option>
                  <option value="36">36 cuotas</option>
                  <option value="48">48 cuotas</option>
                </select>
              </div>
              <button type="button" className="btn btn--orange" onClick={handleCalcSim}>Calcular cuota</button>
              <div className="sim-result" id="simResult" style={{ display: 'none' }}>
                <p>Cuota estimada: <strong id="simOut">—</strong> / mes</p>
                <small>Valores orientativos. Consultá condiciones reales con nuestro equipo.</small>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="brands">
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">Marcas</span>
            <h2 className="section-header__title">Trabajamos con las mejores <span>marcas</span></h2>
          </div>
          <div className="brands__track">
            <div className="brands__inner" id="brandsInner">
              {[
                { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg',     alt: 'Toyota' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Ford-logo_color.svg',    alt: 'Ford' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chevrolet_logo.svg',     alt: 'Chevrolet' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_logo_white.svg',   alt: 'Honda' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hyundai_Motor_Company_logo.svg/1280px-Hyundai_Motor_Company_logo.svg.png', alt: 'Hyundai' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.svg',           alt: 'Kia' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg', alt: 'Volkswagen' },
                { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Nissan_2020_logo.svg/1280px-Nissan_2020_logo.svg.png', alt: 'Nissan' },
              ].flatMap((b, i, arr) => [b, { ...b, key: `dup-${i}` }]).map((b, i) => (
                <div key={i} className="brand-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.src} alt={b.alt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="nosotros">
        <div className="container about__grid">
          <div className="about__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1562141961-b3ae08a1b6ea?w=800&q=80" alt="Concesionaria VH Group Encarnación" loading="lazy" />
            <div className="about__exp-badge">
              <strong>+10</strong>
              <span>años de<br />trayectoria</span>
            </div>
          </div>
          <div className="about__text">
            <span className="section-header__tag">Quiénes somos</span>
            <h2 className="section-header__title">VH Group S.R.L.<br /><span>Tu concesionaria de confianza</span></h2>
            <p>Somos una empresa paraguaya con más de 10 años en el mercado automotor, ubicada en el corazón de Encarnación. Nuestro compromiso es brindarte la mejor experiencia de compra, con honestidad, transparencia y el respaldo que merecés.</p>
            <p>Contamos con un equipo de profesionales apasionados por los autos, listos para asesorarte y ayudarte a encontrar el vehículo ideal para tu vida y tu bolsillo.</p>
            <div className="about__values">
              {[
                { icon: 'fa-medal',     title: 'Calidad',    desc: 'Stock seleccionado y verificado' },
                { icon: 'fa-handshake', title: 'Confianza',  desc: 'Transparencia en cada operación' },
                { icon: 'fa-heart',     title: 'Compromiso', desc: 'Te acompañamos post-venta' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="about__value">
                  <i className={`fas ${icon}`}></i>
                  <div><strong>{title}</strong><p>{desc}</p></div>
                </div>
              ))}
            </div>
            <a href="#contacto" className="btn btn--orange">Contactarnos <i className="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">Opiniones</span>
            <h2 className="section-header__title">Lo que dicen nuestros <span>clientes</span></h2>
          </div>
          <div className="testimonials__grid">
            {[
              { stars: 5,   text: '"Excelente atención, me ayudaron a encontrar el auto perfecto para mi familia. Los trámites los hicieron ellos y fue rapidísimo."', initials: 'MR', name: 'Mario Rodríguez',  loc: 'Encarnación' },
              { stars: 5,   text: '"Compré mi Toyota RAV4 con ellos. El precio fue justo, el financiamiento muy accesible y el trato fue increíble. Muy recomendados!"', initials: 'LP', name: 'Laura Paredes',    loc: 'Cambyretá' },
              { stars: 4.5, text: '"Di mi auto en permuta y la valuación fue super transparente. Me dieron buen precio y me ayudaron con todo. Volveré a comprar acá."', initials: 'CS', name: 'Carlos Sánchez', loc: 'Capitán Miranda' },
            ].map(({ stars, text, initials, name, loc }) => (
              <div key={name} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {Array.from({ length: Math.floor(stars) }).map((_, i) => <i key={i} className="fas fa-star"></i>)}
                  {stars % 1 ? <i className="fas fa-star-half-alt"></i> : null}
                </div>
                <p>{text}</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{initials}</div>
                  <div><strong>{name}</strong><span>{loc}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contacto">
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">Contacto</span>
            <h2 className="section-header__title">Hablemos sobre<br /><span>tu próximo auto</span></h2>
            <p className="section-header__sub">Completá el formulario o escribinos por WhatsApp. Te respondemos a la brevedad.</p>
          </div>
          <div className="contact__grid">
            <div className="contact__form-wrap">
              <form className="contact-form" id="contactForm">
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label>Nombre completo *</label>
                    <input type="text" name="nombre" placeholder="Tu nombre" required />
                  </div>
                  <div className="contact-form__group">
                    <label>Teléfono *</label>
                    <input type="tel" name="telefono" placeholder="Ej: 0985 000 000" required />
                  </div>
                </div>
                <div className="contact-form__group">
                  <label>Correo electrónico</label>
                  <input type="email" name="email" placeholder="tucorreo@ejemplo.com" />
                </div>
                <div className="contact-form__group">
                  <label>¿En qué podemos ayudarte?</label>
                  <select name="interes">
                    <option>Me interesa un vehículo del stock</option>
                    <option>Quiero hacer una permuta</option>
                    <option>Consulta sobre financiamiento</option>
                    <option>Quiero vender mi auto</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="contact-form__group">
                  <label>Mensaje</label>
                  <textarea name="mensaje" rows={4} placeholder="Contanos qué estás buscando…"></textarea>
                </div>
                <button type="submit" className="btn btn--orange">
                  <i className="fas fa-paper-plane"></i> Enviar consulta
                </button>
              </form>
            </div>
            <div className="contact__info">
              {[
                { icon: 'fa-map-marker-alt', title: 'Dirección',          content: <p>Carlos Antonio López casi Villarrica<br />Encarnación, Itapúa – Paraguay</p> },
                { icon: 'fa-phone-alt',      title: 'Teléfono / WhatsApp', content: <p><a href="tel:+595985000000">+595 985 000 000</a></p> },
                { icon: 'fa-envelope',       title: 'Email',               content: <p><a href="mailto:info@vhgroup.com.py">info@vhgroup.com.py</a></p> },
                { icon: 'fa-clock',          title: 'Horario de atención', content: <p>Lunes a Viernes: 8:00 – 18:00 hs<br />Sábados: 8:00 – 13:00 hs</p> },
              ].map(({ icon, title, content }) => (
                <div key={title} className="contact-info-card">
                  <i className={`fas ${icon}`}></i>
                  <div><strong>{title}</strong>{content}</div>
                </div>
              ))}
              <a href="https://wa.me/595985000000?text=Hola!%20Estoy%20interesado%20en%20un%20veh%C3%ADculo%20de%20VH%20Group." className="btn btn--whatsapp" target="_blank" rel="noopener">
                <i className="fab fa-whatsapp"></i> Escribir por WhatsApp
              </a>
              <div className="contact__map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.9!2d-55.8661!3d-27.3306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDE5JzUwLjIiUyA1NcKwNTInMTUuOSJX!5e0!3m2!1ses!2spy!4v1234567890"
                  width="100%" height={220} style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación VH Group Encarnación"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__col footer__col--brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="VH Group S.R.L." className="footer__logo" />
              <p>Tu concesionaria de confianza en Encarnación. Más de 10 años conectando personas con el auto de sus sueños.</p>
              <div className="footer__social">
                <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="https://wa.me/595985000000"  target="_blank" rel="noopener" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                <a href="https://youtube.com"   target="_blank" rel="noopener" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
            <div className="footer__col">
              <h4>Navegación</h4>
              <ul>
                {['#inicio','#vehiculos','#servicios','#financiamiento','#nosotros','#contacto'].map((href, i) => (
                  <li key={href}><a href={href}>{['Inicio','Vehículos','Servicios','Financiamiento','Nosotros','Contacto'][i]}</a></li>
                ))}
              </ul>
            </div>
            <div className="footer__col">
              <h4>Categorías</h4>
              <ul>
                {['Autos Nuevos 0km','Autos Usados','SUV / 4x4','Pick-ups','Sedanes','Hatchback'].map(c => (
                  <li key={c}><a href="#vehiculos">{c}</a></li>
                ))}
              </ul>
            </div>
            <div className="footer__col">
              <h4>Contacto</h4>
              <ul className="footer__contact-list">
                <li><i className="fas fa-map-marker-alt"></i> C. A. López c/ Villarrica, Encarnación</li>
                <li><i className="fas fa-phone"></i> <a href="tel:+595985000000">+595 985 000 000</a></li>
                <li><i className="fas fa-envelope"></i> <a href="mailto:info@vhgroup.com.py">info@vhgroup.com.py</a></li>
                <li><i className="fas fa-clock"></i> Lun–Vie 8:00–18:00 | Sáb 8:00–13:00</li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2025 VH Group S.R.L. – Todos los derechos reservados. | Encarnación, Paraguay</p>
            <p>Desarrollado con ❤ para Encarnación</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/595985000000?text=Hola!%20Me%20interesa%20un%20veh%C3%ADculo%20de%20VH%20Group." className="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp">
        <i className="fab fa-whatsapp"></i>
        <span>¿Necesitás ayuda?</span>
      </a>

      {/* Back to top */}
      <button className="back-to-top" id="backToTop" aria-label="Volver arriba">
        <i className="fas fa-chevron-up"></i>
      </button>
    </>
  )
}
