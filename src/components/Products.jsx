import { Download, FileSpreadsheet, Laptop, Pencil, Trash2, Upload } from 'lucide-react';
import { money } from '../data/laptops';
import LaptopFilters from './LaptopFilters';
import Pagination from './Pagination';
import { useEffect, useMemo, useState } from 'react';

export default function Products({
  items, allCount, loading, error, filters, setFilters, filterOptions, resetFilters,
  openEdit, remove, importFile, exportData, inputRef,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const visibleItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);

  useEffect(() => setPage(1), [items]);

  const changePageSize = size => {
    setPageSize(size);
    setPage(1);
  };

  return <section className="content">
    <div className="workspace">
      <div className="workspace-toolbar">
        <div>
          <span className="eyebrow">قاعدة بيانات المخزون</span>
          <h2>كل أجهزة اللابتوب</h2>
          <p>{allCount} جهاز مسجل • {items.length} نتيجة ظاهرة</p>
        </div>
        <div className="toolbar-actions">
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={importFile}/>
          <button className="import-button" onClick={() => inputRef.current.click()}><Upload size={18}/> رفع ملف Excel</button>
          <button className="secondary" onClick={exportData} disabled={!allCount}><Download size={17}/> تصدير البيانات</button>
        </div>
      </div>

      <LaptopFilters filters={filters} setFilters={setFilters} options={filterOptions} resultCount={items.length} onReset={resetFilters}/>

      {error && <div className="status-message error">{error}</div>}
      {loading && <div className="status-message loading">جاري تحميل البيانات...</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>الجهاز</th><th>المعالج</th><th>الرام</th><th>التخزين</th><th>السعر</th><th>الكمية</th><th>الإجراءات</th></tr></thead>
          <tbody>{visibleItems.map(item => <tr key={item.id}>
            <td><div className="product"><span><Laptop size={20}/></span><div><b>{item.model}</b><small>{item.brand}</small></div></div></td>
            <td><span className="processor-cell">{item.processor}</span></td>
            <td><span className="spec-pill">{item.ram || '—'}</span></td>
            <td><span className="spec-pill">{item.storage || '—'}</span></td>
            <td><b className="price-cell">{money(item.price)}</b></td>
            <td><span className={item.quantity <= 2 ? 'qty low' : 'qty'}>{item.quantity} جهاز</span></td>
            <td><div className="row-actions"><button onClick={() => openEdit(item)} title="تعديل"><Pencil size={17}/></button><button className="danger" onClick={() => remove(item.id)} title="حذف"><Trash2 size={17}/></button></div></td>
          </tr>)}</tbody>
        </table>
        {!loading && !items.length && <div className="empty"><FileSpreadsheet size={38}/><b>{allCount ? 'لا توجد نتائج مطابقة' : 'ابدأ برفع ملف Excel'}</b><span>{allCount ? 'غيّر الفلاتر أو امسحها لعرض البيانات' : 'سيتم حفظ بيانات الملف في MongoDB Atlas'}</span>{!allCount && <button className="import-button" onClick={() => inputRef.current.click()}><Upload size={17}/> اختيار ملف Excel</button>}</div>}
      </div>
      {!!items.length && <Pagination page={page} pageSize={pageSize} totalItems={items.length} onPageChange={setPage} onPageSizeChange={changePageSize}/>} 
    </div>
  </section>;
}
