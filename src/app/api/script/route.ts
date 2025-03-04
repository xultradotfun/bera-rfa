export async function GET() {
  const res = await fetch(
    "https://plausible.io/js/script.hash.outbound-links.js",
    {
      headers: {
        "Content-Type": "application/javascript",
      },
    }
  );
  const script = await res.text();

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
