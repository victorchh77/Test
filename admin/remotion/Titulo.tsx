import { AbsoluteFill, Sequence } from 'remotion'
import { FadingText } from './Cierre'

// Placa de título del corto: 15 s a 30 fps, en silencio.
// 1 s de negro, fundido de entrada de 2 s, título fijo, fundido de salida de 2 s y 1 s de negro.
export const TITULO_DURATION = 450

export const Titulo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={30} durationInFrames={390}>
        <FadingText
          duration={390}
          fade={60}
          style={{ fontSize: 76, fontWeight: 600, letterSpacing: 10, whiteSpace: 'nowrap', padding: 0 }}
        >
          LA ÚLTIMA CARTA
        </FadingText>
      </Sequence>
    </AbsoluteFill>
  )
}
