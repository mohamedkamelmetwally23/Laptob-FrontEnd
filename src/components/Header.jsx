import { Plus } from 'lucide-react';

export default function Header({ openAdd }) {
  return <header><div><h1>إدارة اللابات</h1><p>ارفع ملف Excel وهتظهر بيانات الأجهزة في الجدول</p></div><button className="primary" onClick={openAdd}><Plus size={18}/> إضافة لاب</button></header>;
}
