"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductModal from "../../components/ProductModal";

export default function ProductsTablePage() {
  const router = useRouter();
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date', 'price', 'name'
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((p) => ({
          ...p,
          id: p._id,
          date: new Date(p.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setSavedProducts(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
        if (selectedProduct?.id === id) {
          setSelectedProduct(null);
        }
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const handleEditProduct = (product) => {
    sessionStorage.setItem("productToEdit", JSON.stringify(product));
    router.push(`/products/${product.productId}/calculate`);
  };

  // Filter and sort products
  const filteredProducts = savedProducts
    .filter((product) => {
      const matchesSearch =
        !searchTerm ||
        (product.customName || product.productName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === "price") {
        const priceA = a.sellingPrice || a.totalPrice || 0;
        const priceB = b.sellingPrice || b.totalPrice || 0;
        return priceB - priceA;
      } else if (sortBy === "name") {
        return (a.customName || a.productName).localeCompare(
          b.customName || b.productName
        );
      }
      return 0;
    });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>All Products</h1>
              <p className='text-sm text-gray-600'>
                View and manage all saved products
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className='text-gray-600 hover:text-gray-900 transition-colors cursor-pointer'
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
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* Filters */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Search
              </label>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search products...'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
              >
                <option value='date'>Date (Newest)</option>
                <option value='price'>Price (Highest)</option>
                <option value='name'>Name (A-Z)</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("date");
                }}
                className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium'
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full table-fixed'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Product
                  </th>
                  <th className='w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Materials
                  </th>
                  <th className='w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Qty
                  </th>
                  <th className='w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Cost
                  </th>
                  <th className='w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Final Price
                  </th>
                  <th className='w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Net Profit
                  </th>
                  <th className='w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className='animate-pulse'
                    >
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
                          <div className='h-4 bg-gray-200 rounded w-32'></div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-12'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-8'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-20'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-20'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-24'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-24'></div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-16'></div>
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan='8'
                      className='px-6 py-12 text-center text-gray-500'
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const finalPrice =
                      product.sellingPrice || product.totalPrice || 0;

                    const quantity = product.quantity || 1;

                    const materialsCostPerUnit = product.materials
                      ? product.materials.reduce(
                          (sum, m) => sum + m.price * m.quantity,
                          0
                        )
                      : 0;

                    const laborCostPerUnit = parseFloat(product.laborCost) || 0;
                    const additionalCostPerUnit =
                      parseFloat(product.additionalCost) || 0;

                    const totalMaterialsCost = materialsCostPerUnit * quantity;
                    const totalLaborCost = laborCostPerUnit * quantity;
                    const totalAdditionalCost =
                      additionalCostPerUnit * quantity;

                    // Display Total Cost includes Labor
                    const displayTotalCost =
                      totalMaterialsCost + totalLaborCost + totalAdditionalCost;

                    // Profit Margin = Selling Price - (Total Cost - Labor)
                    const profitMarginAmount =
                      finalPrice - (displayTotalCost - totalLaborCost);

                    return (
                      <tr
                        key={product.id}
                        className='hover:bg-gray-50 cursor-pointer'
                        onClick={() => setSelectedProduct(product)}
                      >
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            {product.productPhoto ? (
                              <img
                                src={product.productPhoto}
                                alt={product.productName}
                                className='w-10 h-10 rounded-lg object-cover flex-shrink-0'
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "block";
                                }}
                              />
                            ) : null}
                            <div
                              className={`text-xl flex-shrink-0 ${
                                product.productPhoto ? "hidden" : ""
                              }`}
                            >
                              {product.productImage}
                            </div>
                            <div className='min-w-0'>
                              <div className='text-sm font-medium text-gray-900 truncate'>
                                {product.customName || product.productName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm text-gray-900'>
                            {product.materialsCount}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm text-gray-900'>
                            {product.quantity}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            NPR {displayTotalCost.toFixed(2)}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-bold text-pink-600'>
                            NPR {finalPrice.toFixed(2)}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-green-600'>
                            NPR {profitMarginAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm text-gray-500'>
                            {product.date}
                          </div>
                        </td>
                        <td className='px-4 py-4 text-sm font-medium'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product);
                              }}
                              className='text-blue-600 hover:text-blue-900 cursor-pointer'
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id);
                              }}
                              className='text-red-600 hover:text-red-900 cursor-pointer'
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>
    </div>
  );
}
