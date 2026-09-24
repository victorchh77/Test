import { AbsoluteFill, Sequence } from 'remotion'
import { FadingText } from './Cierre'

// Créditos finales del corto, a 30 fps, en silencio.
// Estructura: tema y grupo (5 s) → reparto (5 pantallas de 6 s) → equipo técnico (9 s)
// → mensaje final (5 s) → 2 s de negro absoluto.

type Credito = { rol?: string; nombre: string }
type Pantalla = { titulo?: string; creditos: Credito[]; duracion: number }

const APERTURA = {
  titulo: 'LA ÚLTIMA CARTA',
  tema: 'Normalización de la ludopatía en adolescentes',
  grupo: 'GRUPO 17',
  duracion: 150,
}

const REPARTO: Pantalla[] = [
  {
    titulo: 'REPARTO',
    duracion: 180,
    creditos: [
      { rol: 'Mateo', nombre: 'Mahdi Bhejei' },
      { rol: 'Bruno', nombre: 'Bruno Martinez' },
      { rol: 'Lucas', nombre: 'Guillermo Centurion' },
      { rol: 'Valentina', nombre: 'Luana Davalos' },
    ],
  },
  {
    titulo: 'REPARTO',
    duracion: 180,
    creditos: [
      { rol: 'Sofía', nombre: 'Danna Delvalle' },
      { rol: 'Santiago', nombre: 'Fabri Balbuena' },
      { rol: 'Nicolás', nombre: 'Benjamin Ojeda' },
      { rol: 'Diego', nombre: 'Lucas Arevalos' },
    ],
  },
  {
    titulo: 'REPARTO',
    duracion: 180,
    creditos: [
      { rol: 'Profesora', nombre: 'Mayra Duarte' },
      { rol: 'Directora', nombre: 'Maia Garay' },
      { rol: 'Madre', nombre: 'Valentina Fretes' },
    ],
  },
  {
    titulo: 'REPARTO',
    duracion: 180,
    creditos: [
      { rol: 'Padre', nombre: 'Jeremías Chamorro' },
      { rol: 'Compañero 1', nombre: 'Juan Dilan' },
      { rol: 'Compañero 2', nombre: 'Alejandro Arevalos' },
    ],
  },
  {
    titulo: 'EXTRAS',
    duracion: 180,
    creditos: [{ nombre: 'Dante Elian' }, { nombre: 'Maximiliano Fabrizio Fretes' }, { nombre: 'Bautista Chavez' }],
  },
]

const EQUIPO: Pantalla = {
  duracion: 270,
  creditos: [
    { rol: 'Guion', nombre: 'Cristina Cano' },
    { rol: 'Edición', nombre: 'Victor Chavez' },
    { rol: 'Producción', nombre: 'Guillermo Centurion' },
  ],
}

const MENSAJE_FINAL = { texto: 'GRACIAS POR VER', duracion: 150 }

const NEGRO_FINAL = 60

const FADE = 15
const GRIS = '#9A9A9A'

const PANTALLAS_DURACION =
  APERTURA.duracion +
  REPARTO.reduce((t, p) => t + p.duracion, 0) +
  EQUIPO.duracion +
  MENSAJE_FINAL.duracion

export const CREDITOS_DURATION = PANTALLAS_DURACION + NEGRO_FINAL

const PantallaCreditos: React.FC<{ pantalla: Pantalla }> = ({ pantalla }) => (
  <FadingText duration={pantalla.duracion} fade={FADE}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64 }}>
      {pantalla.titulo && (
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 12, color: GRIS, marginBottom: 8 }}>
          {pantalla.titulo}
        </div>
      )}
      {pantalla.creditos.map((c) => (
        <div key={c.nombre} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {c.rol && (
            <div style={{ fontSize: 30, letterSpacing: 6, color: GRIS, textTransform: 'uppercase' }}>{c.rol}</div>
          )}
          <div style={{ fontSize: 58, fontWeight: 400 }}>{c.nombre}</div>
        </div>
      ))}
    </div>
  </FadingText>
)

export const Creditos: React.FC = () => {
  let desde = 0
  const siguiente = (duracion: number) => {
    const from = desde
    desde += duracion
    return from
  }

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={siguiente(APERTURA.duracion)} durationInFrames={APERTURA.duracion}>
        <FadingText duration={APERTURA.duracion} fade={FADE}>
          <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: 10, whiteSpace: 'nowrap' }}>
            {APERTURA.titulo}
          </div>
          <div style={{ fontSize: 38, color: GRIS, marginTop: 36, fontStyle: 'italic', lineHeight: 1.35 }}>
            {APERTURA.tema}
          </div>
          <div style={{ fontSize: 32, color: GRIS, marginTop: 56, letterSpacing: 10, fontWeight: 600 }}>
            {APERTURA.grupo}
          </div>
        </FadingText>
      </Sequence>

      {REPARTO.map((p, i) => (
        <Sequence key={i} from={siguiente(p.duracion)} durationInFrames={p.duracion}>
          <PantallaCreditos pantalla={p} />
        </Sequence>
      ))}

      <Sequence from={siguiente(EQUIPO.duracion)} durationInFrames={EQUIPO.duracion}>
        <PantallaCreditos pantalla={EQUIPO} />
      </Sequence>

      <Sequence from={siguiente(MENSAJE_FINAL.duracion)} durationInFrames={MENSAJE_FINAL.duracion}>
        <FadingText
          duration={MENSAJE_FINAL.duracion}
          fade={FADE * 2}
          style={{ fontSize: 64, fontWeight: 600, letterSpacing: 8 }}
        >
          {MENSAJE_FINAL.texto}
        </FadingText>
      </Sequence>
    </AbsoluteFill>
  )
}
