import { AbsoluteFill, Sequence } from 'remotion'
import { FadingText } from './Cierre'

// Rótulos de tiempo/lugar entre escenas: 4 s a 30 fps, en silencio.
// Fundidos de entrada y salida de 0,6 s, con un respiro de negro en los bordes.
export const ROTULO_DURATION = 120

export const ROTULOS = [
  { id: 'Rotulo-DiasDespues', texto: 'DÍAS DESPUÉS' },
  { id: 'Rotulo-DespuesDeClases', texto: 'DESPUÉS DE CLASES' },
  { id: 'Rotulo-EsaNoche', texto: 'ESA NOCHE' },
  { id: 'Rotulo-SalidaDelColegio', texto: 'A LA SALIDA DEL COLEGIO' },
  { id: 'Rotulo-HorasDespues', texto: 'HORAS DESPUÉS' },
]

export const Rotulo: React.FC<{ texto: string }> = ({ texto }) => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={8} durationInFrames={104}>
        <FadingText
          duration={104}
          fade={18}
          style={{ fontSize: 64, fontWeight: 600, letterSpacing: 8, lineHeight: 1.4 }}
        >
          {texto}
        </FadingText>
      </Sequence>
    </AbsoluteFill>
  )
}
