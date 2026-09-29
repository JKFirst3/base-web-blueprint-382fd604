import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  product?: string
  tier?: string
  paymentMode?: string
  price?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif', color: '#323232' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const heading = { fontSize: '22px', margin: '0 0 8px', color: '#323232' }
const paragraph = { fontSize: '15px', lineHeight: '24px', color: '#323232' }
const panel = { backgroundColor: '#F3F2EE', borderRadius: '10px', padding: '18px 20px' }
const label = { fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#6b6b6b', margin: '0 0 2px' }
const value = { fontSize: '15px', margin: '0 0 12px', color: '#323232' }

const Row = ({ title, content }: { title: string; content?: string }) =>
  content ? (
    <>
      <Text style={label}>{title}</Text>
      <Text style={value}>{content}</Text>
    </>
  ) : null

const Email = ({ name, email, product, tier, paymentMode, price }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Anfrage bei Lavidro ist eingegangen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Deine Anfrage ist eingegangen</Heading>
        <Text style={paragraph}>
          {name ? `Hallo ${name},` : 'Hallo,'} danke für deine unverbindliche Anfrage. Wir melden uns zu den nächsten Schritten.
        </Text>

        <Section style={panel}>
          <Row title="Lösung" content={product} />
          <Row title="Ausstattung" content={tier} />
          <Row title="Zahlungsart" content={paymentMode} />
          <Row title="Preis" content={price} />
          <Row title="E-Mail" content={email} />
        </Section>

        <Hr style={{ borderColor: '#EAE4D5', margin: '24px 0' }} />
        <Text style={paragraph}>
          Diese Anfrage ist unverbindlich — es entstehen dir aktuell keine Kosten und kein
          Kaufvertrag. Die angezeigte Preisindikation enthält 19 % MwSt. und Versand, kann sich aber
          bis zu einem späteren verbindlichen Angebot noch ändern.
        </Text>
        <Text style={{ ...paragraph, color: '#6b6b6b' }}>Dein Lavidro Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Deine Anfrage bei Lavidro',
  displayName: 'Anfrage-Bestätigung',
  previewData: {
    name: 'Max Muster',
    email: 'max@example.com',
    product: 'Lavidro Cabinet',
    paymentMode: 'Einmalzahlung',
    price: '21.500 €',
  },
} satisfies TemplateEntry
