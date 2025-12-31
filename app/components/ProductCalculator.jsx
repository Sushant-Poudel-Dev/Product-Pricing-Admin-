"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

export default function ProductCalculator({
  product,
  selectedMaterials,
  setSelectedMaterials,
}) {
  const router = useRouter();
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState(
    product.description || ""
  );
  const [productPhoto, setProductPhoto] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [laborCost, setLaborCost] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [priceMode, setPriceMode] = useState("selling"); // 'selling' or 'margin'
  const [sellingPrice, setSellingPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [marginType, setMarginType] = useState("percentage"); // 'percentage' or 'amount'
  const [materialToRemove, setMaterialToRemove] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPhoto(reader.result);
          setProductPhoto(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload an image file");
      }
    }
  };

  // Load selected materials from sessionStorage if available
  useEffect(() => {
    const productToEdit = sessionStorage.getItem("productToEdit");
    if (productToEdit) {
      const p = JSON.parse(productToEdit);
      setCustomName(p.customName || p.productName);
      setCustomDescription(p.customDescription || p.productDescription);
      setProductPhoto(p.productPhoto || "");
      setSelectedMaterials(p.materials || []);
      setQuantity(p.quantity || 1);
      setLaborCost(p.laborCost || "");
      setAdditionalCost(p.additionalCost || "");
      setSellingPrice(p.sellingPrice || "");
      setProfitMargin(p.profitMargin || "");
      setPriceMode("selling");
      setEditingProductId(p.id);
      sessionStorage.removeItem("productToEdit");
    } else {
      const saved = sessionStorage.getItem(`materials_${product.id}`);
      if (saved) {
        setSelectedMaterials(JSON.parse(saved));
      }
    }
  }, [product.id, setSelectedMaterials]);

  // Save to sessionStorage whenever materials change
  useEffect(() => {
    if (selectedMaterials.length > 0) {
      sessionStorage.setItem(
        `materials_${product.id}`,
        JSON.stringify(selectedMaterials)
      );
    }
  }, [selectedMaterials, product.id]);

  const updateMaterialQuantity = (materialId, newQuantity) => {
    if (parseFloat(newQuantity) <= 0) {
      removeMaterial(materialId);
      return;
    }
    setSelectedMaterials(
      selectedMaterials.map((m) =>
        m.id === materialId ? { ...m, quantity: parseFloat(newQuantity) } : m
      )
    );
  };

  const removeMaterial = (materialId) => {
    setMaterialToRemove(materialId);
  };

  const confirmRemoveMaterial = () => {
    if (!materialToRemove) return;
    setSelectedMaterials(
      selectedMaterials.filter((m) => m.id !== materialToRemove)
    );
    setMaterialToRemove(null);
  };

  const calculateTotal = () => {
    const materialsTotal = selectedMaterials.reduce(
      (sum, material) => sum + material.price * material.quantity,
      0
    );
    const labor = parseFloat(laborCost) || 0;
    const additional = parseFloat(additionalCost) || 0;
    const qty = parseFloat(quantity) || 1;

    // Total Cost includes Labor (User wants to see Total Price = 50 when Mat=20, Labor=30)
    const unitCost = materialsTotal + labor + additional;
    return unitCost * qty;
  };

  const calculateFinalPrice = () => {
    const totalCost = calculateTotal();
    if (priceMode === "selling") {
      return parseFloat(sellingPrice) || 0;
    } else {
      // Margin mode
      const margin = parseFloat(profitMargin) || 0;
      if (marginType === "percentage") {
        // Selling price = Cost / (1 - margin/100)
        return margin > 0 ? totalCost / (1 - margin / 100) : totalCost;
      } else {
        // Margin amount
        return totalCost + margin;
      }
    }
  };

  const calculateProfitMargin = () => {
    const totalCost = calculateTotal(); // Includes Labor
    const finalPrice = calculateFinalPrice();
    const labor = (parseFloat(laborCost) || 0) * (parseFloat(quantity) || 1);

    if (finalPrice === 0 || totalCost === 0)
      return { percentage: 0, amount: 0, grossAmount: 0, grossPercentage: 0 };

    // Gross Profit = Selling Price - Total Cost
    const grossProfitAmount = finalPrice - totalCost;
    const grossProfitPercentage = (grossProfitAmount / finalPrice) * 100;

    // Net Profit = Gross Profit + Labor Charge
    const netProfitAmount = grossProfitAmount + labor;
    const netProfitPercentage = (netProfitAmount / finalPrice) * 100;

    return {
      percentage: netProfitPercentage,
      amount: netProfitAmount,
      grossAmount: grossProfitAmount,
      grossPercentage: grossProfitPercentage,
    };
  };

  const total = calculateTotal();
  const unitCost = total / (parseFloat(quantity) || 1);
  const materialsTotal = selectedMaterials.reduce(
    (sum, m) => sum + m.price * m.quantity,
    0
  );
  const finalPrice = calculateFinalPrice();
  const unitFinalPrice = finalPrice / (parseFloat(quantity) || 1);
  const margin = calculateProfitMargin();

  // Update selling price when margin changes
  useEffect(() => {
    if (priceMode === "margin" && profitMargin) {
      const materialsTotal = selectedMaterials.reduce(
        (sum, material) => sum + material.price * material.quantity,
        0
      );
      const labor = parseFloat(laborCost) || 0;
      const additional = parseFloat(additionalCost) || 0;
      const qty = parseFloat(quantity) || 1;

      // Cost basis for margin calculation excludes labor (since labor is profit)
      const costBasis = (materialsTotal + additional) * qty;

      const margin = parseFloat(profitMargin) || 0;
      let calculatedPrice = 0;

      if (marginType === "percentage") {
        // Selling Price = CostBasis / (1 - Margin%)
        calculatedPrice =
          margin > 0 && margin < 100
            ? costBasis / (1 - margin / 100)
            : costBasis;
      } else {
        // Selling Price = CostBasis + MarginAmount
        calculatedPrice = costBasis + margin;
      }

      const currentPrice = parseFloat(sellingPrice) || 0;
      if (Math.abs(calculatedPrice - currentPrice) > 0.01) {
        setSellingPrice(calculatedPrice.toFixed(2));
      }
    }
  }, [
    priceMode,
    profitMargin,
    marginType,
    selectedMaterials,
    laborCost,
    additionalCost,
    quantity,
    sellingPrice,
  ]);

  // Update margin when selling price changes
  useEffect(() => {
    if (priceMode === "selling" && sellingPrice) {
      const materialsTotal = selectedMaterials.reduce(
        (sum, material) => sum + material.price * material.quantity,
        0
      );
      const labor = parseFloat(laborCost) || 0;
      const additional = parseFloat(additionalCost) || 0;
      const qty = parseFloat(quantity) || 1;

      // Cost basis for margin calculation excludes labor
      const costBasis = (materialsTotal + additional) * qty;

      const selling = parseFloat(sellingPrice) || 0;
      if (selling > 0 && costBasis > 0) {
        // Margin % = ((Selling - CostBasis) / Selling) * 100
        const marginPercent = ((selling - costBasis) / selling) * 100;
        const currentMargin = parseFloat(profitMargin) || 0;
        if (Math.abs(marginPercent - currentMargin) > 0.01) {
          setProfitMargin(marginPercent.toFixed(2));
        }
      }
    }
  }, [
    priceMode,
    sellingPrice,
    selectedMaterials,
    laborCost,
    additionalCost,
    quantity,
    profitMargin,
  ]);

  const handleSaveProduct = async () => {
    if (selectedMaterials.length === 0) {
      alert("Please select materials first");
      return;
    }

    const productData = {
      productId: product.id,
      productName: product.title,
      customName: customName || product.title,
      productDescription: customDescription || product.description,
      customDescription: customDescription || product.description,
      productImage: product.image,
      productPhoto: productPhoto || uploadedPhoto || null,
      materials: selectedMaterials,
      materialsCount: selectedMaterials.length,
      materialsList: selectedMaterials.map((m) => m.name).join(", "),
      quantity: parseFloat(quantity) || 1,
      laborCost: parseFloat(laborCost) || 0,
      additionalCost: parseFloat(additionalCost) || 0,
      totalCost: total,
      unitCost: unitCost,
      sellingPrice: finalPrice,
      unitPrice: unitFinalPrice,
      profitMargin: margin.percentage,
      profitAmount: margin.amount,
      date: new Date(),
    };

    try {
      if (editingProductId) {
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error("Failed to update product");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) throw new Error("Failed to save product");
      }
      router.push("/");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  return (
    <div className='min-h-screen bg-white animate-fade-in'>
      {/* Minimal Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.push(`/products/${product.id}`)}
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
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {product.title}
              </h1>
              <p className='text-gray-600 mt-1'>{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Product Details & Materials */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Product Details */}
            <div className='bg-white border border-gray-200 rounded-lg p-6 animate-scale-in'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Product Details
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Name
                    </label>
                    <input
                      type='text'
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={product.title}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Description
                    </label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={5}
                      placeholder='Describe the custom details'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Product Photo
                  </label>
                  <div className='space-y-2'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-all'
                    />
                  </div>
                  {(productPhoto || uploadedPhoto) && (
                    <div className='mt-3'>
                      <img
                        src={uploadedPhoto || productPhoto}
                        alt='Product preview'
                        className='w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200'
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {!productPhoto && !uploadedPhoto && (
                    <div className='mt-3 h-48 w-full max-w-xs border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 bg-gray-50'>
                      Upload an image to preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Materials Summary */}
            {selectedMaterials.length > 0 && (
              <div className='bg-white border border-gray-200 rounded-lg p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Selected Materials
                </h2>
                <div className='space-y-3'>
                  {selectedMaterials.map((material) => (
                    <div
                      key={material.id}
                      className='group flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      {material.image && (
                        <img
                          src={material.image}
                          alt={material.name}
                          className='w-12 h-12 object-cover rounded-lg flex-shrink-0'
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-900 text-sm'>
                          {material.name}
                        </div>
                        <div className='text-xs text-gray-600'>
                          NPR {material.price} / {material.unit}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300'>
                          <label className='text-xs text-gray-700'>Qty:</label>
                          <input
                            type='number'
                            value={material.quantity}
                            onChange={(e) =>
                              updateMaterialQuantity(
                                material.id,
                                e.target.value
                              )
                            }
                            min='0.01'
                            step='0.01'
                            className='w-20 px-2 py-1 border-0 focus:ring-0 text-sm font-medium'
                          />
                        </div>
                        <div className='text-right min-w-[100px]'>
                          <div className='font-semibold text-gray-900'>
                            NPR{" "}
                            {(material.price * material.quantity).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className='text-gray-400 hover:text-red-600 cursor-pointer p-1 transition-colors opacity-0 group-hover:opacity-100'
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
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-gray-900'>
                        Materials Total:
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        NPR {materialsTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Costs & Pricing */}
          <div className='space-y-6'>
            {/* Cost Inputs */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Cost Details
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Quantity
                  </label>
                  <input
                    type='number'
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder='1'
                    min='1'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                  />
                </div>
              </div>
            </div>

            {/* Pricing Mode */}
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Pricing
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Labor Charge (NPR)
                  </label>
                  <input
                    type='number'
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    placeholder='0.00'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Additional Charge (NPR)
                  </label>
                  <input
                    type='number'
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(e.target.value)}
                    placeholder='0.00'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Pricing Mode
                  </label>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setPriceMode("selling")}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        priceMode === "selling"
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Selling Price
                    </button>
                    <button
                      onClick={() => setPriceMode("margin")}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        priceMode === "margin"
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Profit Margin
                    </button>
                  </div>
                </div>

                {priceMode === "selling" ? (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Selling Price (NPR)
                    </label>
                    <input
                      type='number'
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder='0.00'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                    />
                    {margin.percentage !== 0 && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Margin: {margin.percentage.toFixed(1)}% (NPR{" "}
                        {margin.amount.toFixed(2)})
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Margin Type
                      </label>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => setMarginType("percentage")}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            marginType === "percentage"
                              ? "bg-pink-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Percentage
                        </button>
                        <button
                          onClick={() => setMarginType("amount")}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            marginType === "amount"
                              ? "bg-pink-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Amount
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Profit Margin{" "}
                        {marginType === "percentage" ? "(%)" : "(NPR)"}
                      </label>
                      <input
                        type='number'
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(e.target.value)}
                        placeholder={
                          marginType === "percentage" ? "0.00" : "0.00"
                        }
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all'
                      />
                      {finalPrice > 0 && (
                        <p className='text-xs text-gray-500 mt-1'>
                          Selling Price: NPR {finalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Sheet Display */}
            <div className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm'>
              <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-bold text-gray-900'>
                  Financial Summary
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                {/* Revenue */}
                <div className='flex justify-between items-center pb-4 border-b border-gray-100'>
                  <span className='text-gray-600 font-medium'>
                    Selling Price (Revenue)
                  </span>
                  <span className='text-xl font-bold text-gray-900'>
                    NPR {finalPrice.toFixed(2)}
                  </span>
                </div>

                {/* COGS */}
                <div className='space-y-2 pb-4 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                    Cost Breakdown
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Materials</span>
                    <span className='text-gray-900'>
                      NPR{" "}
                      {(materialsTotal * (parseFloat(quantity) || 1)).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Labor Charge</span>
                    <span className='text-gray-900'>
                      NPR{" "}
                      {(
                        parseFloat(laborCost || 0) * (parseFloat(quantity) || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Additional Charge</span>
                    <span className='text-gray-900'>
                      NPR{" "}
                      {(
                        parseFloat(additionalCost || 0) *
                        (parseFloat(quantity) || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pt-2 font-medium'>
                    <span className='text-gray-800'>Total Cost</span>
                    <span className='text-red-600'>
                      - NPR {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit */}
                <div className='pt-2 space-y-3'>
                  {/* Gross Profit */}
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium text-gray-600'>
                      Gross Profit (SP - Cost)
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        margin.grossAmount >= 0
                          ? "text-gray-900"
                          : "text-red-600"
                      }`}
                    >
                      NPR {margin.grossAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Add Labor */}
                  <div className='flex justify-between items-center text-sm text-blue-600 border-b border-gray-100 pb-2'>
                    <span>+ Labor Charge</span>
                    <span>
                      NPR{" "}
                      {(
                        parseFloat(laborCost || 0) * (parseFloat(quantity) || 1)
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* Net Profit */}
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-lg font-bold text-gray-900'>
                        Net Profit
                      </span>
                      <span className='text-2xl font-bold text-green-600'>
                        NPR {margin.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm text-gray-500'>
                      <span>Net Margin</span>
                      <span>{margin.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProduct}
              disabled={selectedMaterials.length === 0 || finalPrice === 0}
              className='w-full px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              Save Product
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!materialToRemove}
        title='Remove Material'
        message='Are you sure you want to remove this material from the selection?'
        onConfirm={confirmRemoveMaterial}
        onCancel={() => setMaterialToRemove(null)}
        confirmText='Remove'
        isDangerous={true}
      />
    </div>
  );
}
