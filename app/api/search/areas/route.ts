import { NextResponse } from 'next/server';
import client from '@/tina/__generated__/client';

export async function GET() {
  try {
    const result = await client.queries.areaConnection({
      first: 1000
    });

    const areas = result.data.areaConnection.edges?.map(edge => {
      if (!edge?.node) return null;
      
      return {
        id: edge.node.id,
        title: edge.node.title,
        slug: edge.node._sys?.relativePath?.replace('.mdx', '') || '',
        featuredImage: edge.node.featuredImage,
        excerpt: '' // Could extract from content if needed
      };
    }).filter(Boolean) || [];

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Areas search API error:', error);
    return NextResponse.json([]);
  }
}