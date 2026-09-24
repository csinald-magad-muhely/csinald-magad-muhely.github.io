const service = document.querySelector('#service');
const hours = document.querySelector('#hours');
const diag = document.querySelector('#diag');
const tools = document.querySelector('#tools');
const total = document.querySelector('#total');

function calc() {
    const h = +hours.value;
    let p = +service.value * h;
    if (diag.checked) p += 3490;
    if (tools.checked) p += 1990 * h;
    total.textContent = new Intl.NumberFormat('hu-HU').format(p) + ' Ft';
    return p;
}

[service, hours, diag, tools].forEach(x => x.addEventListener('change', calc));
calc();

document.querySelector('#date').min = new Date().toISOString().split('T')[0];

document.querySelector('#book').addEventListener('submit', e => {
    e.preventDefault();

    const selectedService = service.options[service.selectedIndex].text;
    const selectedVehicle = document.querySelector('#vehicle').value;
    const selectedHours = hours.options[hours.selectedIndex].text;
    const price = calc();

    const bookingText = `CSINÁLD MAGAD MŰHELY – FOGLALÁS

` +
        `Név: ${document.querySelector('#name').value}
` +
        `E-mail: ${document.querySelector('#email').value}
` +
        `Telefonszám: ${document.querySelector('#phone').value}
` +
        `Jármű: ${selectedVehicle}
` +
        `Szolgáltatás: ${selectedService}
` +
        `Dátum: ${document.querySelector('#date').value}
` +
        `Időtartam: ${selectedHours}
` +
        `Diagnosztika: ${diag.checked ? 'Igen' : 'Nem'}
` +
        `Speciális szerszámcsomag: ${tools.checked ? 'Igen' : 'Nem'}
` +
        `Megjegyzés: ${document.querySelector('#note').value || '-'}

` +
        `Várható összeg: ${new Intl.NumberFormat('hu-HU').format(price)} Ft
`;

    const blob = new Blob([bookingText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foglalas_${document.querySelector('#date').value}_${document.querySelector('#name').value.trim().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    document.querySelector('#success').style.display = 'block';
});
