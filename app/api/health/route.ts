export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "shopping-web",
    },
    { status: 200 },
  )
}
