import Login from '@/components/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Σύνδεση | AEROFREN',
    description: 'Συνδεθείτε στον λογαριασμό σας AEROFREN για πρόσβαση σε υποστήριξη και αποκλειστικές υπηρεσίες.',
};

export default function LoginPage() {
    return <Login />;
}
