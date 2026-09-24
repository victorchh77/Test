import { Composition } from 'remotion'
import { Cierre, CIERRE_DURATION } from './Cierre'
import { Creditos, CREDITOS_DURATION } from './Creditos'
import { Rotulo, ROTULO_DURATION, ROTULOS } from './Rotulo'
import { Titulo, TITULO_DURATION } from './Titulo'
import { WhatsAppChat, WHATSAPP_CHAT_DURATION } from './WhatsAppChat'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WhatsAppBrunoMateo"
        component={WhatsAppChat}
        durationInFrames={WHATSAPP_CHAT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CierreUltimaCarta"
        component={Cierre}
        durationInFrames={CIERRE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TituloUltimaCarta"
        component={Titulo}
        durationInFrames={TITULO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CreditosUltimaCarta"
        component={Creditos}
        durationInFrames={CREDITOS_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      {ROTULOS.map((r) => (
        <Composition
          key={r.id}
          id={r.id}
          component={Rotulo}
          defaultProps={{ texto: r.texto }}
          durationInFrames={ROTULO_DURATION}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}
    </>
  )
}
