import { NextResponse } from 'next/server';
import client from '@/tina/__generated__/client';

export async function GET() {
  try {
    const result = await client.queries.routeConnection({
      first: 1000
    });

    const routes = result.data.routeConnection.edges?.map(edge => {
      if (!edge?.node) return null;
      
      return {
        id: edge.node.id,
        title: edge.node.title,
        slug: edge.node._sys?.relativePath?.replace('.mdx', '') || '',
        featuredImage: edge.node.featuredImage,
        classRating: edge.node.classRating,
        ydsRating: edge.node.ydsRating,
        ydsSubRating: edge.node.ydsSubRating,
        miles: edge.node.miles,
        gain: edge.node.gain,
        parentArea: typeof edge.node.parentArea === 'object' ? edge.node.parentArea?.title : edge.node.parentArea
      };
    }).filter(Boolean) || [];

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Routes search API error:', error);
    return NextResponse.json([]);
  }
}