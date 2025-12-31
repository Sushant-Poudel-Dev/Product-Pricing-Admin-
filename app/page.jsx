"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SavedProductCard from "./components/SavedProductCard";

export default function Home() {
  const router = useRouter();
  const [savedProducts, setSavedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalProfitMargin: 0,
    totalProfitAmount: 0,
  });

  useEffect(() => {
    loadSavedProducts();
  }, []);

  const loadSavedProducts = () => {
    const saved = localStorage.getItem("finalizedProducts");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedProducts(parsed);
      calculateStats(parsed);
    }
  };

  const calculateStats = (products) => {
    const total = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + (p.sellingPrice ?? p.totalPrice ?? 0),
      0
    );
    const totalCost = products.reduce((sum, p) => sum + (p.totalCost ?? 0), 0);
    const totalProfitAmount = totalValue - totalCost;
    const totalProfitMargin =
      totalValue > 0 ? (totalProfitAmount / totalValue) * 100 : 0;

    setStats({
      totalProducts: total,
      totalValue,
      totalProfitMargin,
      totalProfitAmount,
    });
  };

  const handleDeleteProduct = (id) => {
    const updated = savedProducts.filter((p) => p.id !== id);
    localStorage.setItem("finalizedProducts", JSON.stringify(updated));
    setSavedProducts(updated);
    calculateStats(updated);
  };

  const handleEditProduct = (product) => {
    sessionStorage.setItem("productToEdit", JSON.stringify(product));
    router.push(`/products/${product.productId}/calculate`);
  };

  return (
    <div className='min-h-screen bg-gray-50 animate-fade-in'>
      {/* Admin Header */}
      <header className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Prasha Beads</h1>
              <p className='text-sm text-gray-600'>Cost Calculator Admin</p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <p className='text-xs text-gray-500'>
                  Threads of elegance, beads of love
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-scale-in'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Products
                </p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  {stats.totalProducts}
                </p>
              </div>
              <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-pink-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-scale-in'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Value</p>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                  NPR {stats.totalValue.toFixed(2)}
                </p>
              </div>
              <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-pink-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-scale-in'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Profit
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    stats.totalProfitAmount >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  NPR {stats.totalProfitAmount.toFixed(2)}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Margin {stats.totalProfitMargin.toFixed(1)}%
                </p>
              </div>
              <div className='w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-pink-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Product Button */}
        <div className='mb-8'>
          <button
            onClick={() => router.push("/products/select")}
            className='w-full md:w-auto px-8 py-4 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            Create New Product
          </button>
        </div>

        {/* Saved Products Section - Cards Only */}
        {savedProducts.length > 0 && (
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-gray-900'>
                Saved Products
              </h2>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.push("/products/table")}
                  className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer'
                >
                  View All
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("finalizedProducts");
                    setSavedProducts([]);
                    calculateStats([]);
                  }}
                  className='text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer'
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {savedProducts.map((product) => (
                <SavedProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteProduct}
                  onEdit={handleEditProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
