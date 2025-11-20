import type { Metadata } from 'next';
import './globals.css';
import { VideoProvider } from '../contexts/VideoContext';
import BackgroundVideoWrapper from '../components/BackgroundVideoWrapper';

export const metadata: Metadata = {
  title: '💀 BugReaper - Harvest Bugs from the Graveyard',
  description: 'Reap bugs with AI-powered fixes. No bug survives the harvest.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        fontFamily: 'system-ui, sans-serif', 
        background: 'linear-gradient(180deg, #000000 0%, #1a0a0a 50%, #2d0a1a 100%)',
        color: '#e0e0e0',
        minHeight: '100vh'
      }}>
        <VideoProvider>
          <BackgroundVideoWrapper />
          {children}
        </VideoProvider>
      </body>
    </html>
  );
}
