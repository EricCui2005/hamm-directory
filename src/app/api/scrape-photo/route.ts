import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl } = await request.json();

    if (!linkedinUrl || typeof linkedinUrl !== 'string') {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }

    // Normalize the URL
    let url = linkedinUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    // Fetch the LinkedIn profile page with browser-like headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch LinkedIn page: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Try multiple patterns to find the profile photo
    let photoUrl: string | null = null;

    // Pattern 1: og:image meta tag
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );

    if (ogImageMatch && ogImageMatch[1]) {
      photoUrl = ogImageMatch[1];
    }

    // Pattern 2: twitter:image meta tag
    if (!photoUrl) {
      const twitterImageMatch = html.match(
        /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
      ) || html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i
      );

      if (twitterImageMatch && twitterImageMatch[1]) {
        photoUrl = twitterImageMatch[1];
      }
    }

    // Pattern 3: Look for profile photo in ld+json
    if (!photoUrl) {
      const ldJsonMatch = html.match(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
      );
      if (ldJsonMatch && ldJsonMatch[1]) {
        try {
          const ldData = JSON.parse(ldJsonMatch[1]);
          if (ldData.image?.contentUrl) {
            photoUrl = ldData.image.contentUrl;
          } else if (typeof ldData.image === 'string') {
            photoUrl = ldData.image;
          }
        } catch {
          // JSON parse failed, skip
        }
      }
    }

    // Filter out generic LinkedIn placeholder images
    if (photoUrl && (
      photoUrl.includes('static.licdn.com/sc/h/') ||
      photoUrl.includes('ghost-person') ||
      photoUrl.includes('default-avatar')
    )) {
      photoUrl = null;
    }

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Could not find profile photo. LinkedIn may have blocked the request.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape LinkedIn profile' },
      { status: 500 }
    );
  }
}
