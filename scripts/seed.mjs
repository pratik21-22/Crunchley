const products = [
  {
    name: "Classic Roasted Makhana",
    slug: "classic-roasted-makhana",
    price: 199,
    category: "Original",
    description: "The classic lightly roasted and salted fox nuts.",
    stock: 50,
    image: "/images/hero-makhana.jpg"
  },
  {
    name: "Cheese Makhana",
    slug: "cheese-makhana",
    price: 229,
    category: "Cheese",
    description: "Delicious cheese flavored makhana for a perfect evening snack.",
    stock: 120,
    image: "/images/cheese-makhana.jpg"
  },
  {
    name: "Peri Peri Makhana",
    slug: "peri-peri-makhana",
    price: 229,
    category: "Spicy",
    description: "Hot and spicy peri peri flavored makhana.",
    stock: 80,
    image: "/images/peri-peri-makhana.jpg"
  },
  {
    name: "Pudina Makhana",
    slug: "pudina-makhana",
    price: 219,
    category: "Mint",
    description: "Refreshing pudina (mint) flavored makhana.",
    stock: 45,
    image: "/images/pudina-makhana.jpg"
  }
];

async function seed() {
  console.log("Starting seeding...");
  for (const product of products) {
    try {
      const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      console.log(`Seeded ${product.name}:`, data.success ? "Success" : data.error);
    } catch (e) {
      console.error(`Failed to seed ${product.name}`, e);
    }
  }
  console.log("Seeding complete.");
}

seed();
