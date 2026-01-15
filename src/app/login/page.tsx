import Login from '@/components/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | AEROFREN',
    description: 'Sign in to your AEROFREN account to access support, chat with our team, and get AI-powered assistance.',
};

export default function LoginPage() {
    return <Login />;
}
