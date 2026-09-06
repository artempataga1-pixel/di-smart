import { getAllCategories } from "@/lib/catalog";
import { CategoryGridReveal } from "@/components/home/CategoryGridReveal";

export async function CategoryGrid() {
  const categories = await getAllCategories();
  return <CategoryGridReveal categories={categories} />;
}
