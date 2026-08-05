const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const number = value => Number(String(value ?? '').replace(/[^\d.-]/g, '')) || 0;

function getBrand(model) {
  const value = model.toUpperCase();
  if (value.includes('HP') || value.includes('ELITEBOOK') || value.includes('PROBOOK')) return 'HP';
  if (value.includes('LATITUDE') || value.includes('PRECISION') || value.includes('DELL')) return 'Dell';
  if (value.includes('THINKPAD') || value.includes('LENOVO')) return 'Lenovo';
  return 'غير محدد';
}

function cleanModel(value) {
  return text(value)
    .replace(/FALCON\s+LAPTOP\s+NEW\s+SHIPMENT/gi, '')
    .replace(/^HP\s+/i, '')
    .trim();
}

export function parseLaptopSheet(sheet, XLSX) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  if (!rows.length) return [];

  const heading = rows[0].map(text);
  const capacity = heading.join(' ').match(/PRICE\s*(\d+)\s*G?\s*[-–]\s*(\d+)/i);
  const ram = capacity ? `${capacity[1]} GB` : '';
  const storage = capacity ? `${capacity[2]} GB` : '';
  let currentModel = cleanModel(heading[0]);
  const result = [];

  rows.slice(1).forEach((row, index) => {
    const processor = text(row[0]);
    const price = number(row[1]);
    const quantity = number(row[2]);
    if (!processor) return;

    // A specification row always has a price. A row without one is a model heading.
    if (price > 0) {
      result.push({
        id: Date.now() + index,
        brand: getBrand(currentModel),
        model: currentModel || 'موديل غير محدد',
        processor,
        ram,
        storage,
        price,
        quantity,
      });
    } else {
      currentModel = cleanModel(processor);
    }
  });

  return result;
}
