const service = document.querySelector('#service');
const hours = document.querySelector('#hours');
const diag = document.querySelector('#diag');
const tools = document.querySelector('#tools');
const total = document.querySelector('#total');
const dateInput = document.querySelector('#date');
const timeSelect = document.querySelector('#time');
const form = document.querySelector('#book');
const success = document.querySelector('#success');
const endTime = document.querySelector('#endTime');
const summaryDate = document.querySelector('#summaryDate');
const summaryDuration = document.querySelector('#summaryDuration');

function calc() {
  const h = Number(hours.value);
  let p = Number(service.value) * h;
  if (diag.checked) p += 3490;
  if (tools.checked) p += 1990 * h;
  total.textContent = new Intl.NumberFormat('hu-HU').format(p) + ' Ft';
  return p;
}

function localDateISO(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

dateInput.min = localDateISO();

function populateTimes() {
  timeSelect.innerHTML = '<option value="">Időpont kiválasztása…</option>';
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    const option = document.createElement('option');
    option.value = `${h}:${m}`;
    option.textContent = `${h}:${m}`;
    timeSelect.appendChild(option);
  }
}
populateTimes();

function updatePastTimes() {
  const today = localDateISO();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  [...timeSelect.options].forEach(option => {
    if (!option.value) return;
    const [h, m] = option.value.split(':').map(Number);
    const optionMinutes = h * 60 + m;
    option.disabled = dateInput.value === today && optionMinutes < currentMinutes + 30;
  });
  if (timeSelect.selectedOptions[0]?.disabled) timeSelect.value = '';
  updateBookingSummary();
}

function formatDateHU(value) {
  if (!value) return '-';
  const [y, m, d] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(y, m - 1, d));
}

function updateBookingSummary() {
  const date = dateInput.value;
  const time = timeSelect.value;
  const duration = Number(hours.value || 0);
  summaryDate.textContent = date && time ? `${formatDateHU(date)} · ${time}` : '-';
  summaryDuration.textContent = `${duration} ${duration === 1 ? 'óra' : 'óra'}`;

  if (!time) {
    endTime.textContent = '-';
    return;
  }
  const [h, m] = time.split(':').map(Number);
  const finish = h * 60 + m + duration * 60;
  if (finish > 24 * 60) {
    endTime.textContent = 'következő nap';
  } else {
    endTime.textContent = `${String(Math.floor(finish / 60)).padStart(2, '0')}:${String(finish % 60).padStart(2, '0')}`;
  }
}

[service, hours, diag, tools].forEach(x => x.addEventListener('change', () => { calc(); updateBookingSummary(); }));
dateInput.addEventListener('change', updatePastTimes);
timeSelect.addEventListener('change', updateBookingSummary);
updatePastTimes();
calc();

function getFormData() {
  return {
    name: document.querySelector('#name').value.trim(),
    email: document.querySelector('#email').value.trim(),
    phone: document.querySelector('#phone').value.trim(),
    vehicle: document.querySelector('#vehicle').value,
    service: service.options[service.selectedIndex].text,
    service_price: Number(service.value),
    date: dateInput.value,
    time: timeSelect.value,
    duration_hours: Number(hours.value),
    diagnostics: diag.checked,
    special_tools: tools.checked,
    note: document.querySelector('#note').value.trim() || null,
    total_price: calc()
  };
}

function getEndTimeText(data) {
  const [h, m] = data.time.split(':').map(Number);
  const finish = h * 60 + m + data.duration_hours * 60;
  if (finish > 24 * 60) return 'következő nap';
  return `${String(Math.floor(finish / 60)).padStart(2, '0')}:${String(finish % 60).padStart(2, '0')}`;
}

function createBookingText(data) {
  return `CSINÁLD MAGAD MŰHELY - FOGLALÁS\n\nNév: ${data.name}\nE-mail: ${data.email}\nTelefonszám: ${data.phone}\nJármű: ${data.vehicle}\nSzolgáltatás: ${data.service}\nDátum: ${data.date}\nKezdés: ${data.time}\nBefejezés: ${getEndTimeText(data)}\nIdőtartam: ${data.duration_hours} óra\nDiagnosztika: ${data.diagnostics ? 'Igen' : 'Nem'}\nSpeciális szerszámcsomag: ${data.special_tools ? 'Igen' : 'Nem'}\nMegjegyzés: ${data.note || '-'}\n\nVárható összeg: ${new Intl.NumberFormat('hu-HU').format(data.total_price)} Ft\n`;
}
function downloadTxt(data) {
  const blob = new Blob([createBookingText(data)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = data.name.replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '');
  a.href = url;
  a.download = `foglalas_${data.date}_${data.time.replace(':', '-')}_${safeName || 'ugyfel'}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  updatePastTimes();
  if (!form.reportValidity()) return;
  if (!timeSelect.value) {
    timeSelect.focus();
    return;
  }

  const data = getFormData();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'TXT készítése…';
  success.style.display = 'none';

  downloadTxt(data);
  success.textContent = `✓ A foglalás TXT fájlja elkészült: ${formatDateHU(data.date)} ${data.time}-${getEndTimeText(data)}.`;
  success.className = 'success success-visible';
  success.style.display = 'block';
  submitButton.disabled = false;
  submitButton.textContent = 'Foglalás mentése TXT-be';
});


const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
