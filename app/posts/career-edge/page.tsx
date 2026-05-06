import { getAllCareerEdge } from '@/lib/posts';
import BlogList from '@/components/BlogList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career Edge — TechPath AU',
  description: 'Daily deep-dives on AI in IT careers — what AU employers actually want, how to close the gap, and the 485→PR pathway for international graduates.',
};

export default function PostsCareerEdgePage() {
  const careerEdge = getAllCareerEdge();
  return <BlogList posts={careerEdge} tags={[]} />;
}
