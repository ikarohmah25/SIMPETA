const db = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const [total] = await db.query('SELECT COUNT(*) as count FROM surat_permintaan');
        const [pending] = await db.query('SELECT COUNT(*) as count FROM surat_permintaan WHERE status = "pending"');
        const [diproses] = await db.query('SELECT COUNT(*) as count FROM surat_permintaan WHERE status = "diproses"');
        const [selesai] = await db.query('SELECT COUNT(*) as count FROM surat_permintaan WHERE status = "selesai"');
        const [recent] = await db.query(`
            SELECT s.*, u.nama_lengkap as pemohon_nama
            FROM surat_permintaan s
            LEFT JOIN users u ON s.pemohon_id = u.id
            ORDER BY s.created_at DESC LIMIT 5
        `);
        res.json({
            success: true,
            data: {
                total: total[0].count,
                pending: pending[0].count,
                diproses: diproses[0].count,
                selesai: selesai[0].count,
                recent: recent
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};