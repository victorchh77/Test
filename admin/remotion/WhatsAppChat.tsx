import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

// Línea de tiempo (frames a 30 fps)
const T = {
  brunoTypingStart: 30,
  brunoMessage: 95,
  lockStart: 190,
  lockEnd: 300,
  mateoTypingStart: 330,
  mateoSend: 385,
  delivered: 410,
  read: 440,
  end: 540,
}

export const WHATSAPP_CHAT_DURATION = T.end

const BRUNO_TEXT = 'Hoy en la plaza. Una última partida. Mi reloj contra tu plata.'
const MATEO_TEXT = 'Voy.'

const C = {
  bg: '#0B141A',
  header: '#1F2C34',
  incoming: '#202C33',
  outgoing: '#005C4B',
  text: '#E9EDEF',
  meta: '#8696A0',
  green: '#00A884',
  blue: '#53BDEB',
  input: '#2A3942',
}

const FONT = '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif'

const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div
    style={{
      height: 80,
      padding: '0 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: C.text,
      fontSize: 34,
      fontWeight: 600,
    }}
  >
    <span>{time}</span>
    <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <svg width="40" height="28" viewBox="0 0 20 14">
        <rect x="0" y="10" width="3" height="4" fill={C.text} />
        <rect x="5" y="7" width="3" height="7" fill={C.text} />
        <rect x="10" y="4" width="3" height="10" fill={C.text} />
        <rect x="15" y="0" width="3" height="14" fill={C.text} />
      </svg>
      <svg width="56" height="28" viewBox="0 0 28 14">
        <rect x="0.5" y="0.5" width="24" height="13" rx="3" fill="none" stroke={C.text} />
        <rect x="2.5" y="2.5" width="14" height="9" rx="1.5" fill={C.text} />
        <rect x="25.5" y="4.5" width="2" height="5" rx="1" fill={C.text} />
      </svg>
    </span>
  </div>
)

const Header: React.FC<{ subtitle: string }> = ({ subtitle }) => (
  <div
    style={{
      background: C.header,
      height: 150,
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 22,
      color: C.text,
    }}
  >
    <svg width="44" height="44" viewBox="0 0 24 24">
      <path d="M15 5l-7 7 7 7" stroke={C.text} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        background: '#6B7C85',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 46,
        fontWeight: 700,
        color: '#DFE5E7',
      }}
    >
      B
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 44, fontWeight: 600 }}>Bruno</div>
      <div style={{ fontSize: 30, color: subtitle === 'escribiendo…' ? C.green : C.meta }}>
        {subtitle}
      </div>
    </div>
    <svg width="48" height="48" viewBox="0 0 24 24" fill={C.text}>
      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
    <svg width="44" height="44" viewBox="0 0 24 24" fill={C.text} style={{ marginLeft: 24 }}>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
    </svg>
  </div>
)

const Ticks: React.FC<{ state: 'sent' | 'delivered' | 'read' }> = ({ state }) => {
  const color = state === 'read' ? C.blue : C.meta
  return (
    <svg width="38" height="24" viewBox="0 0 19 12">
      <path d="M1 6.5l3 3L11 2" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {state !== 'sent' && (
        <path d="M6.5 8.5l1 1L16 2" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}

const Bubble: React.FC<{
  text: string
  time: string
  outgoing?: boolean
  appear: number
  ticks?: 'sent' | 'delivered' | 'read'
}> = ({ text, time, outgoing, appear, ticks }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: outgoing ? 'flex-end' : 'flex-start',
      transform: `scale(${interpolate(appear, [0, 1], [0.85, 1])}) translateY(${interpolate(appear, [0, 1], [30, 0])}px)`,
      transformOrigin: outgoing ? 'bottom right' : 'bottom left',
      opacity: appear,
    }}
  >
    <div
      style={{
        maxWidth: 800,
        background: outgoing ? C.outgoing : C.incoming,
        color: C.text,
        borderRadius: 24,
        borderTopLeftRadius: outgoing ? 24 : 0,
        borderTopRightRadius: outgoing ? 0 : 24,
        padding: '20px 28px 14px',
        fontSize: 44,
        lineHeight: 1.35,
        boxShadow: '0 2px 2px rgba(0,0,0,0.25)',
      }}
    >
      {text}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
          fontSize: 26,
          color: outgoing ? '#A8C7C0' : C.meta,
        }}
      >
        {time}
        {ticks && <Ticks state={ticks} />}
      </div>
    </div>
  </div>
)

const TypingBubble: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => (
  <div style={{ display: 'flex', opacity }}>
    <div
      style={{
        background: C.incoming,
        borderRadius: 24,
        borderTopLeftRadius: 0,
        padding: '30px 34px',
        display: 'flex',
        gap: 12,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: C.meta,
            opacity: 0.4 + 0.6 * Math.max(0, Math.sin((frame - i * 5) / 5)),
          }}
        />
      ))}
    </div>
  </div>
)

