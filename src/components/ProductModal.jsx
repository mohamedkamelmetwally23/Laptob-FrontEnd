import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

const unique = values => [...new Set(values.filter(Boolean))].sort();

export default function ProductModal({ form, setForm, editing, items, close, submit }) {
  const related = useMemo(() => {
    const modelRows = form.model ? items.filter(item => item.model === form.model) : items;
    const processorRows = form.processor ? modelRows.filter(item => item.processor === form.processor) : modelRows;
    const ramRows = form.ram ? processorRows.filter(item => item.ram === form.ram) : processorRows;
    return {
      brands: unique(items.map(item => item.brand)),
      models: unique(items.map(item => item.model)),
      processors: unique(modelRows.map(item => item.processor)),
      rams: unique(processorRows.map(item => item.ram)),
      storages: unique(ramRows.map(item => item.storage)),
    };
  }, [items, form.model, form.processor, form.ram]);

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    if (key === 'model') {
      const matchingRows = items.filter(item => item.model === value);
      const brands = unique(matchingRows.map(item => item.brand));
      if (brands.length === 1) next.brand = brands[0];
      next.processor = '';
      next.ram = '';
      next.storage = '';
    }
    if (key === 'processor') {
      next.ram = '';
      next.storage = '';
    }
    if (key === 'ram') next.storage = '';
    setForm(next);
  };

  const field = (key, label, type = 'text', placeholder = '', options = []) => <label>
    <span>{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} required value={form[key]} list={options.length ? `${key}-options` : undefined} placeholder={placeholder} onChange={event => update(key, event.target.value)}/>
    {!!options.length && <datalist id={`${key}-options`}>{options.map(option => <option value={option} key={option}/>)}</datalist>}
  </label>;

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && close()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><h2>{editing ? 'تعديل بيانات اللاب' : 'إضافة لاب جديد'}</h2><p>اختار من البيانات المسجلة أو اكتب بيانات جهاز جديد</p></div><button type="button" onClick={close}><X/></button></div>
      <div className="form-grid">
        {field('model', 'الموديل', 'text', 'مثال: Latitude 5420', related.models)}
        {field('brand', 'الماركة', 'text', 'مثال: Dell', related.brands)}
        {field('processor', 'المعالج', 'text', 'Intel Core i5', related.processors)}
        {field('ram', 'الرام', 'text', '16 GB', related.rams)}
        {field('storage', 'التخزين', 'text', '512 GB SSD', related.storages)}
        {field('price', 'السعر', 'number', '0')}
        {field('quantity', 'الكمية', 'number', '0')}
      </div>
      <div className="modal-actions"><button type="button" className="secondary" onClick={close}>إلغاء</button><button className="primary" type="submit"><Check size={18}/>{editing ? 'حفظ التعديلات' : 'إضافة الجهاز'}</button></div>
    </form>
  </div>;
}
