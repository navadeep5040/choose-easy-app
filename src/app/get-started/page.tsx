import { redirect } from 'next/navigation';

export default function GetStartedPage() {
  // Directly route users to login/signup for onboarding
  redirect('/login?mode=register');
}
