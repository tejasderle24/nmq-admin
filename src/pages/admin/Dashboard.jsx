import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getShops } from "../../api/shop.api";
import { EllipsisVertical, EyeIcon } from 'lucide-react';

export default function AdminDashboard() {

  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalShops, setTotalShops] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(3);

  useEffect(() => {
    fetchShops();
  }, [page]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getShops(page, limit);

      if (response?.success) {
        const formattedShops = (response.data || []).map((shop) => ({
          id: shop.id,
          shop_id: `SHOP-${String(shop.id).padStart(4, "0")}`,
          name: shop.shopName,
          address: shop.address,
          status:
            shop.status === "active"
              ? "open"
              : shop.status === "inactive"
                ? "closed"
                : "paused",

          // Your API doesn't currently return queue_status
          queue_status: "active",

          profile_image: shop.profile_image || "",

          ownerId: shop.ownerId,
          ownerName: shop.ownerName,
          phoneNo: shop.phoneNo,
          altPhoneNo: shop.altPhoneNo,
          openingTime: shop.openingTime,
          closingTime: shop.closingTime,
          initialRating: shop.initialRating,
          totalReviews: shop.totalReviews,
          directionUrl: shop.directionUrl,
          plan: shop.plan,
          images: shop.images || [],
          menus: shop.menus || [],
        }));

        setShops(formattedShops);
        setTotalShops(response.count || 0);
      }
    } catch (err) {
      console.error("Fetch shops error:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch shops"
      );
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      totalShops: totalShops,
      activeShops: shops.filter((s) => s.status === "open").length,
      activeQueues: shops.filter(
        (s) => s.queue_status === "active"
      ).length,
      servedToday: 142,
    };
  }, [shops, totalShops]);

  // Search & Filter Logic
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        shop.name.toLowerCase().includes(search) ||
        shop.address.toLowerCase().includes(search) ||
        shop.shop_id.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'open' && shop.status === 'open') ||
        (statusFilter === 'paused' && shop.status === 'paused') ||
        (statusFilter === 'closed' && shop.status === 'closed');

      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, statusFilter]);

  const now = new Date();
  const today = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  {
    loading && (
      <div className="py-10 text-center text-sm text-[#8b7c72]">
        Loading shops...
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f5ef] text-[#2f211b] font-sans">
      <main className="w-full min-h-screen box-border">
        {/* HEADER (No Sidebar / No Sidebar Toggle) */}
        <header className="w-full min-h-[88px] flex flex-wrap items-center justify-between gap-6 px-4 sm:px-8 py-4 bg-[#fffdf9] border-b border-[#e7dfd5]">
          <div className="flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold tracking-widest text-[#b65a38] uppercase">
              DATE AND DAY
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#2f211b] m-0">
              Good evening, Admin <span className="inline-block">👋</span>
            </h1>
            <p className="text-xs text-[#7d7067] mt-1 m-0">
              Here's what's happening with your Nashik Misal Queue today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 border border-[#e7dfd5] rounded-xl bg-[#fff8f2] whitespace-nowrap">
            <div className="w-8 h-8 flex items-center justify-center bg-[#f9ece4] rounded-lg text-sm">
              📅
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#59473c]">{today}</span>
              <span className="text-[10px] text-[#a2a9b5]">◷ &nbsp; {currentTime}</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-7 pb-10">

          {/* OVERVIEW / STATS */}
          <section className="w-full mb-4 p-5 bg-[#fffdf9] border border-[#e7dfd5] rounded-xl box-border">
            <div className="mb-3.5">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2f211b] m-0">Overview</h2>
              <p className="text-xs text-[#7d7067] mt-1 m-0">Platform performance at a glance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Stat 1 */}
              <div className="p-4 border border-[#e7dfd5] rounded-xl bg-[#fffdf9] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg text-xs bg-[#f9e7dc] text-[#bf4c2a]">🏪</div>
                  <span className="text-[10px] font-bold tracking-wider text-[#937f73]">TOTAL SHOPS</span>
                </div>
                <div className="text-2xl font-bold text-center text-[#2f211b]">
                  {String(stats.totalShops).padStart(2, '0')}
                </div>
                <span className="block text-center text-[11px] text-[#8b7c72] mt-2">Registered on platform</span>
              </div>

              {/* Stat 2 */}
              <div className="p-4 border border-[#e7dfd5] rounded-xl bg-[#fffdf9] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg text-xs bg-[#e8f5ed] text-[#287a4b]">●</div>
                  <span className="text-[10px] font-bold tracking-wider text-[#937f73]">ACTIVE SHOPS</span>
                </div>
                <div className="text-2xl font-bold text-center text-[#2f211b]">
                  {String(stats.activeShops).padStart(2, '0')}
                </div>
                <span className="block text-center text-[11px] text-[#8b7c72] mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#287a4b] mr-1"></span>
                  Currently open
                </span>
              </div>

              {/* Stat 3 */}
              <div className="p-4 border border-[#e7dfd5] rounded-xl bg-[#fffdf9] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg text-xs bg-[#fff1db] text-[#a8660c]">👥</div>
                  <span className="text-[10px] font-bold tracking-wider text-[#937f73]">ACTIVE QUEUES</span>
                </div>
                <div className="text-2xl font-bold text-center text-[#2f211b]">
                  {String(stats.activeQueues).padStart(2, '0')}
                </div>
                <span className="block text-center text-[11px] text-[#8b7c72] mt-2">Accepting customers</span>
              </div>

              {/* Stat 4 */}
              <div className="p-4 border border-[#e7dfd5] rounded-xl bg-[#fffdf9] hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg text-xs bg-[#f4e9eb] text-[#9b3f4f]">✓</div>
                  <span className="text-[10px] font-bold tracking-wider text-[#937f73]">SERVED TODAY</span>
                </div>
                <div className="text-2xl font-bold text-center text-[#2f211b]">
                  {String(stats.servedToday).padStart(2, '0')}
                </div>
                <span className="block text-center text-[11px] text-[#8b7c72] mt-2">Customers completed</span>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="w-full mb-4 p-5 bg-[#fffdf9] border border-[#e7dfd5] rounded-xl box-border">
            <div className="mb-3.5">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2f211b] m-0">Quick Actions</h2>
              <p className="text-xs text-[#7d7067] mt-1 m-0">Frequently used actions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={()=>navigate("/admin/shops")} className="min-h-[70px] p-3 flex items-center gap-2.5 border border-[#e7dfd5] rounded-lg bg-white text-left cursor-pointer hover:border-[#dfa183] hover:shadow-sm transition-all">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-[#f9e7dc] text-[#bf4c2a] shrink-0">+</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#392b23] m-0 truncate">Add New Shop</p>
                  <p className="text-[10px] text-[#8b7c72] mt-0.5 m-0 truncate">Register a new shop</p>
                </div>
                <span className="text-sm text-[#c15a35] shrink-0">→</span>
              </button>

              <button onClick={()=>navigate("/admin/advertisements")} className="min-h-[70px] p-3 flex items-center gap-2.5 border border-[#e7dfd5] rounded-lg bg-white text-left cursor-pointer hover:border-[#dfa183] hover:shadow-sm transition-all">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-[#fff1db] text-[#a8660c] shrink-0">📣</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#392b23] m-0 truncate">Advertising</p>
                  <p className="text-[10px] text-[#8b7c72] mt-0.5 m-0 truncate">Manage your advertisements</p>
                </div>
                <span className="text-sm text-[#c15a35] shrink-0">→</span>
              </button>

              {/* <button className="min-h-[70px] p-3 flex items-center gap-2.5 border border-[#e7dfd5] rounded-lg bg-white text-left cursor-pointer hover:border-[#dfa183] hover:shadow-sm transition-all">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-[#e8f5ed] text-[#287a4b] shrink-0">+</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#392b23] m-0 truncate">New Ad</p>
                  <p className="text-[10px] text-[#8b7c72] mt-0.5 m-0 truncate">Create a new advertisement</p>
                </div>
                <span className="text-sm text-[#c15a35] shrink-0">→</span>
              </button> */}
            </div>
          </section>

          {/* SEARCH & FILTER */}
          <section className="w-full mb-4 p-5 bg-[#fff8f2] border border-[#e7dfd5] rounded-xl box-border">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2f211b] m-0">Search & Filter</h2>
                <p className="text-xs text-[#7d7067] mt-1 m-0">Find shops quickly</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#f9e7dc] text-[#a54b2b] text-[10px] font-bold">
                {filteredShops.length} shops
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_135px_34px] gap-2">
              <div className="h-9 flex items-center px-3 border border-[#ded5cb] rounded-lg bg-[#fffdf9]">
                <span className="mr-2 text-xs">🔍</span>
                <input
                  type="text"
                  className="w-full border-none outline-none bg-transparent text-xs text-[#514238] placeholder-[#a4adba]"
                  placeholder="Search shop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="h-9 px-2.5 border border-[#ded5cb] rounded-lg bg-[#fffdf9] text-xs text-[#514238] outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>

              <button className="h-9 border border-[#ded5cb] rounded-lg bg-[#fffdf9] text-[#514238] text-xs hover:bg-[#f8f9fb] cursor-pointer">
                ⚙
              </button>
            </div>
          </section>

          {/* SHOPS TABLE */}
          <section className="w-full mb-4 p-5 bg-[#fffdf9] border border-[#e7dfd5] rounded-xl box-border overflow-hidden">
            <div className="mb-3.5">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2f211b] m-0">All Shops</h2>
              <p className="text-xs text-[#7d7067] mt-1 m-0">Manage all registered shops</p>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead>
                  <tr className="bg-[#fcf7f1] text-[#937f73] text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-2.5 w-[38%]">SHOP</th>
                    <th className="p-2.5 w-[20%]">SHOP ID</th>
                    <th className="p-2.5 w-[14%]">STATUS</th>
                    <th className="p-2.5 w-[14%]">QUEUE</th>
                    <th className="p-2.5 w-[14%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e7df] text-xs text-[#5f5148]">
                  {filteredShops.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-[#9ca5b4]">
                        No shops found.
                      </td>
                    </tr>
                  ) : (
                    filteredShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-[#fff9f4] transition-colors">
                        <td className="p-2.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              className="w-8 h-8 rounded-lg object-cover bg-[#eee4d9] shrink-0"
                              src={shop.profile_image || 'https://via.placeholder.com/150'}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#392b23] text-xs m-0 truncate">
                                {shop.name}
                              </p>
                              <p className="text-[10px] text-[#918178] mt-0.5 m-0 truncate">
                                {shop.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-2.5 font-medium">{shop.shop_id}</td>

                        <td className="p-2.5">
                          {shop.status === 'open' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5ed] text-[#287a4b]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#287a4b]"></span>
                              Open
                            </span>
                          )}
                          {shop.status === 'paused' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fff1db] text-[#a8660c]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#a8660c]"></span>
                              Paused
                            </span>
                          )}
                          {shop.status === 'closed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f1f2f4] text-[#8b93a0]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8b93a0]"></span>
                              Closed
                            </span>
                          )}
                        </td>

                        <td className="p-2.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${shop.queue_status === 'active'
                              ? 'bg-[#f9e7dc] text-[#a94d2d]'
                              : 'bg-[#fff1db] text-[#a8660c]'
                              }`}
                          >
                            {shop.queue_status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>

                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              className="w-6 h-6 flex items-center justify-center border border-[#e4d8ce] rounded-md bg-[#fffdf9] text-[#a94d2d] text-xs hover:bg-[#f8f9fb] cursor-pointer"
                              title="View shop"
                            >
                              <EyeIcon size={14} />
                            </button>
                            <button
                              className="w-6 h-6 flex items-center justify-center border border-[#e4d8ce] rounded-md bg-[#fffdf9] text-[#a94d2d] text-xs hover:bg-[#f8f9fb] cursor-pointer"
                              title="Shop settings"
                            >
                              <EllipsisVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] text-[#9a8a80]">
              <span>
                Showing {filteredShops.length} of {shops.length} shops
              </span>
              <button
                onClick={() => navigate("/admin/shops")}
                className="text-[#b44f2d] font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                View all shops →
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 text-[10px] text-[#9a8a80] gap-1">
            <span>© 2026 Nashik Misal Queue</span>
            <span>Admin Console • v1.0.0</span>
          </footer>
        </div>
      </main>
    </div>
  );
}