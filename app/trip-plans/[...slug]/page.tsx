import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripPlanClientPage from './client-page';

export async function generateStaticParams() {
  // For static builds, we'll generate params based on the filesystem
  // This avoids API calls during build time that can fail due to rate limits or server issues
  const fs = require('fs');
  const path = require('path');
  
  try {
    const contentDir = path.join(process.cwd(), 'content', 'trip-plans');
    const files = fs.readdirSync(contentDir);
    
    return files
      .filter((file: string) => file.endsWith('.mdx'))
      .map((file: string) => ({
        slug: [file.replace('.mdx', '')]
      }));
  } catch (error) {
    console.error('Error generating static params for trip plans:', error);
    return [];
  }
}

export default async function TripPlanPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripPlan = await client.queries.tripPlan({
      relativePath: `${slug}.mdx`,
    });

    return (
      <Layout rawPageData={tripPlan.data}>
        <TripPlanClientPage {...tripPlan} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}