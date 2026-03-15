// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    const role = sessionStorage.getItem('simpeta_role');
    const fullName = sessionStorage.getItem('simpeta_fullName');
    if (!role) window.location.href = 'index.html';

    // Elemen
    const elements = {
        displayName: document.getElementById('displayName'),
        displayRole: document.getElementById('displayRole'),
        welcomeSpan: document.querySelector('#welcomeMessage span'),
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        menuToggle: document.getElementById('menuToggle'),
        logoutBtn: document.getElementById('logoutBtn'),
        currentDate: document.getElementById('currentDate'),
        statsGrid: document.getElementById('statsGrid'),
        recentTable: document.getElementById('recentTable'),
        chartCanvas: document.getElementById('suratChart')
    };

    // Set user info
    elements.displayName.textContent = fullName;
    elements.displayRole.textContent = role;
    elements.welcomeSpan.textContent = fullName;

    // Tanggal
    const now = new Date();
    elements.currentDate.textContent = now.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // Data dummy (akan diambil dari localStorage, untuk demo kita generate)
    let suratData = JSON.parse(localStorage.getItem('simpeta_surat')) || generateDummyData(120);
    localStorage.setItem('simpeta_surat', JSON.stringify(suratData));

    // Statistik
    const total = suratData.length;
    const pending = suratData.filter(s => s.STATUS === 'Pending').length;
    const selesai = suratData.filter(s => s.STATUS === 'Selesai').length;
    const disetujui = suratData.filter(s => s.STATUS === 'Disetujui').length;
    elements.statsGrid.innerHTML = `
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-envelope"></i></div><div class="stat-info"><h3>Total Surat</h3><div class="stat-number">${total}</div><div class="stat-desc">Semua</div></div></div>
        <div class="stat-card"><div class="stat-icon yellow"><i class="fas fa-clock"></i></div><div class="stat-info"><h3>Pending</h3><div class="stat-number">${pending}</div><div class="stat-desc">Menunggu</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>Disetujui</h3><div class="stat-number">${disetujui}</div><div class="stat-desc">Approved</div></div></div>
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-check-double"></i></div><div class="stat-info"><h3>Selesai</h3><div class="stat-number">${selesai}</div><div class="stat-desc">Completed</div></div></div>
    `;

    // Tabel recent (5 terbaru)
    const recent = suratData.slice(-5).reverse();
    elements.recentTable.innerHTML = `
        <table>
            <thead><tr><th>No.Surat</th><th>Dari</th><th>Perihal</th><th>Tgl Masuk</th><th>Status</th></tr></thead>
            <tbody>
                ${recent.map(s => `<tr><td>${s['NOMOR SURAT']}</td><td>${s['DARI']}</td><td>${s['PERIHAL']}</td><td>${s['TANGGAL TERIMA']}</td><td><span class="status-badge status-${s['STATUS'].toLowerCase()}">${s['STATUS']}</span></td></tr>`).join('')}
            </tbody>
        </table>
    `;

    // Chart (group by bulan)
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const monthlyCount = Array(12).fill(0);
    suratData.forEach(s => {
        const d = new Date(s['TANGGAL SURAT']);
        monthlyCount[d.getMonth()]++;
    });
    new Chart(elements.chartCanvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Jumlah Surat',
                data: monthlyCount,
                backgroundColor: '#3498db'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Event listeners
    elements.sidebarToggle.addEventListener('click', () => elements.sidebar.classList.toggle('collapsed'));
    elements.menuToggle.addEventListener('click', () => elements.sidebar.classList.toggle('mobile-open'));
    elements.logoutBtn.addEventListener('click', () => { sessionStorage.clear(); window.location.href='index.html'; });
});

// Fungsi generate data dummy sesuai spesifikasi
function generateDummyData(count) {
    const extInt = ['EKSTERNAL', 'INTERNAL'];
    const dariList = ['Kementerian A', 'Dinas B', 'Perusahaan C', 'Universitas D', 'PT XYZ', 'CV Abadi', 'Yayasan Sejahtera', 'Kantor Pusat', 'Cabang Bandung', 'Mitra Kerja'];
    const perihalList = ['Permintaan Data', 'Pengajuan Kerjasama', 'Undangan Rapat', 'Pemberitahuan'];
    const statusList = ['Pending', 'Disetujui', 'Ditolak', 'Selesai'];
    const data = [];
    for (let i = 1; i <= count; i++) {
        const extIntVal = extInt[Math.floor(Math.random() * extInt.length)];
        const dari = dariList[Math.floor(Math.random() * dariList.length)];
        const nomorSurat = `${Math.floor(100 + Math.random()*900)}/${String.fromCharCode(65+Math.floor(Math.random()*26)) + String.fromCharCode(65+Math.floor(Math.random()*26))}/202${4+Math.floor(Math.random()*3)}`;
        const tglSurat = new Date(2023, 7, 24 + Math.floor(Math.random() * 300)); // antara Aug 2023 - Mar 2026
        const tglTerima = new Date(tglSurat.getTime() + Math.floor(Math.random()*6)*24*60*60*1000);
        const perihal = perihalList[Math.floor(Math.random() * perihalList.length)];
        const keterangan = `Paragraf ${i%3+1}. Ini adalah keterangan untuk surat nomor ${i}. `;
        const status = statusList[Math.floor(Math.random() * statusList.length)];
        let tglSelesai = '';
        if (status === 'Selesai') {
            tglSelesai = new Date(tglTerima.getTime() + Math.floor(Math.random()*6)*24*60*60*1000).toLocaleDateString('en-CA');
        }
        data.push({
            'NO': i,
            'EXT/INT': extIntVal,
            'DARI': dari,
            'NOMOR SURAT': nomorSurat,
            'TANGGAL SURAT': tglSurat.toLocaleDateString('en-CA'),
            'TANGGAL TERIMA': tglTerima.toLocaleDateString('en-CA'),
            'PERIHAL': perihal,
            'KETERANGAN': keterangan,
            'STATUS': status,
            'TANGGAL SELESAI': tglSelesai
        });
    }
    return data;
}