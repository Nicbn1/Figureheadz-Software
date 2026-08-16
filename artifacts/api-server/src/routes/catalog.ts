import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, sql } from "drizzle-orm";
import {
  db,
  categoriesTable,
  productsTable,
  productVariationsTable,
} from "@workspace/db";
import {
  ListCategoriesResponse,
  ListFranchisesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  ListFeaturedProductsResponse,
  GetProductParams,
  GetProductResponse,
  ListRelatedProductsParams,
  ListRelatedProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function withVariations<T extends { id: number }>(products: T[]) {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const variations = await db
    .select()
    .from(productVariationsTable)
    .where(sql`${productVariationsTable.productId} in ${ids}`);

  return products.map((product) => {
    const productVariations = variations.filter((v) => v.productId === product.id);
    const totalStock = productVariations.reduce((sum, v) => sum + v.stockQuantity, 0);
    return { ...product, variations: productVariations, totalStock };
  });
}

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.id));
  res.json(ListCategoriesResponse.parse(categories));
});

router.get("/franchises", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ franchise: productsTable.franchise })
    .from(productsTable)
    .orderBy(asc(productsTable.franchise));
  res.json(ListFranchisesResponse.parse(rows.map((r) => r.franchise)));
});

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { categorySlug, franchise, minPriceCents, maxPriceCents, inStockOnly, search, sort, limit } =
    query.data;

  const conditions = [];

  if (categorySlug) {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, categorySlug));
    if (!category) {
      res.json(ListProductsResponse.parse([]));
      return;
    }
    const children = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.parentId, category.id));
    const categoryIds = [category.id, ...children.map((c) => c.id)];
    conditions.push(inArray(productsTable.categoryId, categoryIds));
  }
  if (franchise) conditions.push(eq(productsTable.franchise, franchise));
  if (minPriceCents != null) conditions.push(gte(productsTable.priceCents, minPriceCents));
  if (maxPriceCents != null) conditions.push(lte(productsTable.priceCents, maxPriceCents));
  if (search) {
    conditions.push(
      sql`(${ilike(productsTable.name, `%${search}%`)} or ${ilike(productsTable.franchise, `%${search}%`)})`,
    );
  }

  let orderBy = desc(productsTable.createdAt);
  if (sort === "price_asc") orderBy = asc(productsTable.priceCents);
  else if (sort === "price_desc") orderBy = desc(productsTable.priceCents);
  else if (sort === "popularity") orderBy = desc(productsTable.popularityScore);

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit ?? 100);

  const shaped = rows.map((r) => ({ ...r.product, categoryName: r.categoryName }));
  const withStock = await withVariations(shaped);

  const filtered = withStock.filter((p) => p.totalStock > 0);

  res.json(ListProductsResponse.parse(filtered));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(sql`(${productsTable.isNew} or ${productsTable.isExclusive} or ${productsTable.isOnSale})`)
    .orderBy(desc(productsTable.popularityScore))
    .limit(8);

  const shaped = rows.map((r) => ({ ...r.product, categoryName: r.categoryName }));
  const withStock = await withVariations(shaped);
  res.json(ListFeaturedProductsResponse.parse(withStock.filter((p) => p.totalStock > 0)));
});

router.get("/products/:slug", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.slug, params.data.slug));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [withVariation] = await withVariations([
    { ...row.product, categoryName: row.categoryName },
  ]);
  res.json(GetProductResponse.parse(withVariation));
});

router.get("/products/:slug/related", async (req, res): Promise<void> => {
  const params = ListRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [current] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, params.data.slug));

  if (!current) {
    res.json(ListRelatedProductsResponse.parse([]));
    return;
  }

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      and(
        ne(productsTable.id, current.id),
        sql`(${productsTable.franchise} = ${current.franchise} or ${productsTable.categoryId} = ${current.categoryId})`,
      ),
    )
    .orderBy(desc(productsTable.popularityScore))
    .limit(4);

  const shaped = rows.map((r) => ({ ...r.product, categoryName: r.categoryName }));
  res.json(ListRelatedProductsResponse.parse(await withVariations(shaped)));
});

export default router;
