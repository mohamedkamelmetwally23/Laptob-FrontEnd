import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUi } from '../UiContext';

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter(page => page > 0 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) result.push(`gap-${page}`);
    result.push(page);
  });
  return result;
}

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const { isArabic } = useUi();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalItems);

  return <div className="pagination">
    <div className="pagination-summary">{isArabic ? 'عرض' : 'Showing'} <b>{start}–{end}</b> {isArabic ? 'من' : 'of'} <b>{totalItems}</b> {isArabic ? 'جهاز' : 'devices'}</div>
    <div className="pagination-controls">
      <button className="page-arrow" disabled={page === 1} onClick={() => onPageChange(page - 1)} title={isArabic ? 'السابق' : 'Previous'}>{isArabic ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
      {pageNumbers(page, totalPages).map(item => typeof item === 'string'
        ? <span className="page-gap" key={item}>•••</span>
        : <button className={page === item ? 'page-number active' : 'page-number'} onClick={() => onPageChange(item)} key={item}>{item}</button>)}
      <button className="page-arrow" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} title={isArabic ? 'التالي' : 'Next'}>{isArabic ? <ChevronLeft size={17}/> : <ChevronRight size={17}/>}</button>
    </div>
    <label className="page-size">{isArabic ? 'صفوف الصفحة' : 'Rows per page'}<select value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label>
  </div>;
}
