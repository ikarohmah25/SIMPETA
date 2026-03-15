// surat.js
let suratData = [];
let table;

$(document).ready(function() {
    const role = sessionStorage.getItem('simpeta_role');
    if (!role) window.location.href = 'index.html';

    // Load data
    suratData = JSON.parse(localStorage.getItem('simpeta_surat')) || [];

    // Inisialisasi DataTable
    table = $('#suratTable').DataTable({
        data: suratData,
        columns: [
            { data: 'NO' },
            { data: 'EXT/INT' },
            { data: 'DARI' },
            { data: 'NOMOR SURAT' },
            { data: 'TANGGAL SURAT' },
            { data: 'TANGGAL TERIMA' },
            { data: 'PERIHAL' },
            { 
                data: 'STATUS',
                render: function(data) {
                    const cls = data.toLowerCase();
                    return `<span class="status-badge status-${cls}">${data}</span>`;
                }
            },
            {
                data: null,
                render: function(data) {
                    let btn = `<button class="btn-action btn-view" onclick="viewSurat(${data.NO})"><i class="fas fa-eye"></i></button>`;
                    btn += `<button class="btn-action btn-edit" onclick="editSurat(${data.NO})"><i class="fas fa-edit"></i></button>`;
                    if (role === 'manager') {
                        btn += `<button class="btn-action btn-delete" onclick="deleteSurat(${data.NO})"><i class="fas fa-trash"></i></button>`;
                    }
                    if (role === 'supervisor' || role === 'manager') {
                        // bisa tambah tombol approve/reject jika diperlukan
                    }
                    return btn;
                }
            }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json' },
        order: [[0, 'desc']],
        pageLength: 25
    });

    // Filter status
    $('#filterStatus').on('change', function() {
        table.column(7).search(this.value).draw();
    });
    $('#searchBox').on('keyup', function() {
        table.search(this.value).draw();
    });

    // Handle form submission di halaman form
    if (document.getElementById('suratForm')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            document.getElementById('formTitle').textContent = 'Edit Surat';
            const data = suratData.find(d => d.NO == id);
            if (data) {
                document.getElementById('rowId').value = data.NO;
                document.getElementById('extInt').value = data['EXT/INT'];
                document.getElementById('dari').value = data['DARI'];
                document.getElementById('nomorSurat').value = data['NOMOR SURAT'];
                document.getElementById('tglSurat').value = data['TANGGAL SURAT'];
                document.getElementById('tglTerima').value = data['TANGGAL TERIMA'];
                document.getElementById('perihal').value = data['PERIHAL'];
                document.getElementById('keterangan').value = data['KETERANGAN'];
                document.getElementById('status').value = data['STATUS'];
                document.getElementById('tglSelesai').value = data['TANGGAL SELESAI'] || '';
            }
        }
        document.getElementById('suratForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newData = {
                'NO': document.getElementById('rowId').value ? parseInt(document.getElementById('rowId').value) : (suratData.length ? Math.max(...suratData.map(d=>d.NO)) + 1 : 1),
                'EXT/INT': document.getElementById('extInt').value,
                'DARI': document.getElementById('dari').value,
                'NOMOR SURAT': document.getElementById('nomorSurat').value,
                'TANGGAL SURAT': document.getElementById('tglSurat').value,
                'TANGGAL TERIMA': document.getElementById('tglTerima').value || document.getElementById('tglSurat').value,
                'PERIHAL': document.getElementById('perihal').value,
                'KETERANGAN': document.getElementById('keterangan').value,
                'STATUS': document.getElementById('status').value,
                'TANGGAL SELESAI': document.getElementById('tglSelesai').value || ''
            };
            if (document.getElementById('rowId').value) {
                // update
                const index = suratData.findIndex(d => d.NO == newData.NO);
                suratData[index] = newData;
            } else {
                // tambah
                suratData.push(newData);
            }
            localStorage.setItem('simpeta_surat', JSON.stringify(suratData));
            alert('Data tersimpan');
            window.location.href = 'surat-list.html';
        });
    }
});

function viewSurat(id) {
    window.location.href = `surat-detail.html?id=${id}`;
}
function editSurat(id) {
    window.location.href = `surat-form.html?id=${id}`;
}
function deleteSurat(id) {
    if (confirm('Hapus surat ini?')) {
        suratData = suratData.filter(d => d.NO !== id);
        localStorage.setItem('simpeta_surat', JSON.stringify(suratData));
        table.clear().rows.add(suratData).draw();
    }
}