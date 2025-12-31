"use client";

import { useRouter } from "next/navigation";
import { products } from "../../data/products";

export default function ProductSelectPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gray-50 animate-fade-in'>
      {/* Header with back button */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <button
            onClick={() => router.push("/")}
            className='flex items-center text-gray-600 hover:text-pink-600 transition-colors cursor-pointer'
          >
            <svg
              className='w-6 h-6 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7 7-7m-7 7h18'
              />
            </svg>
            <span className='font-medium'>Back</span>
          </button>
        </div>
      </div>

      {/* Product Selection Section */}
      <div className='py-8 px-6 sm:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold text-gray-900 mb-3'>
              Select Product Type
            </h2>
            <p className='text-lg text-gray-600'>
              Choose a product type to start calculating
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
        </div>
      </div>
    </div>
  );
}