const InputBar: React.FC<{ text: string; caret: boolean }> = ({ text, caret }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 20px 48px' }}>
    <div
      style={{
        flex: 1,
        height: 104,
        borderRadius: 52,
        background: C.input,
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        fontSize: 42,
        color: text ? C.text : C.meta,
      }}
    >
      {text || 'Mensaje'}
      {caret && <span style={{ width: 3, height: 50, background: C.green, marginLeft: 4 }} />}
    </div>
    <div
      style={{
        width: 104,
        height: 104,
        borderRadius: 52,
        background: C.green,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {text ? (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff">
          <path d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" />
        </svg>
      ) : (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1a7 7 0 0 0 6-6.9z" />
        </svg>
      )}
    </div>
  </div>
)

const LockScreen: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(circle at 50% 30%, #1a2530 0%, #05080a 70%)',
      opacity,
      color: '#fff',
      alignItems: 'center',
      paddingTop: 260,
    }}
  >
    <svg width="44" height="54" viewBox="0 0 22 27" style={{ marginBottom: 30 }}>
      <rect x="1" y="11" width="20" height="15" rx="3" fill="#fff" />
      <path d="M5 11V7a6 6 0 0 1 12 0v4" stroke="#fff" strokeWidth="2.5" fill="none" />
    </svg>
    <div style={{ fontSize: 44, opacity: 0.85 }}>lunes, 14 de septiembre</div>
    <div style={{ fontSize: 220, fontWeight: 300, lineHeight: 1.05 }}>19:42</div>
    <div
      style={{
        marginTop: 120,
        width: 940,
        background: 'rgba(255,255,255,0.14)',
        borderRadius: 40,
        padding: '30px 36px',
        display: 'flex',
        gap: 26,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 18,
          background: '#25D366',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34 }}>
          <b>Bruno</b>
          <span style={{ opacity: 0.7, fontSize: 30 }}>ahora</span>
        </div>
        <div style={{ fontSize: 36, opacity: 0.9, marginTop: 6, lineHeight: 1.3 }}>{BRUNO_TEXT}</div>
      </div>
    </div>
  </AbsoluteFill>
)

export const WhatsAppChat: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const brunoTyping = frame >= T.brunoTypingStart && frame < T.brunoMessage
  const brunoAppear = spring({ frame: frame - T.brunoMessage, fps, config: { damping: 14 } })

  const typedChars = Math.max(
    0,
    Math.min(MATEO_TEXT.length, Math.floor((frame - T.mateoTypingStart) / 10) + 1),
  )
  const inputText = frame >= T.mateoTypingStart && frame < T.mateoSend ? MATEO_TEXT.slice(0, typedChars) : ''
  const mateoAppear = spring({ frame: frame - T.mateoSend, fps, config: { damping: 14 } })
  const ticks = frame >= T.read ? 'read' : frame >= T.delivered ? 'delivered' : 'sent'

  const lockOpacity = interpolate(
    frame,
    [T.lockStart, T.lockStart + 12, T.lockEnd - 12, T.lockEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const endFade = interpolate(frame, [T.end - 30, T.end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const subtitle = brunoTyping ? 'escribiendo…' : 'en línea'

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <div style={{ background: C.header }}>
        <StatusBar time={frame >= T.lockEnd ? '19:44' : '19:42'} />
      </div>
      <Header subtitle={subtitle} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 18,
          padding: '0 28px 10px',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 2px, transparent 2px)',
          backgroundSize: '44px 44px',
        }}
      >
        <div style={{ alignSelf: 'center', marginBottom: 'auto', marginTop: 30 }}>
          <div
            style={{
              background: C.header,
              color: C.meta,
              fontSize: 28,
              padding: '10px 24px',
              borderRadius: 16,
            }}
          >
            HOY
          </div>
        </div>
        {frame >= T.brunoMessage && <Bubble text={BRUNO_TEXT} time="19:42" appear={brunoAppear} />}
        {brunoTyping && (
          <TypingBubble
            frame={frame}
            opacity={interpolate(frame, [T.brunoTypingStart, T.brunoTypingStart + 8], [0, 1], {
              extrapolateRight: 'clamp',
            })}
          />
        )}
        {frame >= T.mateoSend && (
          <Bubble text={MATEO_TEXT} time="19:44" outgoing appear={mateoAppear} ticks={ticks} />
        )}
      </div>

      <InputBar
        text={inputText}
        caret={frame >= T.mateoTypingStart - 10 && frame < T.mateoSend && Math.floor(frame / 15) % 2 === 0}
      />

      {lockOpacity > 0 && <LockScreen opacity={lockOpacity} />}
      <AbsoluteFill style={{ background: '#000', opacity: endFade }} />
    </AbsoluteFill>
  )
}
