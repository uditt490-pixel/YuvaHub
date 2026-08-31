import { Html, Head, Preview, Body, Container, Section, Text, Link } from '@react-email/components';
import * as React from 'react';

interface Opportunity {
  title: string;
  organization: string;
  link: string;
  deadline?: string;
}

interface WeeklyNewsletterProps {
  userName: string;
  aiIntro: string;
  opportunities: Opportunity[];
  unsubscribeUrl: string;
}

export default function WeeklyNewsletter({ userName, aiIntro, opportunities, unsubscribeUrl }: WeeklyNewsletterProps) {
  return (
    <Html>
      <Head />
      <Preview>Your personalized weekly career opportunities are here!</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f7', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Hey {userName},</Text>
          <Text style={{ fontSize: '16px', color: '#555', lineHeight: '1.5' }}>{aiIntro}</Text>
          
          <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', borderBottom: '2px solid #eaeaea', paddingBottom: '8px' }}>
              Top 5 Opportunities For You
            </Text>
            {opportunities.map((opp, idx) => (
              <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <Link href={opp.link} style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc', textDecoration: 'none' }}>
                  {idx + 1}. {opp.title}
                </Link>
                <Text style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>{opp.organization}</Text>
              </div>
            ))}
          </Section>

          <Text style={{ fontSize: '12px', color: '#999', marginTop: '30px', textAlign: 'center' }}>
            You are receiving this because you opted into YuvaHub Career Newsletters. 
            <Link href={unsubscribeUrl} style={{ color: '#999', textDecoration: 'underline', marginLeft: '4px' }}>Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
