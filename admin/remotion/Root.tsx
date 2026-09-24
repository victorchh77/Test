import { Composition } from 'remotion'
import { WhatsAppChat, WHATSAPP_CHAT_DURATION } from './WhatsAppChat'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WhatsAppBrunoMateo"
      component={WhatsAppChat}
      durationInFrames={WHATSAPP_CHAT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  )
}
