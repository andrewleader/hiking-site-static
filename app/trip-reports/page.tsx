import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripReportsClientPage from './client-page';

export const revalidate = 300;

export default async function TripReportsPage() {
  try {
    let tripReports = await client.queries.tripReportConnection({
      sort: 'title',
      first: 1000, // Get a large number to ensure we get all trip reports
    });
    const allTripReports = tripReports;

    if (!allTripReports.data.tripReportConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Trip Reports</h1>
            <p>No trip reports found.</p>
          </div>
        </Layout>
      );
    }

    return (
      <Layout rawPageData={allTripReports.data}>
        <TripReportsClientPage data={allTripReports.data as any} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Trip Reports</h1>
          <p>Trip reports will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}