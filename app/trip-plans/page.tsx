import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripPlansClientPage from './client-page';

export const revalidate = 300;

export default async function TripPlansPage() {
  try {
    let tripPlans = await client.queries.tripPlanConnection({
      sort: 'title',
      first: 1000, // Get a large number to ensure we get all trip plans
    });
    const allTripPlans = tripPlans;

    if (!allTripPlans.data.tripPlanConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Trip Plans</h1>
            <p>No trip plans found.</p>
          </div>
        </Layout>
      );
    }

    // Removed the pagination loop since we're getting all at once

    return (
      <Layout rawPageData={allTripPlans.data}>
        <TripPlansClientPage data={allTripPlans.data as any} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Trip Plans</h1>
          <p>Trip plans will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}