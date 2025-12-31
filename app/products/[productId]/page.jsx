'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { products } from '../../data/products';
import { getAllMaterials } from '../../data/materials';
import MaterialSelector from '../../components/MaterialSelector';

export default function ProductMaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId;
  const product = products.find(p => p.id === productId);
  const allMaterials = getAllMaterials();

  const [selectedMaterials, setSelectedMaterials] = useState([]);

  useEffect(() => {
    if (product) {
      sessionStorage.setItem('selectedProduct', productId);
      // Load saved materials if any
      const saved = sessionStorage.getItem(`materials_${productId}`);
      if (saved) {
        setSelectedMaterials(JSON.parse(saved));
      }
    }
  }, [product, productId]);

  const handleMaterialsSelected = (materials) => {
    setSelectedMaterials(materials);
    sessionStorage.setItem(`materials_${productId}`, JSON.stringify(materials));
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <MaterialSelector
      product={product}
      allMaterials={allMaterials}
      onMaterialsSelected={handleMaterialsSelected}
    />
  );
}

