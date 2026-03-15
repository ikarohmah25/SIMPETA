// auth.js
document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        credentials: {
            staff: { username:'staff', password:'staff123', fullName:'Ahmad Staff', role:'staff' },
            supervisor: { username:'supervisor', password:'sup456', fullName:'Budi Supervisor', role:'supervisor' },
            manager: { username:'manager', password:'mgr789', fullName:'Citra Manager', role:'manager' }
        },
        redirect: 'dashboard.html'
    };
    const elements = {
        form: document.getElementById('loginForm'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        roleSelect: document.getElementById('roleSelect'),
        statusDiv: document.getElementById('statusMessage'),
        loginBtn: document.getElementById('loginBtn')
    };
    function showMessage(text, type) {
        elements.statusDiv.textContent = text;
        elements.statusDiv.className = `status-message show ${type}`;
    }
    function clearMessage() { elements.statusDiv.className = 'status-message'; }
    function setLoading(isLoading) {
        elements.loginBtn.disabled = isLoading;
        elements.loginBtn.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Memproses...' : '<i class="fas fa-sign-in-alt"></i> Masuk';
    }
    elements.username.addEventListener('input', clearMessage);
    elements.password.addEventListener('input', clearMessage);
    elements.roleSelect.addEventListener('change', clearMessage);
    elements.form.addEventListener('submit', function(e) {
        e.preventDefault();
        const role = elements.roleSelect.value;
        const username = elements.username.value.trim();
        const password = elements.password.value.trim();
        if (!username || !password) return showMessage('❌ Username dan password harus diisi!', 'error');
        setLoading(true);
        setTimeout(() => {
            const cred = CONFIG.credentials[role];
            if (cred && username === cred.username && password === cred.password) {
                sessionStorage.setItem('simpeta_role', role);
                sessionStorage.setItem('simpeta_username', username);
                sessionStorage.setItem('simpeta_fullName', cred.fullName);
                showMessage('✅ Login berhasil!', 'success');
                setTimeout(() => window.location.href = CONFIG.redirect, 1000);
            } else {
                showMessage('❌ Username atau password salah!', 'error');
                setLoading(false);
            }
        }, 800);
    });
    elements.roleSelect.addEventListener('dblclick', function() {
        const cred = CONFIG.credentials[this.value];
        if (cred) {
            elements.username.value = cred.username;
            elements.password.value = cred.password;
            showMessage('✏️ Auto-fill', 'info');
            setTimeout(clearMessage, 2000);
        }
    });
    if (sessionStorage.getItem('simpeta_role')) window.location.href = CONFIG.redirect;
});