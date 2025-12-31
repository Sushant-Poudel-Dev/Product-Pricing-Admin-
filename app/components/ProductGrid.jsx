"use client";

import { useRouter } from "next/navigation";
import { products } from "../data/products";

export default function ProductGrid({ products }) {
  const router = useRouter();

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => router.push(`/products/${product.id}`)}
          className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-pink-300 transition-all group animate-scale-in'
        >
          <div className='flex items-center gap-4 mb-4'>
            <div className='text-4xl'>{product.image}</div>
            <div className='flex-1'>
              <h3 className='text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors'>
                {product.title}
              </h3>
              <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                {product.description}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
            <span className='text-sm font-medium text-pink-600'>
              Start Calculation
            </span>
            <svg
              className='w-5 h-5 text-pink-600 transform group-hover:translate-x-1 transition-transform'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
