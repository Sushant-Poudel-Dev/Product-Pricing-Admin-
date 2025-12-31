"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ConfirmationModal from "./ConfirmationModal";

export default function ProductModal({ product, onClose, onDelete }) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted || !product) return null;

  // Use selling price (final price) instead of total price
  const finalPrice = product.sellingPrice || product.totalPrice || 0;
  const unitFinalPrice =
    product.unitPrice || finalPrice / (product.quantity || 1);

  const quantity = product.quantity || 1;

  const materialsCostPerUnit = product.materials
    ? product.materials.reduce((sum, m) => sum + m.price * m.quantity, 0)
    : 0;

  const laborCostPerUnit = parseFloat(product.laborCost) || 0;
  const additionalCostPerUnit = parseFloat(product.additionalCost) || 0;

  const totalMaterialsCost = materialsCostPerUnit * quantity;
  const totalLaborCost = laborCostPerUnit * quantity;
  const totalAdditionalCost = additionalCostPerUnit * quantity;

  // Display Total Cost includes Labor
  const displayTotalCost =
    totalMaterialsCost + totalLaborCost + totalAdditionalCost;

  // Profit Margin = Selling Price - (Total Cost - Labor)
  const profitAmount = finalPrice - (displayTotalCost - totalLaborCost);

  const profitMargin = finalPrice > 0 ? (profitAmount / finalPrice) * 100 : 0;

  return createPortal(
    <>
      <div className='fixed inset-0 z-[50] flex items-center justify-center p-4'>
        {/* Backdrop */}
        <div
          className='absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className='relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in z-10'>
          {/* Header */}
          <div className='sticky top-0 bg-pink-600 text-white p-6 flex items-center justify-between z-10'>
            <div>
              <h2 className='text-2xl font-bold'>
                {product.customName || product.productName}
              </h2>
              <p className='text-pink-100 text-sm mt-1'>
                {product.customDescription || product.productDescription}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:text-pink-200 transition-colors cursor-pointer p-2'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              {/* Image Section */}
              <div>
                {product.productPhoto ? (
                  <div className='relative'>
                    {!imageExpanded ? (
                      <>
                        <img
                          src={product.productPhoto}
                          alt={product.customName || product.productName}
                          className='w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer'
                          onClick={() => setImageExpanded(true)}
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                        <div className='absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs'>
                          Click to expand
                        </div>
                        <div className='hidden w-full h-64 bg-gray-100 rounded-lg items-center justify-center text-6xl'>
                          {product.productImage}
                        </div>
                      </>
                    ) : (
                      <div className='fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center p-4'>
                        <button
                          onClick={() => setImageExpanded(false)}
                          className='absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 cursor-pointer z-[61]'
                        >
                          <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                        <img
                          src={product.productPhoto}
                          alt={product.customName || product.productName}
                          className='max-w-full max-h-full object-contain'
                          onClick={() => setImageExpanded(false)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-6xl'>
                    {product.productImage}
                  </div>
                )}

                {/* Quantity and Date beneath image */}
                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                    <div className='text-xs text-gray-500 mb-1'>Quantity</div>
                    <div className='text-lg font-semibold text-gray-900'>
                      {product.quantity}
                    </div>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                    <div className='text-xs text-gray-500 mb-1'>
                      Date Created
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      {product.date}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Section - Reordered */}
              <div className='space-y-4'>
                {/* Total Cost */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Total Cost</span>
                    <span className='text-xl font-semibold text-gray-900'>
                      NPR {displayTotalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Labor and Additional Cost */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                    <div className='text-xs text-gray-500 mb-1'>
                      Labor Charge
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      NPR {product.laborCost?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                    <div className='text-xs text-gray-500 mb-1'>
                      Additional Charge
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      NPR {product.additionalCost?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>

                {/* Profit Info */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Net Profit</span>
                    <span className='text-lg font-semibold text-gray-900'>
                      NPR {profitAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Net Margin</span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Final Price - At Last */}
                <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Final Price</span>
                    <span className='text-2xl font-semibold text-gray-900'>
                      NPR {finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>Per Unit</span>
                    <span className='font-semibold text-gray-900'>
                      NPR {unitFinalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className='border-t border-gray-200 pt-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Materials Used ({product.materialsCount})
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {product.materials &&
                  product.materials.map((material, index) => (
                    <div
                      key={material.id || index}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      {material.image && (
                        <img
                          src={material.image}
                          alt={material.name}
                          className='w-12 h-12 object-cover rounded'
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {material.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          NPR {material.price} / {material.unit}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-semibold text-gray-900'>
                          {material.quantity} × NPR {material.price}
                        </div>
                        <div className='text-xs text-pink-600 font-medium'>
                          = NPR{" "}
                          {(material.price * material.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            {/* <div className='mt-6 pt-6 border-t border-gray-200 flex justify-end'>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-semibold'
              >
                Delete Product
              </button>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer ml-3'
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title='Delete Product'
        message='Are you sure you want to delete this saved product? This action cannot be undone.'
        onConfirm={() => {
          onDelete(product.id);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText='Delete'
        isDangerous={true}
      />
    </>,
    document.body
  );
}
