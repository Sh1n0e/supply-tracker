import sql from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("location_id");

  const items = locationId
    ? await sql`
        SELECT
          i.item_id, i.name, i.quantity, i.unit, i.par_level, i.expiry_date,
          i.location_id, i.category_id,
          l.location_name,
          c.category_name
        FROM items i
        JOIN locations l ON i.location_id = l.location_id
        LEFT JOIN categories c ON i.category_id = c.category_id
        WHERE i.location_id = ${locationId}
        ORDER BY c.category_name, i.name
      `
    : await sql`
        SELECT
          i.item_id, i.name, i.quantity, i.unit, i.par_level, i.expiry_date,
          i.location_id, i.category_id,
          l.location_name,
          c.category_name
        FROM items i
        JOIN locations l ON i.location_id = l.location_id
        LEFT JOIN categories c ON i.category_id = c.category_id
        ORDER BY l.location_name, c.category_name, i.name
      `;

  return Response.json(items);
}

export async function POST(request) {
  const body = await request.json();
  const { name, quantity, unit, par_level, location_id, category_id, expiry_date } = body;

  const [item] = await sql`
    INSERT INTO items (name, quantity, unit, par_level, location_id, category_id, purchase_date, expiry_date)
    VALUES (${name}, ${quantity}, ${unit || "item"}, ${par_level ?? null}, ${location_id}, ${category_id ?? null}, CURRENT_DATE, ${expiry_date || null})
    RETURNING *
  `;

  return Response.json(item, { status: 201 });
}
