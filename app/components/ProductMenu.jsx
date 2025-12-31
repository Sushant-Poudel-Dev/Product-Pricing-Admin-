'use client';

import Link from 'next/link';

export default function ProductMenu({ products, onSelectProduct, selectedProduct }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          onClick={() => onSelectProduct(product.id)}
          className={`
            group relative overflow-hidden rounded-xl bg-white shadow-md border border-gray-100
            transition-all duration-300 cursor-pointer
            hover:shadow-lg hover:border-pink-300
            ${selectedProduct === product.id ? 'ring-2 ring-pink-500 border-pink-500' : ''}
          `}
        >
          {/* Product Image/Icon */}
          <div className="relative h-64 bg-pink-50 flex items-center justify-center">
            <div className="text-8xl transform group-hover:scale-110 transition-transform duration-300">
              {product.image}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
              {product.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-4 flex items-center text-pink-600 font-semibold">
              <span>Select Materials</span>
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

