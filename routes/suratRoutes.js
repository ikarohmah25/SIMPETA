const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(auth);

// Semua role bisa melihat daftar surat dan detail
router.get('/', suratController.getAllSurat);
router.get('/:id', suratController.getSuratById);

// Buat surat: karyawan, staff, manager, super admin
router.post('/', authorize('karyawan', 'staff_regulator', 'manager_regulator', 'super_admin'), suratController.createSurat);

// Update surat: staff, manager, super admin (bisa edit semua field)
router.put('/:id', authorize('staff_regulator', 'manager_regulator', 'super_admin'), suratController.updateSurat);

// Update status: manager dan super admin
router.patch('/:id/status', authorize('manager_regulator', 'super_admin'), suratController.updateStatus);

// Hapus surat: super admin saja
router.delete('/:id', authorize('super_admin'), suratController.deleteSurat);

module.exports = router;