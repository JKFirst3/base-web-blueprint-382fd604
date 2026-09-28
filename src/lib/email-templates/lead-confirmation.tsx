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
  requestType?: string
  phone?: string
  availability?: string
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

const NewsletterEmail = ({ email }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Newsletter-Anmeldung bei Lavidro ist eingegangen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Danke für deine Newsletter-Anmeldung</Heading>
        <Text style={paragraph}>
          Hallo, wir haben deine Anmeldung für den Lavidro-Newsletter erhalten. Darüber informieren
          wir dich über Entwicklungsupdates von Lavidro.
        </Text>
        <Section style={panel}>
          <Row title="Anmeldung" content="Newsletter · Entwicklungsupdates" />
          <Row title="E-Mail" content={email} />
        </Section>
        <Hr style={{ borderColor: '#EAE4D5', margin: '24px 0' }} />
        <Text style={{ ...paragraph, color: '#6b6b6b' }}>Dein Lavidro Team</Text>
      </Container>
    </Body>
  </Html>
)

const Email = (props: Props) => {
  if (props.requestType === 'newsletter') return <NewsletterEmail {...props} />
  const { name, email, requestType, phone, availability } = props
  const isInterview = requestType === 'interview'
  const typeLabel = isInterview ? 'Interview / Telefonat' : 'Termin-Vormerkung'

  return (
    <Html lang="de" dir="ltr">
      <Head />
      <Preview>Deine Anfrage bei Lavidro ist eingegangen</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Danke für dein Interesse an Lavidro</Heading>
          <Text style={paragraph}>
            {name ? `Hallo ${name},` : 'Hallo,'} wir haben deine Anfrage erhalten und melden uns
            zeitnah persönlich bei dir.
          </Text>

          <Section style={panel}>
            <Row title="Anfrageart" content={typeLabel} />
            <Row title="Name" content={name} />
            <Row title="E-Mail" content={email} />
            <Row title="Telefon" content={phone} />
            <Row title="Zeitliche Verfügbarkeit" content={availability} />
          </Section>

          <Hr style={{ borderColor: '#EAE4D5', margin: '24px 0' }} />
          <Text style={paragraph}>
            Falls sich Angaben ändern, antworte einfach auf diese E-Mail.
          </Text>
          <Text style={{ ...paragraph, color: '#6b6b6b' }}>Dein Lavidro Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data?.requestType === 'newsletter'
      ? 'Deine Newsletter-Anmeldung bei Lavidro'
      : data?.requestType === 'interview'
      ? 'Deine Interview-Anfrage bei Lavidro'
      : 'Deine Termin-Vormerkung bei Lavidro',
  displayName: 'Lead-Bestätigung',
  previewData: {
    name: 'Lisa Muster',
    email: 'lisa@example.com',
    requestType: 'interview',
    phone: '+49 170 1234567',
    availability: 'Werktags ab 18 Uhr',
  },
} satisfies TemplateEntry
