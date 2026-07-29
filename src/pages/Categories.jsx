import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/redux/slices/categorySlice';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import CategoryOverview from '@/components/categories/CategoryOverview';
import InsightCard from '@/components/dashboard/InsightCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import CategorySkeleton from '@/components/categories/CategorySkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ChartCard } from '@/components/charts';

// Icons & Utilities
import { formatCurrency } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import {
  Tags, Plus, Pencil, Trash2, X, Lock, Target, TrendingUp, PiggyBank,
  Sparkles, ShieldAlert, PieChart, Search, Filter, ShieldCheck, Layers, LayoutGrid, List
} from 'lucide-react';
import toastService from '@/services/toastService';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Categories() {
  const dispatch = useDispatch();
  const { list: cats, loading } = useSelector((s) => s.categories);
  const { isInitialized } = useSelector((s) => s.auth);
  const { categoryExpenses: rawCategoryExpenses, monthlyExpense } = useSelector((s) => s.dashboard);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchCategories());
      dispatch(fetchDashboard());
    }
  }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing._id, name })).unwrap();
        toastService.success('Category updated successfully!');
      } else {
        await dispatch(createCategory({ name })).unwrap();
        toastService.success('Category created successfully!');
      }
      setModalOpen(false);
      setName('');
      setEditing(null);
    } catch (err) {
      toastService.error(err || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      toastService.success('Category deleted');
    } catch (err) {
      toastService.error(err || 'Failed to delete category');
    }
  };

  // Dynamic Category Metrics from real Redux state
  const builtinCount = cats.filter((c) => c.isBuiltin).length;
  const customCount = cats.filter((c) => !c.isBuiltin).length;

  const allocationData = (rawCategoryExpenses || []).map((c, i) => ({
    name: c.name,
    value: c.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const topCategory = allocationData.length > 0 ? allocationData[0].name : 'None';

  // Filtered Category List
  const filteredCats = cats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Activity Timeline List
  const activityList = cats.slice(0, 5).map((c) => ({
    id: c._id,
    title: c.isBuiltin ? 'Built-in System Category' : 'Custom Category Active',
    description: `Category "${c.name}" configured for financial reporting`,
    timestamp: new Date().toISOString(),
    dotColor: c.isBuiltin ? 'bg-blue-500' : 'bg-purple-500',
  }));

  if (loading && !cats.length) {
    return <CategorySkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Category Management Center"
          subtitle="Create, organize, and manage financial categories used throughout your application."
          onAddTransaction={() => {
            setEditing(null);
            setName('');
            setModalOpen(true);
          }}
          onExport={() => toastService.success('Categories list exported')}
        />
      </motion.div>

      {/* 2. CATEGORY OVERVIEW HERO */}
      <motion.div variants={itemVariants}>
        <CategoryOverview
          totalCats={cats.length}
          builtinCount={builtinCount}
          customCount={customCount}
          topCategory={topCategory}
        />
      </motion.div>

      {/* 3. SUMMARY KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Categories"
          value={cats.length}
          icon={Tags}
          color="blue"
          subtitle="Registered spending & income groups"
        />
        <StatCard
          title="Built-in Categories"
          value={builtinCount}
          icon={Lock}
          color="purple"
          subtitle="System default protected categories"
        />
        <StatCard
          title="Custom Categories"
          value={customCount}
          icon={Layers}
          color="emerald"
          subtitle="User created custom categories"
        />
        <StatCard
          title="Top Category"
          value={topCategory}
          icon={Sparkles}
          color="rose"
          subtitle="Highest spending allocation"
        />
      </motion.div>

      {/* 4. CATEGORY DISTRIBUTION & INSIGHTS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Category Expense Distribution">
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <RePieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                    {allocationData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0F172A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Tags} title="No category distribution" description="Log transactions to view spending distribution." />
            )}
          </ChartCard>
        </div>

        {/* INSIGHTS */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Category System Insights
          </h3>
          <div className="space-y-3">
            <InsightCard
              icon={ShieldCheck}
              headline="Protected Built-in Groups"
              explanation={`Your workspace has ${builtinCount} protected system categories to ensure accurate reporting.`}
              color="emerald"
            />
            <InsightCard
              icon={Sparkles}
              headline="Custom Flexibility"
              explanation={`You have created ${customCount} custom categories tailored to your financial workflows.`}
              color="blue"
            />
          </div>
        </div>
      </motion.div>

      {/* 5. SEARCH, FILTERS & CATEGORY MANAGEMENT TABLE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-border rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditing(null);
                setName('');
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>

        {/* 6. CATEGORIES TABLE OR GRID */}
        {filteredCats.length > 0 ? (
          viewMode === 'table' ? (
            <div className="glass-card overflow-hidden border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="px-5 py-3.5">Category Name</th>
                      <th className="px-5 py-3.5">Category Type</th>
                      <th className="px-5 py-3.5">Access Protection</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCats.map((cat) => (
                      <tr key={cat._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="px-5 py-4 text-xs font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                              <Tags className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {cat.isBuiltin ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              Built-in System
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Custom User Category
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {cat.isBuiltin ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Lock className="w-3 h-3" /> System Protected
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Full Access
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditing(cat);
                                setName(cat.name);
                                setModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {!cat.isBuiltin && (
                              <button
                                onClick={() => handleDelete(cat)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCats.map((cat) => (
                <div key={cat._id} className="p-5 rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Tags className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {cat.isBuiltin ? 'System Built-in' : 'Custom Category'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(cat);
                          setName(cat.name);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!cat.isBuiltin && (
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={Tags}
            title="You haven't created any categories yet"
            description="Organize your transactions by creating your first category."
            actionText="Add Category"
            onAction={() => {
              setEditing(null);
              setName('');
              setModalOpen(true);
            }}
          />
        )}
      </motion.div>

      {/* 8. ACTIVITY TIMELINE */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Category System Timeline
        </h3>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <ActivityTimeline activities={activityList} />
        </div>
      </motion.div>

      {/* EDIT / CREATE CATEGORY MODAL */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {editing ? 'Edit Category' : 'Create Category'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Groceries, Travel, Shopping"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95">
                  {editing ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
