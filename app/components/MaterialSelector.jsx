"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

export default function MaterialSelector({
  product,
  allMaterials,
  onMaterialsSelected,
}) {
  const router = useRouter();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [materialsList, setMaterialsList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    price: "",
    unit: "per piece",
    category: "beads",
    image: "",
  });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const inferCategory = (id) => {
    if (!id) return "beads";
    if (id.startsWith("bead-")) return "beads";
    if (id.startsWith("thread-")) return "threads";
    if (id.startsWith("finding-")) return "findings";
    if (id.startsWith("accessory-")) return "accessories";
    return "beads";
  };

  // initialize materials with category tagging + persisted custom
  useEffect(() => {
    const base = allMaterials.map((m) => ({
      ...m,
      category: m.category || inferCategory(m.id),
    }));
    const customStored = localStorage.getItem("customMaterials");
    const custom = customStored ? JSON.parse(customStored) : [];
    setMaterialsList([...base, ...custom]);
  }, [allMaterials]);

  const groupedMaterials = useMemo(() => {
    return materialsList.reduce((acc, material) => {
      const category = material.category || "beads";
      if (!acc[category]) acc[category] = [];
      acc[category].push(material);
      return acc;
    }, {});
  }, [materialsList]);

  // Filter materials based on search
  const filterMaterials = (materials) => {
    if (!searchTerm) return materials;
    return materials.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleMaterial = (material) => {
    const isSelected = selectedMaterials.some((m) => m.id === material.id);
    if (isSelected) {
      setSelectedMaterials(
        selectedMaterials.filter((m) => m.id !== material.id)
      );
    } else {
      setSelectedMaterials([
        ...selectedMaterials,
        { ...material, quantity: 1 },
      ]);
    }
  };

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleEditMaterial = (material) => {
    setNewMaterial({
      name: material.name,
      price: material.price,
      unit: material.unit,
      category: material.category || inferCategory(material.id),
      image: material.image || "",
    });
    setEditingMaterialId(material.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.price) {
      alert("Please add a name and price for the material");
      return;
    }

    let updated;
    if (editingMaterialId) {
      // Update existing
      updated = materialsList.map((m) =>
        m.id === editingMaterialId
          ? {
              ...m,
              ...newMaterial,
              price: parseFloat(newMaterial.price) || 0,
            }
          : m
      );
      setEditingMaterialId(null);
    } else {
      // Add new
      const material = {
        ...newMaterial,
        id: `custom-${Date.now()}`,
        price: parseFloat(newMaterial.price) || 0,
      };
      updated = [...materialsList, material];
    }

    const custom = updated.filter((m) => m.id.startsWith("custom-"));
    localStorage.setItem("customMaterials", JSON.stringify(custom));
    setMaterialsList(updated);
    setNewMaterial({
      name: "",
      price: "",
      unit: "per piece",
      category: "beads",
      image: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteMaterial = (id) => {
    setMaterialToDelete(id);
  };

  const confirmDeleteMaterial = () => {
    if (!materialToDelete) return;
    const id = materialToDelete;
    const updated = materialsList.filter((m) => m.id !== id);
    const custom = updated.filter((m) => m.id.startsWith("custom-"));
    localStorage.setItem("customMaterials", JSON.stringify(custom));
    setMaterialsList(updated);
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== id));
    setMaterialToDelete(null);
  };

  const handleAddMaterialImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMaterial((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProceed = () => {
    if (selectedMaterials.length === 0) {
      alert("Please select at least one material");
      return;
    }
    // Save to sessionStorage
    sessionStorage.setItem(
      `materials_${product.id}`,
      JSON.stringify(selectedMaterials)
    );
    onMaterialsSelected(selectedMaterials);
    router.push(`/products/${product.id}/calculate`);
  };

  const selectedTotal = selectedMaterials.reduce(
    (sum, m) => sum + m.price * m.quantity,
    0
  );

  return (
    <div className='min-h-screen bg-white animate-fade-in'>
      {/* Minimal Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center gap-4'>
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
          {/* Left Column - Materials Grid */}
          <div className='lg:col-span-2'>
            {/* Minimal Search Bar + Add */}
            <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
              <div className='relative flex-1'>
                <svg
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search materials...'
                  className='w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all'
                />
              </div>
              <button
                type='button'
                onClick={() => setShowAddForm((v) => !v)}
                className='px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors cursor-pointer'
              >
                {showAddForm ? "Close" : "Add Material"}
              </button>
            </div>

            {/* Add Material */}
            {showAddForm && (
              <div className='mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4 animate-scale-in'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-md font-semibold text-gray-900'>
                    Add Material
                  </h3>
                  <span className='text-xs text-gray-500'>
                    Custom inventory
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Name
                    </label>
                    <input
                      type='text'
                      placeholder='Material Name'
                      value={newMaterial.name}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Price
                    </label>
                    <input
                      type='number'
                      placeholder='Price'
                      value={newMaterial.price}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          price: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Unit
                    </label>
                    <input
                      type='text'
                      placeholder='Unit'
                      value={newMaterial.unit}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, unit: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Category
                    </label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          category: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm'
                    >
                      <option value='beads'>Beads</option>
                      <option value='threads'>Threads</option>
                      <option value='findings'>Findings</option>
                      <option value='accessories'>Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Image
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) =>
                        handleAddMaterialImage(e.target.files?.[0])
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
                    />
                    {newMaterial.image && (
                      <div className='mt-2'>
                        <img
                          src={newMaterial.image}
                          alt='Preview'
                          className='w-full h-32 object-cover rounded-lg border border-gray-200'
                        />
                      </div>
                    )}
                  </div>
                  <div className='flex items-end gap-2'>
                    <button
                      onClick={handleAddMaterial}
                      className='flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors cursor-pointer h-[42px]'
                    >
                      {editingMaterialId ? "Update" : "Save"}
                    </button>
                    {editingMaterialId && (
                      <button
                        onClick={() => {
                          setEditingMaterialId(null);
                          setNewMaterial({
                            name: "",
                            price: "",
                            unit: "per piece",
                            category: "beads",
                            image: "",
                          });
                          setShowAddForm(false);
                        }}
                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer h-[42px]'
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Materials Grid - Minimal Design */}
            <div className='space-y-8'>
              {Object.entries(groupedMaterials).map(([category, materials]) => {
                const filtered = filterMaterials(materials);
                if (filtered.length === 0) return null;
                const isCollapsed = collapsedCategories[category];

                return (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className='w-full flex items-center justify-between mb-4 cursor-pointer hover:text-pink-600 transition-colors'
                    >
                      <h2 className='text-lg font-semibold text-gray-900 capitalize'>
                        {category}
                      </h2>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          isCollapsed ? "rotate-180" : ""
                        }`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </button>

                    {!isCollapsed && (
                      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {filtered.map((material) => {
                          const isSelected = selectedMaterials.some(
                            (m) => m.id === material.id
                          );

                          return (
                            <div
                              key={material.id}
                              onClick={() => toggleMaterial(material)}
                              className={`
                                group relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer hover-lift animate-scale-in
                                ${
                                  isSelected
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }
                              `}
                            >
                              {/* Material Image */}
                              <div className='relative h-32 overflow-hidden bg-gray-100'>
                                {material.image ? (
                                  <img
                                    src={material.image}
                                    alt={material.name}
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center text-3xl'>
                                    📦
                                  </div>
                                )}
                                {isSelected && (
                                  <div className='absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center'>
                                    <svg
                                      className='w-4 h-4 text-white'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                )}
                                <div className='absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMaterial(material);
                                    }}
                                    className='w-7 h-7 bg-white/80 backdrop-blur text-gray-700 rounded-full flex items-center justify-center hover:text-blue-600 hover:bg-white cursor-pointer shadow-sm'
                                    title='Edit material'
                                  >
                                    <svg
                                      className='w-4 h-4'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMaterial(material.id);
                                    }}
                                    className='w-7 h-7 bg-white/80 backdrop-blur text-gray-700 rounded-full flex items-center justify-center hover:text-red-600 hover:bg-white cursor-pointer shadow-sm'
                                    title='Delete material'
                                  >
                                    <svg
                                      className='w-4 h-4'
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

                              {/* Material Info */}
                              <div className='p-3'>
                                <h3 className='font-medium text-gray-900 text-sm mb-1 line-clamp-2'>
                                  {material.name}
                                </h3>
                                <p className='text-xs text-gray-600'>
                                  NPR {material.price} / {material.unit}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Selected Materials Summary */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8'>
              {/* Selected Materials Summary - Minimal */}
              {selectedMaterials.length > 0 ? (
                <div className='bg-gray-50 rounded-lg border border-gray-200 p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Selected Materials
                    </h3>
                    <span className='text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200'>
                      {selectedMaterials.length}
                    </span>
                  </div>
                  <div className='space-y-2 mb-4 max-h-96 overflow-y-auto'>
                    {selectedMaterials.map((material) => (
                      <div
                        key={material.id}
                        className='flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200'
                      >
                        <div className='flex items-center gap-3 min-w-0 flex-1'>
                          {material.image && (
                            <img
                              src={material.image}
                              alt={material.name}
                              className='w-8 h-8 object-cover rounded flex-shrink-0'
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <span className='font-medium text-sm text-gray-900 truncate'>
                            {material.name}
                          </span>
                        </div>
                        <span className='text-sm text-gray-600 flex-shrink-0 ml-2'>
                          NPR {material.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className='pt-4 border-t border-gray-200'>
                    <div className='flex justify-between items-center mb-4'>
                      <span className='text-sm font-medium text-gray-700'>
                        Total Materials Cost:
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        NPR {selectedTotal.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleProceed}
                      className='w-full px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    >
                      Continue to Calculator
                    </button>
                  </div>
                </div>
              ) : (
                <div className='bg-gray-50 rounded-lg border border-gray-200 p-6 text-center'>
                  <p className='text-gray-500'>Select materials to continue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!materialToDelete}
        title='Remove Material'
        message='Are you sure you want to remove this material? This action cannot be undone.'
        onConfirm={confirmDeleteMaterial}
        onCancel={() => setMaterialToDelete(null)}
        confirmText='Remove'
        isDangerous={true}
      />
    </div>
  );
}
