import { NextResponse } from 'next/server';
import client from '@/tina/__generated__/client';

export async function GET() {
  try {
    const result = await client.queries.tripReportConnection({
      first: 1000
    });

    const reports = result.data.tripReportConnection.edges?.map(edge => {
      if (!edge?.node) return null;
      
      return {
        id: edge.node.id,
        title: edge.node.title,
        slug: edge.node._sys?.relativePath?.replace('.mdx', '') || '',
        featuredImage: edge.node.featuredImage,
        startDate: edge.node.startDate,
        endDate: edge.node.endDate
      };
    }).filter(Boolean) || [];

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Trip reports search API error:', error);
    return NextResponse.json([]);
  }
}