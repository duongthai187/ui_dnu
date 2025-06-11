export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const CUSTOM_API_URL = process.env.CUSTOM_API_URL;
  console.log('CUSTOM_API_URL:', CUSTOM_API_URL);

  if (!CUSTOM_API_URL) {
    return new Response('CUSTOM_API_URL is not defined', { status: 500 });
  }

  try {
    const res = await fetch(`${CUSTOM_API_URL}/api/tags`);

    if (!res.ok) {
      return new Response('Failed to fetch data from custom API', { status: res.status });
    }

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  } catch (error) {
    console.error('Error fetching data from custom API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
