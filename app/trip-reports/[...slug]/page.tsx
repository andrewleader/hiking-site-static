import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripReportClientPage from './client-page';

export async function generateStaticParams() {
  // For static builds, we'll generate params based on the filesystem
  // This avoids API calls during build time that can fail due to rate limits or server issues
  const fs = require('fs');
  const path = require('path');
  
  try {
    const contentDir = path.join(process.cwd(), 'content', 'trip-reports');
    const files = fs.readdirSync(contentDir);
    
    return files
      .filter((file: string) => file.endsWith('.mdx'))
      .map((file: string) => ({
        slug: [file.replace('.mdx', '')]
      }));
  } catch (error) {
    console.error('Error generating static params for trip reports:', error);
    return [];
  }
}

export default async function TripReportPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripReport = await client.queries.tripReport({
      relativePath: `${slug}.mdx`,
    });

    return (
      <Layout rawPageData={tripReport.data}>
        <TripReportClientPage {...tripReport} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}