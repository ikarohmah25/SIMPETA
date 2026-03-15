// js/surat-progress.js

// Define stages in order
const STAGES = ["Requested", "Scanned", "Interview", "Offer", "Boarding", "Storage", "Result"];
const STAGE_LABELS = {
    "Requested": "Permintaan Diajukan",
    "Scanned": "Dipindai",
    "Interview": "Wawancara",
    "Offer": "Penawaran",
    "Boarding": "Boarding",
    "Storage": "Penyimpanan",
    "Result": "Hasil",
    "Rejected": "Ditolak"
};

// Get current user info from session
function getUser() {
    return {
        role: sessionStorage.getItem('simpeta_role'),
        username: sessionStorage.getItem('simpeta_username'),
        fullName: sessionStorage.getItem('simpeta_fullName')
    };
}

// Initialize or load surat data from localStorage
function loadSuratData() {
    let data = localStorage.getItem('simpeta_surat');
    if (!data) {
        // Create some dummy data
        const dummy = generateDummyData(20);
        localStorage.setItem('simpeta_surat', JSON.stringify(dummy));
        return dummy;
    }
    return JSON.parse(data);
}

function saveSuratData(data) {
    localStorage.setItem('simpeta_surat', JSON.stringify(data));
}

// Generate dummy data with various statuses
function generateDummyData(count) {
    const dariList = ['Kementerian A', 'Dinas B', 'Perusahaan C', 'Universitas D', 'PT XYZ'];
    const perihalList = ['Permintaan Data', 'Pengajuan Kerjasama', 'Undangan Rapat', 'Pemberitahuan'];
    const users = ['staff', 'supervisor', 'manager'];
    const data = [];
    for (let i = 1; i <= count; i++) {
        const statusIndex = Math.floor(Math.random() * (STAGES.length + 1)); // including Rejected
        let status = statusIndex < STAGES.length ? STAGES[statusIndex] : 'Rejected';
        const requestedBy = users[Math.floor(Math.random() * users.length)];
        const requestedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
        const approvedBy = (status !== 'Requested' && status !== 'Rejected') ? 'supervisor' : '';
        const approvedDate = approvedBy ? new Date().toISOString() : '';
        const rejectionReason = status === 'Rejected' ? 'Data tidak lengkap' : '';
        // dummy WhatsApp number
        const whatsapp = '812' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        data.push({
            NO: i,
            'EXT/INT': Math.random() > 0.5 ? 'EXTERNAL' : 'INTERNAL',
            DARI: dariList[Math.floor(Math.random() * dariList.length)],
            'NOMOR SURAT': `${Math.floor(100 + Math.random()*900)}/ABC/2025`,
            'TANGGAL SURAT': new Date(2025, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1).toISOString().split('T')[0],
            'TANGGAL TERIMA': new Date().toISOString().split('T')[0],
            PERIHAL: perihalList[Math.floor(Math.random() * perihalList.length)],
            KETERANGAN: 'Lorem ipsum dolor sit amet.',
            'TANGGAL SELESAI': status === 'Result' ? new Date().toISOString().split('T')[0] : '',
            status: status,
            requestedBy: requestedBy,
            requestedDate: requestedDate,
            approvedBy: approvedBy,
            approvedDate: approvedDate,
            rejectionReason: rejectionReason,
            whatsapp: whatsapp
        });
    }
    return data;
}

// Render progress cards on dashboard
function renderProgressCards(filter = 'all') {
    const container = document.getElementById('progressContainer');
    if (!container) return;
    const user = getUser();
    let suratList = loadSuratData();

    // Filter based on role and filter tab
    if (user.role === 'staff') {
        // Staff only sees their own requests
        suratList = suratList.filter(s => s.requestedBy === user.username);
    }

    if (filter !== 'all') {
        suratList = suratList.filter(s => s.status.toLowerCase() === filter.toLowerCase());
    }

    if (suratList.length === 0) {
        container.innerHTML = '<p class="no-data">Tidak ada surat.</p>';
        return;
    }

    // Sort by requestedDate descending
    suratList.sort((a, b) => new Date(b.requestedDate) - new Date(a.requestedDate));

    let html = '';
    suratList.forEach(s => {
        html += generateCardHTML(s, user);
    });
    container.innerHTML = html;
}

