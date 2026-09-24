import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion'

// Cierre (7:10–7:30 de la película): 20 s a 30 fps.
// 0–1,5 s negro (el fundido lento a negro del plano anterior termina acá),
// tres pantallas con voz en off, título sin voz y negro en silencio al final.
const SCREENS = [
  { from: 45, duration: 99, text: 'No siempre empieza pareciendo un problema.', voice: 'cierre-1.wav' },
  { from: 144, duration: 102, text: 'A veces empieza con una apuesta entre amigos.', voice: 'cierre-2.wav' },
  {
    from: 246,
    duration: 204,
    text: 'Si las apuestas te están controlando, hablá con un adulto de confianza y buscá ayuda profesional.',
    voice: 'cierre-3.wav',
  },
]
const TITLE = { from: 450, duration: 120 }

export const CIERRE_DURATION = 600

const FONT = '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif'

export const FadingText: React.FC<{
  duration: number
  fade: number
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ duration, fade, children, style }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, fade, duration - fade, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 100px',
        textAlign: 'center',
        color: '#fff',
        fontFamily: FONT,
        opacity,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

export const Cierre: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SCREENS.map((s) => (
        <Sequence key={s.voice} from={s.from} durationInFrames={s.duration}>
          <FadingText duration={s.duration} fade={12} style={{ fontSize: 64, fontWeight: 300, lineHeight: 1.35 }}>
            {s.text}
          </FadingText>
          <Sequence from={3}>
            <Audio src={staticFile(s.voice)} />
          </Sequence>
        </Sequence>
      ))}
      <Sequence from={TITLE.from} durationInFrames={TITLE.duration}>
        <FadingText
          duration={TITLE.duration}
          fade={24}
          style={{ fontSize: 76, fontWeight: 600, letterSpacing: 10, whiteSpace: 'nowrap', padding: 0 }}
        >
          LA ÚLTIMA CARTA
        </FadingText>
      </Sequence>
    </AbsoluteFill>
  )
}
