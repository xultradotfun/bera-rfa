export async function POST(request: Request) {
  const body = await request.text();

  const res = await fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("User-Agent") || "",
      "X-Forwarded-For": request.headers.get("X-Forwarded-For") || "",
    },
    body,
  });

  return new Response(null, {
    status: res.status,
  });
}
