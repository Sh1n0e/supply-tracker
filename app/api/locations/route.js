import sql from "@/lib/db";

export async function GET() {
  const locations = await sql`
    SELECT location_id, location_name FROM locations ORDER BY location_name
  `;
  return Response.json(locations);
}