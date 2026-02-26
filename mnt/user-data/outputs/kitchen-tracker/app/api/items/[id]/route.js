import sql from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = params;
  const [item] = await sql`
    SELECT i.*, l.location_name, c.category_name
    FROM items i
    JOIN locations l ON i.location_id = l.location_id
    LEFT JOIN categories c ON i.category_id = c.category_id
    WHERE i.item_id = ${id}
  `;
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { name, quantity, unit, par_level, location_id, category_id } = body;

  const [item] = await sql`
    UPDATE items SET
      name        = COALESCE(${name ?? null}, name),
      quantity    = COALESCE(${quantity ?? null}, quantity),
      unit        = COALESCE(${unit ?? null}, unit),
      par_level   = COALESCE(${par_level ?? null}, par_level),
      location_id = COALESCE(${location_id ?? null}, location_id),
      category_id = COALESCE(${category_id ?? null}, category_id)
    WHERE item_id = ${id}
    RETURNING *
  `;
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await sql`DELETE FROM items WHERE item_id = ${id}`;
  return Response.json({ success: true });
}
