import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, PlusCircle, ArrowLeft, Tag, User, Phone, Mail, MapPin, Clock, Star, MessageSquare, Camera, X, Info, Search, Filter, ExternalLink, QrCode, CheckCircle2, Key, Copy, Sparkles, Building2, Trash2, Edit3 } from 'lucide-react';
import ShopDetailsModal from '../../components/admin/ShopDetailsModal';
import { formatTime } from '../../utils/timeUtils';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/shops`;

export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingShopId, setEditingShopId] = useState(null); // Tracks edit mode

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
    phoneNo: '',
    altPhoneNo: '',
    address: '',
    openingTime: '',
    closingTime: '',
    initialRating: '',
    totalReviews: '',
    directionUrl: '',
    plan: 'free',
    status: 'inactive'
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingShops, setFetchingShops] = useState(true);

  // Modal / Success Toast Notification state
  const [createdShopModal, setCreatedShopModal] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // ==========================================
  // 1. FETCH ALL SHOPS (GET)
  // ==========================================
  const fetchShops = async () => {
    setFetchingShops(true);
    try {
      const response = await axios.get(API_BASE_URL);
      console.log(response);

      setShops(response.data.data);
    } catch (err) {
      console.error('Error fetching shops:', err);
      alert('Failed to load shops from backend.');
    } finally {
      setFetchingShops(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setGalleryImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setGalleryImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!editingShopId && !formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNo.replace(/\s+/g, ''))) {
      newErrors.phoneNo = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    return newErrors;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      shopName: '',
      ownerName: '',
      email: '',
      password: '',
      phoneNo: '',
      altPhoneNo: '',
      address: '',
      openingTime: '',
      closingTime: '',
      initialRating: '',
      totalReviews: '',
      directionUrl: '',
      plan: 'free',
      status: 'inactive'
    });
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setGalleryImageFiles([]);
    setGalleryImagePreviews([]);
    setErrors({});
    setEditingShopId(null);
  };

  // ==========================================
  // 2. CREATE (POST) & UPDATE (PUT)
  // ==========================================
const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validateForm();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setLoading(true);

  const payload = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (key !== 'password' || !editingShopId) {
      payload.append(key, value);
    }
  });

  if (profileImageFile) {
    payload.append("profile_image", profileImageFile);
  }

  galleryImageFiles.forEach((file) => {
    payload.append("images", file);
  });

  try {
    if (editingShopId) {
      // =========================
      // UPDATE SHOP
      // =========================
      await axios.put(
        `${API_BASE_URL}/${editingShopId}`,
        payload
      );

      alert("Shop updated successfully!");
    } else {
      // =========================
      // CREATE SHOP
      // =========================
      const response = await axios.post(
        API_BASE_URL,
        payload
      );

      setCreatedShopModal(response.data);

      alert("Shop created successfully!");
    }

    // IMPORTANT:
    // Fetch latest shops from backend
    await fetchShops();

    // Reset form
    resetForm();

    // Go back to shop list
    setActiveTab("list");

  } catch (err) {
    console.error("Error saving shop:", err);

    alert(
      err.response?.data?.message ||
      "Failed to save shop. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  // Setup form for Editing
  const handleEdit = (shop) => {
    setEditingShopId(shop._id || shop.id);
    setFormData({
      shopName: shop.shopName || '',
      ownerName: shop.ownerName || '',
      email: shop.email || '',
      password: '',
      phoneNo: shop.phoneNo || '',
      altPhoneNo: shop.altPhoneNo || '',
      address: shop.address || '',
      openingTime: shop.openingTime?.slice(0, 5) || '',
      closingTime: shop.closingTime?.slice(0, 5) || '',
      initialRating: shop.initialRating || '',
      totalReviews: shop.totalReviews || '',
      directionUrl: shop.directionUrl || '',
      plan: shop.plan || 'free',
      status: shop.status || 'inactive'
    });
    setProfileImageFile(null);
    setProfileImagePreview(shop.profile_image || null);
    setGalleryImageFiles([]);
    setGalleryImagePreviews(shop.images || []);
    setActiveTab('add');
  };

  // ==========================================
  // 3. DELETE (DELETE)
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setShops(shops.filter(shop => (shop._id !== id && shop.id !== id)));
    } catch (err) {
      console.error('Error deleting shop:', err);
      alert('Failed to delete shop.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Filtered Shops List
  const filteredShops = (Array.isArray(shops) ? shops : []).filter((shop) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      (shop?.shopName || "").toLowerCase().includes(query) ||
      (shop?.ownerName || "").toLowerCase().includes(query) ||
      (shop?.address || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || shop?.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#fffdf9]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif text-stone-900 leading-tight">
                Shop Central
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">Manage and onboard retail partners</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${activeTab === 'list'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>Shops Directory</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-stone-200 text-stone-700 rounded-full">
                {shops.length}
              </span>
            </button>

            <button
              onClick={() => { resetForm(); setActiveTab('add'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${activeTab === 'add'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingShopId ? 'Edit Shop' : 'Add New Shop'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ========================================================================= */}
        {/* TAB 1: ADD / EDIT SHOP FORM                                               */}
        {/* ========================================================================= */}
        {activeTab === 'add' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab('list'); resetForm(); }}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors border border-stone-200 bg-white"
                  title="Back to Directory"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {editingShopId ? 'Edit Shop Details' : 'Add New Shop'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    {editingShopId ? 'Update existing shop credentials and info' : 'Create a new shop profile to get started'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Auto-generates QR Code & Owner Login</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Image Upload Box Column */}
                <div className="lg:col-span-4 order-first lg:order-last">
                  <div className="bg-[#fffdf9] p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 sticky top-24">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Profile image
                    </label>

                    {profileImagePreview ? (
                      <div className="relative group rounded-xl overflow-hidden border border-stone-200 h-48 sm:h-56 lg:h-64 bg-stone-100">
                        <img
                          src={profileImagePreview}
                          alt="Shop preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => { setProfileImageFile(null); setProfileImagePreview(null); }}
                            className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-transform transform hover:scale-105 shadow-md flex items-center gap-1 text-xs font-medium px-3"
                          >
                            <X className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/30 rounded-xl h-48 sm:h-56 lg:h-64 cursor-pointer p-4 text-center transition-all group">
                        <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-orange-100 text-stone-500 group-hover:text-orange-600 flex items-center justify-center transition-colors mb-3">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-stone-800 group-hover:text-orange-700">Tap to add profile image</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">(optional)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Gallery images</label>
                        <label className="cursor-pointer text-xs font-semibold text-orange-600 hover:text-orange-700">
                          <PlusCircle className="inline w-3.5 h-3.5 mr-1" />Add images
                          <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                        </label>
                      </div>
                      {galleryImagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {galleryImagePreviews.map((image, index) => (
                            <div key={`${image}-${index}`} className="h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                              <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400">These files are uploaded separately from the profile image.</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields Column */}
                <div className="lg:col-span-8 order-last lg:order-first space-y-6">

                  {/* Shop Information */}
                  <section className="bg-[#fffdf9] p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-stone-900">Shop Information</h3>
                        <p className="text-xs text-stone-500">Provide basic details about the shop</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Shop name <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleInputChange}
                            placeholder="e.g. Nashik Misal House"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.shopName ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                              } rounded-lg outline-hidden focus:ring-3 transition-all`}
                          />
                        </div>
                        {errors.shopName && <p className="text-[11px] text-rose-600 mt-1">{errors.shopName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Owner name <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            placeholder="Full name of owner"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.ownerName ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                              } rounded-lg outline-hidden focus:ring-3 transition-all`}
                          />
                        </div>
                        {errors.ownerName && <p className="text-[11px] text-rose-600 mt-1">{errors.ownerName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Email <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="owner@example.com"
                            required
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                              } rounded-lg outline-hidden focus:ring-3 transition-all`}
                          />
                        </div>
                        {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                      </div>

                      {!editingShopId && (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Password <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Create owner password"
                              required
                              className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.password ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                                } rounded-lg outline-hidden focus:ring-3 transition-all`}
                            />
                          </div>
                          {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Phone number <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            name="phoneNo"
                            maxLength="10"
                            value={formData.phoneNo}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.phoneNo ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                              } rounded-lg outline-hidden focus:ring-3 transition-all`}
                          />
                        </div>
                        {errors.phoneNo && <p className="text-[11px] text-rose-600 mt-1">{errors.phoneNo}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Alternate phone number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            name="altPhoneNo"
                            maxLength="10"
                            value={formData.altPhoneNo}
                            onChange={handleInputChange}
                            placeholder="Optional 10-digit number"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Address <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Full shop address"
                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border ${errors.address ? 'border-rose-500 focus:ring-rose-200' : 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
                              } rounded-lg outline-hidden focus:ring-3 transition-all`}
                          />
                        </div>
                        {errors.address && <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Optional Details */}
                  <section className="bg-[#fffdf9] p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-stone-900">Optional Details</h3>
                        <p className="text-xs text-stone-500">Additional information about your shop</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Opening time</label>
                        <input type="time" name="openingTime" value={formData.openingTime} onChange={handleInputChange} className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Closing time</label>
                        <input type="time" name="closingTime" value={formData.closingTime} onChange={handleInputChange} className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Initial rating</label>
                          <div className="relative">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              name="initialRating"
                              value={formData.initialRating}
                              onChange={handleInputChange}
                              placeholder="e.g. 4.5"
                              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Total reviews</label>
                          <div className="relative">
                            <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              name="totalReviews"
                              value={formData.totalReviews}
                              onChange={handleInputChange}
                              placeholder="e.g. 24"
                              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Direction URL</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="directionUrl"
                            value={formData.directionUrl}
                            onChange={handleInputChange}
                            placeholder="Paste Google Maps link"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Plan</label>
                          <select name="plan" value={formData.plan} onChange={handleInputChange} className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all">
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div> */}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Status</label>
                          <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg outline-hidden focus:border-orange-500 focus:ring-3 focus:ring-orange-200 transition-all">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('list'); resetForm(); }}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 font-semibold text-xs sm:text-sm text-stone-700 transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingShopId ? 'Updating...' : 'Creating shop...'}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>{editingShopId ? 'Update Shop' : 'Create Shop'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SHOPS DIRECTORY / LIST VIEW                                       */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Registered Shops</h2>
                <p className="text-xs sm:text-sm text-stone-500">View and manage all onboarding profiles</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search shop, owner, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                <div className="relative flex items-center">
                  <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-8 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-medium text-stone-700 focus:outline-hidden focus:border-orange-500 appearance-none cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {fetchingShops ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-stone-500">Loading shops from server...</p>
              </div>
            ) : filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredShops.map((shop) => {
                  const shopId = shop._id || shop.id;
                  return (
                    <div
                      key={shopId}
                      className="bg-[#fffdf9] rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                    >
                      <div className="relative h-44 bg-stone-100 overflow-hidden">
                        <img
                          src={shop.profileImage ||  "https://ik.imagekit.io/nashikmisalqueue/shops/1791774931976-273d9305-d4f2-4acb-a03d-9801ebcb0e65.png?updatedAt=1791774963524"}
                          alt={shop.shopName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-md font-bold tracking-wider">
                          {shop?.id || shopId?.slice?.(-6) || "N/A"}
                        </div>

                        <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${shop.status?.toLowerCase() === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-300'
                          }`}>
                          {shop.status ? shop.status.charAt(0).toUpperCase() + shop.status.slice(1) : 'Active'}
                        </div>

                        {shop.initialRating && (
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 text-xs font-bold text-stone-800 shadow-xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{shop.initialRating}</span>
                            {shop.totalReviews && <span className="text-stone-400 font-normal">({shop.totalReviews})</span>}
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-base font-serif font-bold text-stone-900 leading-snug">
                              {shop.shopName}
                            </h3>

                            {/* EDIT & DELETE ACTIONS */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(shop)}
                                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                                title="Edit Shop"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(shopId)}
                                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                                title="Delete Shop"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="font-medium text-stone-800">{shop.ownerName}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{shop.phoneNo}</span>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{shop.address}</span>
                            </div>

                            {shop.openingTime && (
                              <div className="flex items-center gap-2 pt-1 text-stone-500">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>
                                  {formatTime(shop.openingTime)} - {formatTime(shop.closingTime)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setCreatedShopModal(shop)}
                            className="flex items-center gap-1 text-orange-600 font-bold hover:text-orange-700 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View QR & Credentials</span>
                          </button>

                          {shop.directionUrl && (
                            <a
                              href={shop.directionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Open Google Maps"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
                <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">No shops found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or filter to find what you are looking for.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Render Modal */}
      <ShopDetailsModal
        createdShopModal={createdShopModal}
        onClose={() => setCreatedShopModal(null)}
      />

    </div>
  );
}