import { Order } from '@/lib/types';

export const ordersData: Order[] = [
  {
    id: 'ORD-2026-001',
    items: [
      { productId: 'p001', variantId: 'v001b', quantity: 1, unitPrice: 1650 },
      { productId: 'p017', variantId: 'v017a', quantity: 1, unitPrice: 850 }
    ],
    shippingAddress: {
      firstName: 'Youssef',
      lastName: 'Bennani',
      phone: '+212 600-112233',
      city: 'Casablanca',
      address: '15 Rue des Fleurs, Maarif'
    },
    paymentMethod: 'card',
    subtotal: 2500,
    shippingCost: 0,
    total: 2500,
    status: 'delivered',
    createdAt: '2026-08-10T14:20:00Z'
  },
  {
    id: 'ORD-2026-002',
    items: [
      { productId: 'p002', variantId: 'v002c', quantity: 1, unitPrice: 2200 }
    ],
    shippingAddress: {
      firstName: 'Fatima',
      lastName: 'El Amrani',
      phone: '+212 611-223344',
      city: 'Rabat',
      address: 'Avenue Mohammed V, Hassan'
    },
    paymentMethod: 'cod',
    subtotal: 2200,
    shippingCost: 0,
    total: 2200,
    status: 'shipped',
    createdAt: '2026-08-12T09:15:00Z'
  },
  {
    id: 'ORD-2026-003',
    items: [
      { productId: 'p005', variantId: 'v005b', quantity: 1, unitPrice: 4200 }
    ],
    shippingAddress: {
      firstName: 'Khadija',
      lastName: 'Fassi',
      phone: '+212 633-445566',
      city: 'Fès',
      address: 'Ville Nouvelle, Rue de la Liberté'
    },
    paymentMethod: 'cod',
    subtotal: 4200,
    shippingCost: 35,
    total: 4235,
    status: 'confirmed',
    createdAt: '2026-08-14T11:30:00Z'
  },
  {
    id: 'ORD-2026-004',
    items: [
      { productId: 'p004', variantId: 'v004b', quantity: 1, unitPrice: 1200 }
    ],
    shippingAddress: {
      firstName: 'Omar',
      lastName: 'Berrada',
      phone: '+212 644-556677',
      city: 'Tanger',
      address: 'Boulevard Pasteur'
    },
    paymentMethod: 'card',
    subtotal: 1200,
    shippingCost: 0,
    total: 1200,
    status: 'pending',
    createdAt: '2026-08-16T15:45:00Z'
  },
  {
    id: 'ORD-2026-005',
    items: [
      { productId: 'p011', variantId: 'v011a', quantity: 2, unitPrice: 280 },
      { productId: 'p013', variantId: 'v013a', quantity: 1, unitPrice: 450 }
    ],
    shippingAddress: {
      firstName: 'Salma',
      lastName: 'Chraibi',
      phone: '+212 655-667788',
      city: 'Casablanca',
      address: 'Anfa, Boulevard d\'Anfa'
    },
    paymentMethod: 'cod',
    subtotal: 1010,
    shippingCost: 0,
    total: 1010,
    status: 'delivered',
    createdAt: '2026-08-01T10:10:00Z'
  },
  {
    id: 'ORD-2026-006',
    items: [
      { productId: 'p006', variantId: 'v006b', quantity: 1, unitPrice: 4800 }
    ],
    shippingAddress: {
      firstName: 'Mehdi',
      lastName: 'Alaoui',
      phone: '+212 666-778899',
      city: 'Agadir',
      address: 'Marina d\'Agadir'
    },
    paymentMethod: 'card',
    subtotal: 4800,
    shippingCost: 35,
    total: 4835,
    status: 'cancelled',
    createdAt: '2026-08-10T08:20:00Z'
  },
  {
    id: 'ORD-2026-007',
    items: [
      { productId: 'p019', variantId: 'v019a', quantity: 2, unitPrice: 120 },
      { productId: 'p018', variantId: 'v018a', quantity: 1, unitPrice: 150 }
    ],
    shippingAddress: {
      firstName: 'Nadia',
      lastName: 'Idrissi',
      phone: '+212 677-889900',
      city: 'Rabat',
      address: 'Agdal, Rue Ibn Sina'
    },
    paymentMethod: 'cod',
    subtotal: 390,
    shippingCost: 0,
    total: 390,
    status: 'delivered',
    createdAt: '2026-07-25T14:50:00Z'
  },
  {
    id: 'ORD-2026-008',
    items: [
      { productId: 'p022', variantId: 'v022b', quantity: 1, unitPrice: 450 },
      { productId: 'p024', variantId: 'v024a', quantity: 1, unitPrice: 350 }
    ],
    shippingAddress: {
      firstName: 'Hassan',
      lastName: 'Lahlou',
      phone: '+212 688-990011',
      city: 'Meknès',
      address: 'Hamria, Rue de Paris'
    },
    paymentMethod: 'cod',
    subtotal: 800,
    shippingCost: 35,
    total: 835,
    status: 'shipped',
    createdAt: '2026-08-13T12:15:00Z'
  },
  {
    id: 'ORD-2026-009',
    items: [
      { productId: 'p003', variantId: 'v003a', quantity: 1, unitPrice: 2800 }
    ],
    shippingAddress: {
      firstName: 'Leila',
      lastName: 'Benali',
      phone: '+212 699-001122',
      city: 'Casablanca',
      address: 'Bourgogne'
    },
    paymentMethod: 'card',
    subtotal: 2800,
    shippingCost: 0,
    total: 2800,
    status: 'pending',
    createdAt: '2026-08-17T09:30:00Z'
  },
  {
    id: 'ORD-2026-010',
    items: [
      { productId: 'p021', variantId: 'v021b', quantity: 1, unitPrice: 620 },
      { productId: 'p025', variantId: 'v025a', quantity: 1, unitPrice: 420 }
    ],
    shippingAddress: {
      firstName: 'Tariq',
      lastName: 'Zidane',
      phone: '+212 600-223344',
      city: 'Marrakech',
      address: 'Gueliz, Avenue Mohammed V'
    },
    paymentMethod: 'cod',
    subtotal: 1040,
    shippingCost: 0,
    total: 1040,
    status: 'confirmed',
    createdAt: '2026-08-16T11:45:00Z'
  },
  {
    id: 'ORD-2026-011',
    items: [
      { productId: 'p016', variantId: 'v016a', quantity: 1, unitPrice: 2800 }
    ],
    shippingAddress: {
      firstName: 'Meryem',
      lastName: 'Boujemaa',
      phone: '+212 611-334455',
      city: 'Tanger',
      address: 'Malabata'
    },
    paymentMethod: 'card',
    subtotal: 2800,
    shippingCost: 0,
    total: 2800,
    status: 'delivered',
    createdAt: '2026-08-05T16:20:00Z'
  },
  {
    id: 'ORD-2026-012',
    items: [
      { productId: 'p026', variantId: 'v026a', quantity: 2, unitPrice: 380 }
    ],
    shippingAddress: {
      firstName: 'Yassine',
      lastName: 'Moutaoukil',
      phone: '+212 622-445566',
      city: 'Fès',
      address: 'Route d\'Imouzzer'
    },
    paymentMethod: 'cod',
    subtotal: 760,
    shippingCost: 35,
    total: 795,
    status: 'shipped',
    createdAt: '2026-08-14T09:10:00Z'
  },
  {
    id: 'ORD-2026-013',
    items: [
      { productId: 'p008', variantId: 'v008c', quantity: 1, unitPrice: 1650 },
      { productId: 'p015', variantId: 'v015a', quantity: 1, unitPrice: 420 }
    ],
    shippingAddress: {
      firstName: 'Sara',
      lastName: 'Haddad',
      phone: '+212 633-556677',
      city: 'Casablanca',
      address: 'CIL'
    },
    paymentMethod: 'card',
    subtotal: 2070,
    shippingCost: 0,
    total: 2070,
    status: 'confirmed',
    createdAt: '2026-08-15T14:35:00Z'
  },
  {
    id: 'ORD-2026-014',
    items: [
      { productId: 'p014', variantId: 'v014a', quantity: 1, unitPrice: 480 }
    ],
    shippingAddress: {
      firstName: 'Rachid',
      lastName: 'Kabbaj',
      phone: '+212 644-667788',
      city: 'Rabat',
      address: 'Hay Riad'
    },
    paymentMethod: 'cod',
    subtotal: 480,
    shippingCost: 0,
    total: 480,
    status: 'cancelled',
    createdAt: '2026-08-11T10:15:00Z'
  },
  {
    id: 'ORD-2026-015',
    items: [
      { productId: 'p009', variantId: 'v009b', quantity: 1, unitPrice: 1350 }
    ],
    shippingAddress: {
      firstName: 'Imane',
      lastName: 'Sbai',
      phone: '+212 655-778899',
      city: 'Agadir',
      address: 'Quartier Suisse'
    },
    paymentMethod: 'cod',
    subtotal: 1350,
    shippingCost: 35,
    total: 1385,
    status: 'pending',
    createdAt: '2026-08-17T08:50:00Z'
  },
  {
    id: 'ORD-2026-016',
    items: [
      { productId: 'p007', variantId: 'v007b', quantity: 1, unitPrice: 1050 }
    ],
    shippingAddress: {
      firstName: 'Adil',
      lastName: 'Belhaj',
      phone: '+212 666-889900',
      city: 'Meknès',
      address: 'Route de Fès'
    },
    paymentMethod: 'card',
    subtotal: 1050,
    shippingCost: 35,
    total: 1085,
    status: 'delivered',
    createdAt: '2026-07-28T13:40:00Z'
  },
  {
    id: 'ORD-2026-017',
    items: [
      { productId: 'p020', variantId: 'v020b', quantity: 1, unitPrice: 2450 }
    ],
    shippingAddress: {
      firstName: 'Zineb',
      lastName: 'Oufkir',
      phone: '+212 677-990011',
      city: 'Casablanca',
      address: 'Ain Diab'
    },
    paymentMethod: 'cod',
    subtotal: 2450,
    shippingCost: 0,
    total: 2450,
    status: 'shipped',
    createdAt: '2026-08-12T16:25:00Z'
  },
  {
    id: 'ORD-2026-018',
    items: [
      { productId: 'p001', variantId: 'v001c', quantity: 1, unitPrice: 2350 }
    ],
    shippingAddress: {
      firstName: 'Amine',
      lastName: 'Tazi',
      phone: '+212 622-334455',
      city: 'Marrakech',
      address: 'Hivernage'
    },
    paymentMethod: 'card',
    subtotal: 2350,
    shippingCost: 0,
    total: 2350,
    status: 'confirmed',
    createdAt: '2026-08-16T09:10:00Z'
  },
  {
    id: 'ORD-2026-019',
    items: [
      { productId: 'p010', variantId: 'v010a', quantity: 1, unitPrice: 3400 }
    ],
    shippingAddress: {
      firstName: 'Salma',
      lastName: 'Chraibi',
      phone: '+212 655-667788',
      city: 'Casablanca',
      address: 'Gauthier'
    },
    paymentMethod: 'cod',
    subtotal: 3400,
    shippingCost: 0,
    total: 3400,
    status: 'delivered',
    createdAt: '2026-08-02T11:55:00Z'
  },
  {
    id: 'ORD-2026-020',
    items: [
      { productId: 'p023', variantId: 'v023a', quantity: 1, unitPrice: 580 },
      { productId: 'p012', variantId: 'v012a', quantity: 1, unitPrice: 520 }
    ],
    shippingAddress: {
      firstName: 'Youssef',
      lastName: 'Bennani',
      phone: '+212 600-112233',
      city: 'Casablanca',
      address: 'Palmier'
    },
    paymentMethod: 'cod',
    subtotal: 1100,
    shippingCost: 0,
    total: 1100,
    status: 'pending',
    createdAt: '2026-08-17T11:30:00Z'
  }
];

export { ordersData as mockOrders };
