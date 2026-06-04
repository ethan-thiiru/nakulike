import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let url = "";

    if (q) {
      // Search — Nominatim (already works)
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    } else if (lat && lon) {
      // Reverse geocode — BigDataCloud (no API key, more reliable)
      url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    } else {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "DatingApp/1.0" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Geocode error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize BigDataCloud response to match Nominatim shape
    if (lat && lon) {
      const normalized = {
        display_name: data.locality
          ? `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
          : data.countryName || `${lat}, ${lon}`,
        address: {
          city: data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || '',
          town: data.locality || '',
          state: data.principalSubdivision || '',
          country: data.countryName || '',
        },
      };
      return NextResponse.json(normalized);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("Geocode fetch failed:", error);
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}
