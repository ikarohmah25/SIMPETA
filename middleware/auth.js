const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
};