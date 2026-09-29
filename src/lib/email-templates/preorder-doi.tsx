import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  product?: string
  paymentMode?: string
  price?: string
  confirmUrl?: string
  expiresHours?: number
  marketingRequested?: boolean
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#323232' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const heading = { fontSize: '22px', margin: '0 0 8px', color: '#323232' }
const paragraph = { fontSize: '15px', lineHeight: '24px', color: '#323232' }
const panel = { backgroundColor: '#F3F2EE', borderRadius: '10px', padding: '18px 20px' }
const label = { fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#6b6b6b', margin: '0 0 2px' }
const value = { fontSize: '15px', margin: '0 0 12px', color: '#323232' }
const button = { backgroundColor: '#323232', color: '#ffffff', borderRadius: '999px', padding: '14px 26px', fontSize: '15px', textDecoration: 'none' }

const Row = ({ title, content }: { title: string; content?: string }) =>
  content ? (<><Text style={label}>{title}</Text><Text style={value}>{content}</Text></>) : null

const Email = ({ name, product, paymentMode, price, confirmUrl, expiresHours = 72, marketingRequested }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Bitte bestätigen Sie Ihre E-Mail-Adresse für Ihre Lavidro-Anfrage</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Bitte bestätigen Sie Ihre E-Mail-Adresse</Heading>
        <Text style={paragraph}>
          {name ? `Hallo ${name},` : 'Hallo,'} danke für Ihre unverbindliche Anfrage. Ihre Anfrage ist bereits
          bei uns gespeichert. Bitte bestätigen Sie kurz, dass diese E-Mail-Adresse Ihnen gehört.
        </Text>
        {confirmUrl ? (
          <Section style={{ margin: '24px 0' }}>
            <Button href={confirmUrl} style={button}>E-Mail-Adresse bestätigen</Button>
          </Section>
        ) : null}
        <Text style={{ ...paragraph, fontSize: '13px', color: '#6b6b6b' }}>
          Der Link ist {expiresHours} Stunden gültig und kann nur einmal verwendet werden. Auf der
          geöffneten Seite bestätigen Sie mit einem Klick auf den Button.
          {marketingRequested ? ' Ihre Einwilligung in Informationen per E-Mail wird erst mit dieser Bestätigung wirksam.' : ''}
        </Text>
        <Section style={panel}>
          <Row title="Lösung" content={product} />
          <Row title="Zahlungsart" content={paymentMode} />
          <Row title="Preisindikation" content={price} />
        </Section>
        <Hr style={{ borderColor: '#EAE4D5', margin: '24px 0' }} />
        <Text style={paragraph}>
          Die Anfrage ist unverbindlich. Es entstehen keine Kosten und kein Kaufvertrag. Wenn Sie
          keine Anfrage gestellt haben, können Sie diese E-Mail ignorieren.
        </Text>
        <Text style={{ ...paragraph, color: '#6b6b6b' }}>Ihr Lavidro Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Bitte bestätigen Sie Ihre Lavidro-Anfrage',
  displayName: 'Anfrage: E-Mail bestätigen',
  previewData: {
    name: 'Max Muster',
    product: 'Lavidro Cabinet',
    paymentMode: 'Einmalzahlung',
    price: '20.449 €, inkl. 19 % MwSt. und Versand',
    confirmUrl: 'https://lavidro.com/anfrage-bestaetigen#token=beispiel',
    expiresHours: 72,
    marketingRequested: true,
  },
} satisfies TemplateEntry
