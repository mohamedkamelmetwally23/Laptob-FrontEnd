import { Check, ChevronDown, Filter, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

function DropdownFilter({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const visibleOptions = useMemo(
    () => options.filter(option => option.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    const close = event => !rootRef.current?.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = option => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  return <div className="filter-field dropdown-filter" ref={rootRef}>
    <span>{label}</span>
    <button type="button" className={open ? 'dropdown-trigger open' : 'dropdown-trigger'} onClick={() => setOpen(current => !current)}>
      <b>{value || 'الكل'}</b><ChevronDown size={16}/>
    </button>
    {open && <div className="dropdown-menu">
      {options.length > 7 && <label className="dropdown-search"><Search size={15}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={`ابحث في ${label}...`}/></label>}
      <div className="dropdown-options">
        <button type="button" className={!value ? 'selected' : ''} onClick={() => choose('')}><span>الكل</span>{!value && <Check size={15}/>}</button>
        {visibleOptions.map(option => <button type="button" className={value === option ? 'selected' : ''} onClick={() => choose(option)} key={option}><span>{option}</span>{value === option && <Check size={15}/>}</button>)}
        {!visibleOptions.length && <div className="no-options">لا توجد نتائج</div>}
      </div>
    </div>}
  </div>;
}

export default function LaptopFilters({ filters, setFilters, options, resultCount, onReset }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }));

  return <div className="filter-box">
    <div className="filter-heading">
      <div><Filter size={18}/><b>تصفية الأجهزة</b><span>{resultCount} نتيجة</span></div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={15}/> مسح الفلاتر</button>
    </div>
    <label className="global-search"><Search size={19}/><input value={filters.search} onChange={event => update('search', event.target.value)} placeholder="ابحث في كل البيانات: الموديل، المعالج، الماركة..."/></label>
    <div className="filter-grid">
      <DropdownFilter label="الموديل" value={filters.model} options={options.models} onChange={value => update('model', value)}/>
      <DropdownFilter label="المعالج" value={filters.processor} options={options.processors} onChange={value => update('processor', value)}/>
      <DropdownFilter label="الرام" value={filters.ram} options={options.rams} onChange={value => update('ram', value)}/>
      <DropdownFilter label="التخزين" value={filters.storage} options={options.storages} onChange={value => update('storage', value)}/>
      <DropdownFilter label="فئة السعر" value={filters.priceRange} options={options.priceRanges} onChange={value => update('priceRange', value)}/>
    </div>
  </div>;
}
