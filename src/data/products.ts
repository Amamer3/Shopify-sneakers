
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Air Jordan 1 Retro High",
    description: "The Air Jordan 1 Retro High is an iconic sneaker that started it all. This classic silhouette features premium materials, a comfortable Air cushioning unit, and the original wings logo that established the Jordan legacy.",
    price: 180,
    category: "Men",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "2",
    name: "Nike Air Max 270",
    description: "The Nike Air Max 270 delivers visible air and unbelievable comfort with the largest heel Air unit yet, offering greater impact absorption with each step. The sleek, running-inspired design pairs modern style with premium materials.",
    price: 150,
    category: "Women",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "3",
    name: "Adidas Ultraboost 21",
    description: "The Adidas Ultraboost 21 features responsive Boost cushioning and a Primeknit+ upper that provides enhanced support and a sock-like fit. The Linear Energy Push system increases stability for a confident run.",
    price: 180,
    category: "Men",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "4",
    name: "Puma RS-X³",
    description: "Bold and eye-catching, the Puma RS-X³ is built with layers of cushioning in the midsole and a mesh and textile upper with leather and suede overlays for a retro-inspired look.",
    price: 110,
    category: "Women",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "5",
    name: "New Balance 990v5",
    description: "The New Balance 990v5 continues the tradition of premium craftsmanship with a perfect blend of cushioning and stability. Made with pigskin leather and mesh, this sneaker delivers unmatched comfort and support.",
    price: 185,
    category: "Men",
    image: "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "6",
    name: "Converse Chuck Taylor All Star",
    description: "A timeless icon, the Converse Chuck Taylor All Star features the classic canvas upper with contrast stitching, medial eyelets, and the signature rubber cap toe and diamond pattern outsole that's been recognizable for generations.",
    price: 60,
    category: "Trending",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "7",
    name: "Vans Old Skool",
    description: "The Vans Old Skool is a classic skate shoe with the iconic side stripe. It features a durable suede and canvas upper, reinforced toecaps for added durability, and the signature waffle outsole for enhanced grip and boardfeel.",
    price: 70,
    category: "Trending",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "8",
    name: "Reebok Classic Leather",
    description: "The Reebok Classic Leather sneaker combines streetwear style with premium materials. The soft leather upper offers support and comfort while the EVA midsole cushions each step. A timeless silhouette that never goes out of style.",
    price: 80,
    category: "Women",
    image: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "9",
    name: "Yeezy Boost 350 V2",
    description: "The adidas Yeezy Boost 350 V2 features an innovative design with a Primeknit upper for breathable comfort. The responsive Boost cushioning and distinctive side stripe make this a coveted addition to any sneaker collection.",
    price: 220,
    category: "Trending",
    image: "https://images.unsplash.com/photo-1603787081207-362bcef7c144?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "10",
    name: "Nike Dunk Low",
    description: "The Nike Dunk Low brings back a basketball icon with a low-profile silhouette. The leather upper delivers a broken-in feel from day one, while the low-cut collar enhances mobility without sacrificing support.",
    price: 100,
    category: "Men",
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-1.2.1&auto=format&fit=crop&q=80&w=600"
  }
];

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string) => {
  return category === 'All' 
    ? products 
    : products.filter(product => product.category === category);
};

export const getCategories = () => {
  return ['All', ...new Set(products.map(product => product.category))];
};
