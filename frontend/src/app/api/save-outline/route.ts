import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { actions }: { actions: string[] } = await request.json();

    if (!actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body. Expected { actions: string[] }' },
        { status: 400 }
      );
    }

    // Replace with the actual URL of your backend server
    const backendApiUrl = process.env.BACKEND_API_URL; 

    if (!backendApiUrl) {
      console.error('BACKEND_API_URL is not defined in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Backend API URL is not configured.' },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers for your backend here
        // 'Authorization': `Bearer ${process.env.BACKEND_AUTH_TOKEN}`,
      },
      body: JSON.stringify({ actions }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Backend responded with an error:', backendResponse.status, errorData);
      return NextResponse.json(
        { success: false, message: `Backend error: ${errorData.message || backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error('Error in /api/save-outline:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
