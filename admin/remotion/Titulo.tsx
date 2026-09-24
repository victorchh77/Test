import { AbsoluteFill, Sequence } from 'remotion'
import { FadingText } from './Cierre'

// Placa de título del corto: 6 s a 30 fps, en silencio.
// 0,5 s de negro, fundido de entrada de 1 s, título fijo, fundido de salida de 1 s y 0,5 s de negro.
export const TITULO_DURATION = 180

export const Titulo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={15} durationInFrames={150}>
        <FadingText
          duration={150}
          fade={30}
          style={{ fontSize: 76, fontWeight: 600, letterSpacing: 10, whiteSpace: 'nowrap', padding: 0 }}
        >
          LA ÚLTIMA CARTA
        </FadingText>
      </Sequence>
    </AbsoluteFill>
  )
}
