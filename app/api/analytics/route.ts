import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page_url, referrer, user_agent, story_slug } = body;

    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Get Vercel Geo headers (automatically populated in Vercel production environment)
    const country = request.headers.get('x-vercel-ip-country') || 'local';
    const region = request.headers.get('x-vercel-ip-country-region') || 'local';
    const city = request.headers.get('x-vercel-ip-city') || 'local';
    const latitude = request.headers.get('x-vercel-ip-latitude') || '0';
    const longitude = request.headers.get('x-vercel-ip-longitude') || '0';

    // Fallback Geolocation API for local development when testing real IPs
    let finalCountry = country;
    let finalRegion = region;
    let finalCity = city;
    let finalLat = latitude;
    let finalLon = longitude;

    const firstIp = ip.split(',')[0].trim();
    if (firstIp !== '127.0.0.1' && firstIp !== '::1' && firstIp !== 'localhost' && (country === 'local' || country === 'unknown')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${firstIp}/json/`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && !geoData.error) {
            finalCountry = geoData.country_name || country;
            finalRegion = geoData.region || region;
            finalCity = geoData.city || city;
            finalLat = String(geoData.latitude || latitude);
            finalLon = String(geoData.longitude || longitude);
          }
        }
      } catch (e) {
        console.error('Geo API error:', e);
      }
    }

    // Insert into Supabase analytics_logs table
    const { error } = await supabase.from('analytics_logs').insert([
      {
        ip_address: firstIp,
        country: finalCountry,
        region: finalRegion,
        city: finalCity,
        latitude: finalLat,
        longitude: finalLon,
        page_url,
        referrer: referrer || 'direct',
        user_agent: user_agent || 'unknown',
        story_slug: story_slug || null,
      }
    ]);

    if (error) {
      console.error('Error inserting log into Supabase:', error.message);
      // Return 200/success anyway to avoid blocking user interaction, but log the error
      return NextResponse.json({ success: false, warning: 'Database insertion failed: ' + error.message });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics endpoint error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