function generateCardHTML(surat, user) {
    const currentStageIndex = STAGES.indexOf(surat.status);
    const isRejected = surat.status === 'Rejected';
    const progressPercent = isRejected ? 0 : ((currentStageIndex + 1) / STAGES.length) * 100;

    // Determine action buttons based on role and status
    let actions = '';

    // View details (always)
    actions += `<button class="btn-action btn-view" onclick="viewSurat('${surat.NO}')" title="Lihat"><i class="fas fa-eye"></i></button>`;

    // WhatsApp button if number exists
    if (surat.whatsapp) {
        let waNumber = surat.whatsapp.replace(/^0+/, '62'); // convert 08xx to 628xx
        waNumber = waNumber.replace(/\D/g, ''); // keep only digits
        const message = encodeURIComponent(`Halo, status surat Anda dengan nomor ${surat['NOMOR SURAT']} saat ini: ${STAGE_LABELS[surat.status] || surat.status}. Terima kasih.`);
        const waLink = `https://wa.me/${waNumber}?text=${message}`;
        actions += `<a href="${waLink}" target="_blank" class="btn-action btn-wa" title="Kirim Notifikasi WhatsApp"><i class="fab fa-whatsapp"></i></a>`;
    }

    // If staff and status is Result, allow print
    if (user.role === 'staff' && surat.status === 'Result') {
        actions += `<button class="btn-action btn-print" onclick="printSurat('${surat.NO}')" title="Cetak"><i class="fas fa-print"></i></button>`;
    }

    // If supervisor/manager and status is Requested, allow approve/reject
    if ((user.role === 'supervisor' || user.role === 'manager') && surat.status === 'Requested') {
        actions += `<button class="btn-action btn-approve" onclick="approveSurat('${surat.NO}')" title="Setujui"><i class="fas fa-check"></i></button>`;
        actions += `<button class="btn-action btn-reject" onclick="rejectSurat('${surat.NO}')" title="Tolak"><i class="fas fa-times"></i></button>`;
    }

    // If supervisor/manager and status is not final, allow move to next stage
    if ((user.role === 'supervisor' || user.role === 'manager') && !isRejected && currentStageIndex < STAGES.length - 1 && surat.status !== 'Requested') {
        actions += `<button class="btn-action btn-next" onclick="nextStage('${surat.NO}')" title="Lanjut ke tahap berikutnya"><i class="fas fa-arrow-right"></i></button>`;
    }

    // Edit and delete for supervisor/manager
    if (user.role === 'supervisor' || user.role === 'manager') {
        actions += `<button class="btn-action btn-edit" onclick="editSurat('${surat.NO}')" title="Edit"><i class="fas fa-edit"></i></button>`;
    }
    if (user.role === 'manager') {
        actions += `<button class="btn-action btn-delete" onclick="deleteSurat('${surat.NO}')" title="Hapus"><i class="fas fa-trash"></i></button>`;
    }

    // Build card
    return `
        <div class="progress-card ${isRejected ? 'rejected' : ''}">
            <div class="card-header">
                <div class="surat-info">
                    <h3>${surat['NOMOR SURAT']} - ${surat.PERIHAL}</h3>
                    <p>Dari: ${surat.DARI} | Pengaju: ${surat.requestedBy} | Tgl: ${new Date(surat.requestedDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div class="surat-status">
                    <span class="status-badge status-${surat.status.toLowerCase()}">${STAGE_LABELS[surat.status] || surat.status}</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                <div class="progress-stages">
                    ${STAGES.map((stage, idx) => `
                        <div class="stage-marker ${idx <= currentStageIndex ? 'completed' : ''} ${surat.status === stage ? 'current' : ''}" 
                             title="${STAGE_LABELS[stage]}">
                            <span class="stage-dot"></span>
                            <span class="stage-label">${STAGE_LABELS[stage]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${surat.rejectionReason ? `<div class="rejection-reason">Alasan ditolak: ${surat.rejectionReason}</div>` : ''}
            <div class="card-actions">
                ${actions}
            </div>
        </div>
    `;
}

// Action functions
function viewSurat(no) {
    window.location.href = `surat-detail.html?id=${no}`;
}

function printSurat(no) {
    alert('Fungsi cetak akan segera tersedia.');
}

function approveSurat(no) {
    let data = loadSuratData();
    const index = data.findIndex(s => s.NO == no);
    if (index !== -1) {
        const user = getUser();
        data[index].status = 'Scanned'; // First stage after approval
        data[index].approvedBy = user.username;
        data[index].approvedDate = new Date().toISOString();
        saveSuratData(data);
        renderProgressCards();
    }
}

function rejectSurat(no) {
    const reason = prompt('Alasan penolakan:');
    if (reason) {
        let data = loadSuratData();
        const index = data.findIndex(s => s.NO == no);
        if (index !== -1) {
            const user = getUser();
            data[index].status = 'Rejected';
            data[index].approvedBy = user.username;
            data[index].approvedDate = new Date().toISOString();
            data[index].rejectionReason = reason;
            saveSuratData(data);
            renderProgressCards();
        }
    }
}

function nextStage(no) {
    let data = loadSuratData();
    const index = data.findIndex(s => s.NO == no);
    if (index !== -1) {
        const current = data[index].status;
        const currentIdx = STAGES.indexOf(current);
        if (currentIdx >= 0 && currentIdx < STAGES.length - 1) {
            data[index].status = STAGES[currentIdx + 1];
            if (data[index].status === 'Result') {
                data[index]['TANGGAL SELESAI'] = new Date().toISOString().split('T')[0];
            }
            saveSuratData(data);
            renderProgressCards();
        }
    }
}

function editSurat(no) {
    window.location.href = `surat-form.html?mode=edit&id=${no}`;
}

function deleteSurat(no) {
    if (confirm('Hapus surat ini?')) {
        let data = loadSuratData();
        data = data.filter(s => s.NO != no);
        saveSuratData(data);
        renderProgressCards();
    }
}

// Handle form submission for request/edit
function handleFormSubmit(event) {
    event.preventDefault();
    const mode = document.getElementById('mode').value;
    const suratId = document.getElementById('suratId').value;
    const user = getUser();

    const formData = {
        'EXT/INT': document.getElementById('extInt').value,
        'DARI': document.getElementById('dari').value,
        'NOMOR SURAT': document.getElementById('nomorSurat').value,
        'TANGGAL SURAT': document.getElementById('tglSurat').value,
        'TANGGAL TERIMA': document.getElementById('tglTerima').value || document.getElementById('tglSurat').value,
        'PERIHAL': document.getElementById('perihal').value,
        'KETERANGAN': document.getElementById('keterangan').value,
        'TANGGAL SELESAI': '',
        'whatsapp': document.getElementById('whatsapp').value // add WhatsApp field
    };

    let data = loadSuratData();

    if (mode === 'edit' && suratId) {
        // Update existing surat
        const index = data.findIndex(s => s.NO == suratId);
        if (index !== -1) {
            data[index] = { ...data[index], ...formData };
            saveSuratData(data);
            alert('Surat berhasil diperbarui.');
        }
    } else {
        // New request
        const newId = data.length > 0 ? Math.max(...data.map(s => s.NO)) + 1 : 1;
        const newSurat = {
            NO: newId,
            ...formData,
            status: 'Requested',
            requestedBy: user.username,
            requestedDate: new Date().toISOString(),
            approvedBy: '',
            approvedDate: '',
            rejectionReason: ''
        };
        data.push(newSurat);
        saveSuratData(data);
        alert('Permintaan surat berhasil diajukan.');
    }

    // Redirect back to dashboard or list
    window.location.href = 'dashboard.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    const user = getUser();
    if (!user.role) {
        window.location.href = 'index.html';
        return;
    }

    // Display user name in sidebar
    if (document.getElementById('displayName')) {
        document.getElementById('displayName').textContent = user.fullName || user.username;
        document.getElementById('displayRole').textContent = user.role;
    }

    // Set current date
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // If on dashboard page, render cards
    if (document.getElementById('progressContainer')) {
        renderProgressCards();

        // Filter tabs
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                renderProgressCards(filter);
            });
        });
    }

    // If on form page, handle form submission
    const form = document.getElementById('suratForm');
    if (form) {
        // Determine mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') || 'request';
        const id = urlParams.get('id');
        document.getElementById('mode').value = mode;
        document.getElementById('suratId').value = id || '';

        if (mode === 'request') {
            document.getElementById('formTitle').textContent = 'Request Surat';
            document.getElementById('formSubtitle').textContent = 'Ajukan permintaan surat baru';
        } else if (mode === 'edit' && id) {
            document.getElementById('formTitle').textContent = 'Edit Surat';
            document.getElementById('formSubtitle').textContent = 'Ubah data surat';
            // Load existing data
            const data = loadSuratData();
            const surat = data.find(s => s.NO == id);
            if (surat) {
                document.getElementById('extInt').value = surat['EXT/INT'];
                document.getElementById('dari').value = surat['DARI'];
                document.getElementById('nomorSurat').value = surat['NOMOR SURAT'];
                document.getElementById('tglSurat').value = surat['TANGGAL SURAT'];
                document.getElementById('tglTerima').value = surat['TANGGAL TERIMA'];
                document.getElementById('perihal').value = surat['PERIHAL'];
                document.getElementById('keterangan').value = surat['KETERANGAN'];
                document.getElementById('whatsapp').value = surat.whatsapp || '';
            }
        } else if (mode === 'upload') {
            document.getElementById('formTitle').textContent = 'Upload Surat';
            document.getElementById('formSubtitle').textContent = 'Upload file surat (data akan diisi manual)';
        }

        form.addEventListener('submit', handleFormSubmit);
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
    }
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
});