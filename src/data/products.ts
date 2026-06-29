export interface Product {
  id: string;
  name: string;
  category: 'mouse' | 'mousepad';
  price: number;
  description: string;
  features: string[];
  colors: string[];
  image: string;
  brand: string;
}

export const products: Product[] = [
  // === 鼠标 ===
  {
    id: 'm1',
    name: 'Z1',
    category: 'mouse',
    price: 699,
    description: '人体工学无线鼠标。贴合手掌的自然弧度，长时间使用不疲劳。',
    features: ['人体工学设计', 'PAW3395 传感器', '80小时续航', 'USB-C 快充', '三模连接'],
    colors: ['#1a1a1a', '#f5f5f0', '#c0a060'],
    image: '/zzr-store/images/mouse-m2.svg',
    brand: 'ZZR',
  },
  {
    id: 'm2',
    name: 'R1',
    category: 'mouse',
    price: 549,
    description: '对称式无线鼠标。左右手通用，轻量化设计，精准操控。',
    features: ['对称设计', '59g 超轻量', 'PAW3311 传感器', '60小时续航', 'RGB 灯效'],
    colors: ['#f5f5f0', '#1a1a1a', '#e8d5c0'],
    image: '/zzr-store/images/mouse-m1.svg',
    brand: 'ZZR',
  },
  // === 鼠标垫 ===
  {
    id: 'p1',
    name: 'MP1',
    category: 'mousepad',
    price: 249,
    description: '900×400mm 超大桌面垫。细腻针织表面，兼顾操控与顺滑。',
    features: ['900×400mm', '针织表面', '5mm 橡胶底', '防水涂层', '防滑底纹'],
    colors: ['#1a1a1a', '#f5f5f0', '#2d2d2d'],
    image: '/zzr-store/images/pad-p1.svg',
    brand: 'ZZR',
  },
];
