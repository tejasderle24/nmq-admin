import React, { useState, useEffect, useCallback } from 'react';
import {
  createAdvertisementApi,
  deleteAdvertisementApi,
  getAdvertisementsApi,
  getAdvertisementStatisticsApi,
  updateAdvertisementApi,
  updateAdvertisementStatusApi
} from '../../api/advertisements.api';
import api from '../../api/axios';
import AdvertisementImageCropper from '../../components/AdvertisementImageCropper';

const PLACEMENT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'shop_list', label: 'Shop Listing Banner' },
  { value: 'checkout', label: 'Checkout Screen' },
  { value: 'home_top', label: 'Home Top Banner' }
];

const EMPTY_FORM = {
  event_title: '',
  image_url: '',
  image_file: null,
  redirect_url: '',
  cta_text: '',
  shop_id: null,
  placement: 'shop_list',
  display_order: 1,
  start_date: '',
  end_date: '',
  is_active: true
};

function formatDateForInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function AdvertisementManagement({
  navigate = () => { },
  refreshing = false,
  error = null,
  statistics = {
    total: 0,
    live: 0,
    impressions: 0,
    uniqueVisitors: 0,
    clicks: 0,
    uniqueClickers: 0,
    ctr: 0
  },
  performanceByPlacement = [
    { placement: 'shop_list', label: 'Shop Listing Banner', total: 6, live: 4, impressions: 25000, clicks: 1100, ctr: 4.4 },
    { placement: 'checkout', label: 'Checkout Screen', total: 4, live: 3, impressions: 15000, clicks: 600, ctr: 4.0 },
    { placement: 'home_top', label: 'Home Top Banner', total: 2, live: 1, impressions: 5200, clicks: 140, ctr: 2.69 }
  ],
  initialAdvertisements = []
}) {
  // TAB CONTROL ("list" | "create" | "edit")
  const [activeTab, setActiveTab] = useState('list');
  const [advertisements, setAdvertisements] = useState(initialAdvertisements);
  const [advertisementStatistics, setAdvertisementStatistics] = useState(statistics);
  const [selectedAdId, setSelectedAdId] = useState(null);

  // SEARCH & FILTER
  const [search, setSearch] = useState('');
  const [filterPlacement, setFilterPlacement] = useState('all_placements');

  // FORM STATES
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(true);
  const [apiError, setApiError] = useState('');

  const [cropFile, setCropFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const loadAdvertisements = async () => {
    try {
      setLoadingAdvertisements(true);
      setApiError('');
      const [result, statisticsResult] = await Promise.all([
        getAdvertisementsApi(),
        getAdvertisementStatisticsApi()
      ]);
      setAdvertisements(result.advertisements);
      setAdvertisementStatistics(statisticsResult);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to load advertisements.');
    } finally {
      setLoadingAdvertisements(false);
    }
  };

  // LOAD ADVERTISEMENTS AND SHOPS
  useEffect(() => {
    const loadData = async () => {
      try {
        setShopsLoading(true);
        const [advertisementResult, statisticsResult, shopsResponse] = await Promise.all([
          getAdvertisementsApi(),
          getAdvertisementStatisticsApi(),
          api.get('/shops')
        ]);
        setAdvertisements(advertisementResult.advertisements);
        setAdvertisementStatistics(statisticsResult);
        const shopsData = shopsResponse.data?.data ?? shopsResponse.data;
        const shopList = Array.isArray(shopsData) ? shopsData : shopsData?.shops ?? [];
        setShops(shopList.map((shop) => ({
          ...shop,
          id: shop.id ?? shop._id,
          name: shop.name ?? shop.shopName
        })));
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to load advertisements or shops.');
      } finally {
        setShopsLoading(false);
        setLoadingAdvertisements(false);
      }
    };
    loadData();
  }, []);

  // SWITCH TO CREATE TAB
  const handleOpenCreate = () => {
    setForm({ ...EMPTY_FORM });
    setImagePreview('');
    setFormError('');
    setSelectedAdId(null);
    setActiveTab('create');
  };

  // SWITCH TO EDIT TAB
  const handleOpenEdit = (ad) => {
    setSelectedAdId(ad.id);
    setForm({
      event_title: ad.event_title || '',
      image_url: ad.image_url || '',
      image_file: null,
      redirect_url: ad.redirect_url || '',
      cta_text: ad.cta_text || '',
      shop_id: ad.shop_id || null,
      placement: ad.placement || 'shop_list',
      display_order: ad.display_order ?? 1,
      start_date: formatDateForInput(ad.start_date),
      end_date: formatDateForInput(ad.end_date),
      is_active: ad.is_active ?? true
    });
    setImagePreview(ad.image_url || '');
    setFormError('');
    setActiveTab('edit');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  // const handleImageChange = (event) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   if (!file.type.startsWith('image/')) {
  //     setFormError('Please select a valid image file.');
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     setFormError('Image size must be less than 5 MB.');
  //     return;
  //   }

  //   handleFormChange('image_file', file);
  //   setImagePreview(URL.createObjectURL(file));
  // };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image.");
      return;
    }

    setFormError("");
    setCropFile(file);
    setShowCropper(true);
  };

  const handleCroppedImage = (file) => {
    setCropFile(null);
    setShowCropper(false);

    handleFormChange('image_file', file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const validateForm = () => {
    if (!form.event_title.trim()) return 'Event title is required.';
    if (!form.image_url && !form.image_file) return 'Please upload an advertisement banner.';
    if (!form.placement) return 'Please select placement.';
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      return 'End date cannot be before start date.';
    }
    return null;
  };

  const handleSaveAdvertisement = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    setSaving(true);
    try {
      const payload = activeTab === 'edit'
        ? await updateAdvertisementApi(selectedAdId, form)
        : await createAdvertisementApi(form);

      setAdvertisements((prev) => activeTab === 'create'
        ? [payload, ...prev]
        : prev.map((item) => (item.id === selectedAdId ? payload : item)));

      setActiveTab('list');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save advertisement.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    const advertisement = advertisements.find((ad) => ad.id === id);
    if (!advertisement) return;

    try {
      const updated = await updateAdvertisementStatusApi(id, !advertisement.is_active);
      setAdvertisements((prev) => prev.map((ad) => (ad.id === id ? updated : ad)));
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update advertisement status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteAdvertisementApi(id);
        setAdvertisements((prev) => prev.filter((ad) => ad.id !== id));
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to delete advertisement.');
      }
    }
  };

  // FILTER LOGIC
  const filteredAdvertisements = advertisements.filter((ad) => {
    const matchesSearch = ad.event_title.toLowerCase().includes(search.toLowerCase());
    const matchesPlacement =
      filterPlacement === 'all_placements' || ad.placement === filterPlacement;
    return matchesSearch && matchesPlacement;
  });

  const placementLabel = (val) => {
    const found = PLACEMENT_OPTIONS.find((p) => p.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-800">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-transform active:scale-95"
          >
            <i className="ti ti-arrow-left text-lg" />
          </button>
          <div>
            <h2 className="m-0 text-lg font-bold text-slate-900">Advertisement Management</h2>
            <p className="m-0 text-xs text-slate-500">Configure promotional banners and active tabs</p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'list'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <i className="ti ti-list mr-1.5" />
            All Ads ({advertisements.length})
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'create'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <i className="ti ti-plus mr-1.5" />
            Create Ad
          </button>
          {activeTab === 'edit' && (
            <button
              type="button"
              className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm"
            >
              <i className="ti ti-edit mr-1.5" />
              Edit Ad
            </button>
          )}
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="mx-auto max-w-5xl px-4 py-5">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <i className="ti ti-alert-circle text-base" />
            {error}
          </div>
        )}
        {apiError && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <span><i className="ti ti-alert-circle mr-2 text-base" />{apiError}</span>
            <button type="button" onClick={loadAdvertisements} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* TAB 1: ALL ADS LIST */}
        {activeTab === 'list' && (
          <>
            {/* STATS */}
            <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {[
                { label: 'Total Ads', value: advertisementStatistics.total, color: 'text-amber-600', icon: 'ti-photo' },
                { label: 'Live', value: advertisementStatistics.live, color: 'text-emerald-600', icon: 'ti-circle-check' },
                { label: 'Impressions', value: advertisementStatistics.impressions.toLocaleString(), color: 'text-purple-600', icon: 'ti-eye' },
                { label: 'Clicks', value: advertisementStatistics.clicks.toLocaleString(), color: 'text-cyan-600', icon: 'ti-pointer' },
                { label: 'CTR', value: `${advertisementStatistics.ctr}%`, color: 'text-orange-500', icon: 'ti-trending-up' }
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <i className={`ti ${s.icon} ${s.color} mb-1 block text-2xl`} />
                  <p className="m-0 text-xs text-slate-500">{s.label}</p>
                  <h3 className="m-0 text-xl font-bold text-slate-900">{s.value}</h3>
                </div>
              ))}
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search advertisements..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-10 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['all_placements', ...PLACEMENT_OPTIONS.map((p) => p.value)].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterPlacement(key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${filterPlacement === key
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {key === 'all_placements' ? 'All' : placementLabel(key)}
                  </button>
                ))}
              </div>
            </div>

            {/* CARDS LIST */}
            {loadingAdvertisements ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Loading advertisements...
              </div>
            ) : filteredAdvertisements.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                <i className="ti ti-photo-off mb-2 block text-4xl text-slate-400" />
                <p className="font-semibold text-slate-800">No advertisements found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredAdvertisements.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:flex-row"
                  >
                    <div className="relative aspect-[8/3] w-full bg-slate-100 sm:w-56">
                      <img src={ad.image_url} alt={ad.event_title} className="h-full w-full object-cover" />
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${ad.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}
                      >
                        {ad.is_active ? 'Live' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="m-0 text-sm font-bold text-slate-900">{ad.event_title}</h4>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Order #{ad.display_order}
                          </span>
                        </div>
                        <p className="m-0 mt-1 text-xs font-semibold text-blue-600">
                          {placementLabel(ad.placement)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ad)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(ad.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${ad.is_active
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                          {ad.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ad.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2 & 3: CREATE / EDIT TAB VIEW */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">
                  {activeTab === 'create' ? 'Create New Advertisement' : 'Edit Advertisement'}
                </h3>
                <p className="m-0 text-xs text-slate-500">
                  Fill in the details below to update banner settings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back to List
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAdvertisement} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Advertisement Title
                </label>
                <input
                  type="text"
                  value={form.event_title}
                  onChange={(e) => handleFormChange('event_title', e.target.value)}
                  placeholder="e.g. Festival Special Offer"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Banner Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />

                <p className="mt-1 text-[11px] text-slate-500">
                  Required banner size: <strong>1200 × 450 px</strong>
                </p>

                {imagePreview && (
                  <div className="relative mt-3 aspect-[1200/450] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="Advertisement Preview"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                      1200 × 450
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Placement
                  </label>
                  <select
                    value={form.placement}
                    onChange={(e) => handleFormChange('placement', e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-slate-400"
                  >
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Target Shop (Optional)
                  </label>
                  <select
                    value={form.shop_id || ''}
                    onChange={(e) => handleFormChange('shop_id', e.target.value || null)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-slate-400"
                  >
                    <option value="">All Shops</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Redirect Link
                  </label>
                  <input
                    type="text"
                    value={form.redirect_url}
                    onChange={(e) => handleFormChange('redirect_url', e.target.value)}
                    placeholder="https://..."
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => handleFormChange('display_order', e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-slate-800">
                  Publish Advertisement immediately
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="h-10 rounded-xl border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-xl bg-slate-900 px-6 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : activeTab === 'create' ? 'Create Ad' : 'Update Ad'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      {showCropper && cropFile && (
        <AdvertisementImageCropper
          file={cropFile}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setCropFile(null);
            setShowCropper(false);
          }}
        />
      )}
    </div>
  );
}