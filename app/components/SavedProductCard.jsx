"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

export default function SavedProductCard({ product, onDelete, onEdit }) {
  const [showModal, setShowModal] = useState(false);

  // Use selling price (final price) instead of total price
  const finalPrice = product.sellingPrice || product.totalPrice || 0;
  const unitFinalPrice =
    product.unitPrice || finalPrice / (product.quantity || 1);

  const quantity = product.quantity || 1;

  // Calculate costs based on components to ensure consistency
  const materialsCostPerUnit = product.materials
    ? product.materials.reduce((sum, m) => sum + m.price * m.quantity, 0)
    : 0;

  const laborCostPerUnit = parseFloat(product.laborCost) || 0;
  const additionalCostPerUnit = parseFloat(product.additionalCost) || 0;

  const totalMaterialsCost = materialsCostPerUnit * quantity;
  const totalLaborCost = laborCostPerUnit * quantity;
  const totalAdditionalCost = additionalCostPerUnit * quantity;

  // Display Total Cost includes Labor (as per request "Then i see that the total price is 50")
  const displayTotalCost =
    totalMaterialsCost + totalLaborCost + totalAdditionalCost;

  // Profit Margin = Selling Price - (Total Cost - Labor)
  // Profit = Selling Price - (Materials + Additional)
  const profitMarginAmount = finalPrice - (displayTotalCost - totalLaborCost);

  return (
    <>
      <div
        className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer animate-scale-in'
        onClick={() => setShowModal(true)}
      >
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-start gap-4 flex-1'>
            {product.productPhoto ? (
              <img
                src={product.productPhoto}
                alt={product.customName || product.productName}
                className='w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200'
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = "block";
                  }
                }}
              />
            ) : (
              <div className='text-5xl flex-shrink-0'>
                {product.productImage}
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-bold text-gray-900'>
                {product.customName || product.productName}
              </h3>
              <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                {product.customDescription || product.productDescription}
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-2 ml-2'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded transition-colors cursor-pointer flex-shrink-0'
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className='text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors cursor-pointer flex-shrink-0'
            >
              Delete
            </button>
          </div>
        </div>

        <div className='space-y-2 mb-4'>
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>Quantity:</span> {product.quantity}
          </div>
          <div className='text-sm text-gray-600'>
            <span className='font-medium'>Date:</span> {product.date}
          </div>
        </div>

        <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
          <div>
            <div className='text-2xl font-bold text-pink-600'>
              NPR {finalPrice.toFixed(2)}
            </div>
            <div className='text-sm text-gray-500 mt-1'>
              NPR {unitFinalPrice.toFixed(2)} per unit
            </div>
          </div>
          <div className='text-xs text-gray-400'>Click to view details</div>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
