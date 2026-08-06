import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import Products from './components/Products';
import ProductModal from './components/ProductModal';
import { emptyForm } from './data/laptops';
import { parseLaptopSheet } from './utils/excelParser';
import { laptopApi } from './services/laptopApi';
import { UiProvider } from './UiContext';
import './styles.css';

const initialFilters = { search: '', model: '', processor: '', ram: '', storage: '', priceRange: '' };
const unique = (items, key) => [...new Set(items.map(item => item[key]).filter(Boolean))].sort();
const priceRanges = {
  'من 5 إلى 10 آلاف': [5000, 10000],
  'من 10 إلى 15 ألف': [10000, 15000],
  'من 15 إلى 20 ألف': [15000, 20000],
  '25 ألف فأكثر': [25000, Infinity],
};

function matchesFilters(item, filters, excludedFilter = '') {
  const allText = Object.values(item).join(' ').toLowerCase();
  const selectedRange = priceRanges[filters.priceRange];
  return (!filters.search || excludedFilter === 'search' || allText.includes(filters.search.toLowerCase()))
    && (!filters.model || excludedFilter === 'model' || item.model === filters.model)
    && (!filters.processor || excludedFilter === 'processor' || item.processor === filters.processor)
    && (!filters.ram || excludedFilter === 'ram' || item.ram === filters.ram)
    && (!filters.storage || excludedFilter === 'storage' || item.storage === filters.storage)
    && (!selectedRange || excludedFilter === 'priceRange' || (item.price >= selectedRange[0] && item.price < selectedRange[1]));
}

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const inputRef = useRef();

  useEffect(() => {
    laptopApi.list()
      .then(setItems)
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);
  const availableItems = useMemo(() => items.filter(item => Number(item.quantity) > 0), [items]);
  const filterOptions = useMemo(() => {
    const availableFor = key => availableItems.filter(item => matchesFilters(item, filters, key));
    const priceItems = availableFor('priceRange');
    return {
      models: unique(availableFor('model'), 'model'),
      processors: unique(availableFor('processor'), 'processor'),
      rams: unique(availableFor('ram'), 'ram'),
      storages: unique(availableFor('storage'), 'storage'),
      priceRanges: Object.entries(priceRanges)
        .filter(([, [min, max]]) => priceItems.some(item => item.price >= min && item.price < max))
        .map(([label]) => label),
    };
  }, [availableItems, filters]);
  const filtered = useMemo(() => availableItems.filter(item => matchesFilters(item, filters)), [availableItems, filters]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = item => { setEditing(item.id); setForm(item); setModal(true); };
  const submit = async e => {
    e.preventDefault();
    const clean = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      setError('');
      const saved = editing ? await laptopApi.update(editing, clean) : await laptopApi.create(clean);
      setItems(current => editing ? current.map(item => item.id === editing ? saved : item) : [saved, ...current]);
      setModal(false);
    } catch (requestError) { setError(requestError.message); }
  };
  const remove = async id => {
    try {
      setError('');
      await laptopApi.remove(id);
      setItems(current => current.filter(item => item.id !== id));
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
  };
  const importFile = async e => {
    const file = e.target.files[0]; if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer());
    const mapped = parseLaptopSheet(wb.Sheets[wb.SheetNames[0]], XLSX);
    if (mapped.length) {
      try {
        setError('');
        setLoading(true);
        const inserted = await laptopApi.import(mapped);
        setItems(current => [...inserted, ...current]);
      } catch (requestError) { setError(requestError.message); }
      finally { setLoading(false); }
    }
    e.target.value = '';
  };
  const exportData = () => {
    const sheet = XLSX.utils.json_to_sheet(items.map(({id, ...x}) => x));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Laptops');
    XLSX.writeFile(book, 'laptops-stock.xlsx');
  };

  return <div className="app-shell">
    <main className="single-page">
      <Header openAdd={openAdd}/>
      <Products items={filtered} allCount={availableItems.length} loading={loading} error={error} filters={filters} setFilters={setFilters} filterOptions={filterOptions} resetFilters={() => setFilters(initialFilters)} openEdit={openEdit} remove={remove} importFile={importFile} exportData={exportData} inputRef={inputRef}/>
    </main>
    {modal && <ProductModal
      form={form}
      setForm={setForm}
      editing={editing}
      items={items}
      close={() => setModal(false)}
      submit={submit}
      onDelete={async () => { if (await remove(editing)) setModal(false); }}
    />}
  </div>;
}

createRoot(document.getElementById('root')).render(<UiProvider><App/></UiProvider>);
