const db = require('../config/database');

// Ambil semua surat dengan pagination, search, filter
exports.getAllSurat = async (req, res) => {
    try {
        let { page = 1, limit = 10, status, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let whereClause = '';
        const params = [];
        if (status) {
            whereClause += ' WHERE status = ?';
            params.push(status);
        }
        if (search) {
            const searchTerm = `%${search}%`;
            if (whereClause) {
                whereClause += ' AND (nomor_surat LIKE ? OR perihal LIKE ?)';
            } else {
                whereClause += ' WHERE (nomor_surat LIKE ? OR perihal LIKE ?)';
            }
            params.push(searchTerm, searchTerm);
        }

        const [totalCount] = await db.query(
            `SELECT COUNT(*) as total FROM surat_permintaan ${whereClause}`,
            params
        );
        const total = totalCount[0].total;

        const [surat] = await db.query(
            `SELECT s.*, u.nama_lengkap as pemohon_nama
             FROM surat_permintaan s
             LEFT JOIN users u ON s.pemohon_id = u.id
             ${whereClause}
             ORDER BY s.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            success: true,
            data: surat,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Detail surat
exports.getSuratById = async (req, res) => {
    try {
        const [surat] = await db.query(
            `SELECT s.*, u.nama_lengkap as pemohon_nama
             FROM surat_permintaan s
             LEFT JOIN users u ON s.pemohon_id = u.id
             WHERE s.id = ?`,
            [req.params.id]
        );
        if (surat.length === 0) {
            return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
        }
        res.json({ success: true, data: surat[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Buat surat
exports.createSurat = async (req, res) => {
    try {
        const {
            extInt,
            dari,
            nomorSurat,
            tglSurat,
            tglTerima,
            perihal,
            keterangan,
            whatsapp
        } = req.body;

        if (!extInt || !dari || !nomorSurat || !tglSurat || !perihal || !whatsapp) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        if (!/^\d{10,15}$/.test(whatsapp)) {
            return res.status(400).json({ success: false, message: 'Format WhatsApp tidak valid (10-15 digit)' });
        }

        const [result] = await db.query(
            `INSERT INTO surat_permintaan
             (ext_int, dari, nomor_surat, tgl_surat, tgl_terima, perihal, keterangan, whatsapp, pemohon_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [extInt, dari, nomorSurat, tglSurat, tglTerima || null, perihal, keterangan || null, whatsapp, req.user.id, 'pending']
        );
        res.status(201).json({ success: true, message: 'Surat berhasil dibuat', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Nomor surat sudah digunakan' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update surat
exports.updateSurat = async (req, res) => {
    try {
        const {
            extInt,
            dari,
            nomorSurat,
            tglSurat,
            tglTerima,
            perihal,
            keterangan,
            whatsapp,
            status
        } = req.body;

        const [result] = await db.query(
            `UPDATE surat_permintaan
             SET ext_int = ?, dari = ?, nomor_surat = ?, tgl_surat = ?,
                 tgl_terima = ?, perihal = ?, keterangan = ?, whatsapp = ?, status = ?
             WHERE id = ?`,
            [extInt, dari, nomorSurat, tglSurat, tglTerima || null, perihal, keterangan || null, whatsapp, status || 'pending', req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
        }
        res.json({ success: true, message: 'Surat berhasil diupdate' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Nomor surat sudah digunakan' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update status (hanya manager/super admin)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status harus diisi' });
        const [result] = await db.query(
            'UPDATE surat_permintaan SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
        }
        res.json({ success: true, message: 'Status berhasil diupdate' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Hapus surat (hanya super admin)
exports.deleteSurat = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM surat_permintaan WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
        }
        res.json({ success: true, message: 'Surat berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};