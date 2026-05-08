import type { Metadata } from 'next';
import JobListingsAdminClient from './JobListingsAdminClient';

export const metadata: Metadata = { title: 'Job Listings — Admin | Gradland' };

export default function AdminJobListingsPage() {
  return <JobListingsAdminClient />;
}
