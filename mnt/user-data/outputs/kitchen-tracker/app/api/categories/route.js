import sql from "@/lib/db";

export async function GET() {
  const categories = await sql`
    SELECT category_id, category_name FROM categories ORDER BY category_name
  `;
  return Response.json(categories);
}
