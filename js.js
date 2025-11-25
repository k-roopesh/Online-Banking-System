document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const transferForm = document.getElementById('transfer-form');

    // --- State Variables (Simulated) ---
    let isLoggedIn = false;

    // --- Function to Switch Auth Forms (Login/Register) ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // --- Function to Handle Simulated Login ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('login-email');
        const passwordEl = document.getElementById('login-password');
        const email = (emailEl.value || '').trim().toLowerCase();
        const password = passwordEl.value || '';

        // --- SIMULATED LOGIN LOGIC WITH localStorage USERS ---
        // Check persisted users first (if any)
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        } catch (err) {
            users = [];
        }

        const matched = users.find(u => u.email === email && u.password === password);

        // Default test account fallback
        const defaultOK = (email === 'test@user.com' && password === 'password');

        if (matched || defaultOK) {
            isLoggedIn = true;
            authView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            setView('summary'); // Load default dashboard view
            alert('Login Successful! (Simulated)');
            loginForm.reset();
        } else {
            alert('Simulated Login Failed: Invalid credentials.');
        }
    });
    
    // --- Function to Handle Simulated Registration ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (registerForm.querySelector('input[type="text"]').value || '').trim();
        const emailRaw = (registerForm.querySelector('input[type="email"]').value || '').trim();
        const email = emailRaw.toLowerCase();
        const password = registerForm.querySelector('input[type="password"]').value || '';
        const phone = (registerForm.querySelector('input[type="tel"]').value || '').trim();
        const accountType = (registerForm.querySelector('select').value || '').trim();

        if (!name || !email || !password || !accountType) {
            alert('Please fill in all required fields to register.');
            return;
        }

        // Load existing users
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        } catch (err) {
            users = [];
        }

        // Prevent duplicate emails
        if (users.some(u => u.email === email)) {
            alert('An account with this email already exists. Please login or use a different email.');
            return;
        }

        // Save new user (SIMULATION: storing plaintext password locally)
        users.push({ name, email, password, phone, accountType });
        try {
            localStorage.setItem('sb_users', JSON.stringify(users));
        } catch (err) {
            console.warn('Could not save user to localStorage', err);
        }

        // Automatically log the user in after registration
        isLoggedIn = true;
        registerForm.reset();
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        setView('summary');
        alert('Registration successful! You are now logged in (simulated).');
    });
    
    // --- Function to Handle Simulated Logout ---
    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        dashboardView.classList.add('hidden');
        authView.classList.remove('hidden');
        alert('Logged out successfully.');
    });

    // --- Function to Switch Dashboard Views ---
    window.setView = (viewId) => {
        // Hide all content sections
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        // Show the requested section
        document.getElementById(`${viewId}-view`).classList.remove('hidden');

        // Update active navigation button style
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === viewId) {
                btn.classList.add('active');
            }
        });
    }

    // Attach event listeners for nav buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.target.getAttribute('data-view');
            setView(view);
        });
    });
    
    // --- Simulated Transaction Handler + Mock Backend ---
    // Store balances and transactions in localStorage so transfers persist across reloads
    function getBalances() {
        const defaults = { savings: 5450.75, checking: 1200.00 };
        try {
            const stored = JSON.parse(localStorage.getItem('sb_balances') || 'null');
            return stored || defaults;
        } catch (err) {
            return defaults;
        }
    }

    function saveBalances(balances) {
        try {
            localStorage.setItem('sb_balances', JSON.stringify(balances));
        } catch (err) {
            console.warn('Could not save balances', err);
        }
    }

    function getTransactions() {
        try {
            return JSON.parse(localStorage.getItem('sb_transactions') || '[]');
        } catch (err) {
            return [];
        }
    }

    function saveTransactions(txs) {
        try {
            localStorage.setItem('sb_transactions', JSON.stringify(txs));
        } catch (err) {
            console.warn('Could not save transactions', err);
        }
    }

    function renderBalances() {
        const b = getBalances();
        const sEl = document.getElementById('savings-balance');
        const cEl = document.getElementById('checking-balance');
        if (sEl) sEl.textContent = b.savings.toFixed(2);
        if (cEl) cEl.textContent = b.checking.toFixed(2);

        // Update the from-account option text to show current balances
        const fromAccountSelect = document.getElementById('from-account');
        if (fromAccountSelect) {
            const savOpt = fromAccountSelect.querySelector('option[value="savings"]');
            const chkOpt = fromAccountSelect.querySelector('option[value="checking"]');
            if (savOpt) savOpt.textContent = `Savings Account (${b.savings.toFixed(2)})`;
            if (chkOpt) chkOpt.textContent = `Checking Account (${b.checking.toFixed(2)})`;
        }
    }

    function renderTransactions() {
        const tbody = document.querySelector('.history-table tbody');
        if (!tbody) return;
        const txs = getTransactions();
        // newest first
        const list = txs.slice().reverse();
        tbody.innerHTML = '';
        list.forEach(tx => {
            const tr = document.createElement('tr');
            const amountHtml = tx.amount < 0 ? `($${Math.abs(tx.amount).toFixed(2)})` : `$${tx.amount.toFixed(2)}`;
            const amountClass = tx.amount < 0 ? 'negative' : 'positive';
            tr.innerHTML = `<td>${tx.date}</td><td>${tx.type}</td><td>${tx.description}</td><td class="${amountClass}">${amountHtml}</td><td>${tx.status}</td>`;
            tbody.appendChild(tr);
        });
    }

    function updateBeneficiariesInSelect() {
        const toSelect = document.getElementById('to-target');
        if (!toSelect) return;
        // preserve the first option(s) that represent "My Accounts"
        const baseOptions = [
            { value: 'checking', text: 'My Checking Account' }
        ];
        // collect beneficiaries from the list
        const beneficiaries = [];
        const list = document.querySelectorAll('.beneficiary-list li');
        list.forEach(li => {
            // li text format: "Name - Account #123 - <a>Remove</a>"
            const text = li.childNodes[0] ? li.childNodes[0].textContent.trim() : li.textContent.trim();
            if (!text) return;
            // split on ' - Account #' to extract name and account
            const parts = text.split(' - Account #');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const account = parts[1].split(' - ')[0].trim();
                beneficiaries.push({ name, account });
            }
        });

        // rebuild options
        toSelect.innerHTML = '';
        baseOptions.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.text;
            toSelect.appendChild(opt);
        });
        beneficiaries.forEach((b, idx) => {
            const opt = document.createElement('option');
            opt.value = `beneficiary:${idx}`;
            opt.textContent = `${b.name} - ${b.account}`;
            toSelect.appendChild(opt);
        });
    }

    // Handle transfers with simple validation and balance updates
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amountVal = parseFloat(document.getElementById('amount').value);
        const fromAccount = document.getElementById('from-account').value;
        const toTarget = document.getElementById('to-target').value;

        if (!amountVal || isNaN(amountVal) || amountVal <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const balances = getBalances();
        // Check sufficient funds
        if (fromAccount === 'savings' && balances.savings < amountVal) {
            alert('Insufficient funds in Savings account.');
            return;
        }
        if (fromAccount === 'checking' && balances.checking < amountVal) {
            alert('Insufficient funds in Checking account.');
            return;
        }

        // Debit from source
        if (fromAccount === 'savings') balances.savings -= amountVal;
        if (fromAccount === 'checking') balances.checking -= amountVal;

        // Credit to internal account if applicable
        if (toTarget === 'checking') balances.checking += amountVal;
        if (toTarget === 'savings') balances.savings += amountVal;

        saveBalances(balances);

        // Record transaction
        const txs = getTransactions();
        const now = new Date();
        const tx = {
            date: now.toISOString().split('T')[0],
            type: 'Transfer',
            description: `From ${fromAccount} to ${toTarget}`,
            amount: -Math.abs(amountVal),
            status: 'Completed'
        };
        txs.push(tx);
        saveTransactions(txs);

        renderBalances();
        renderTransactions();

        transferForm.reset();
        setView('summary');
        alert('Transfer completed (simulated).');
    });

    // --- Beneficiary Management (Add / Remove) ---
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    const addBenefBtn = document.getElementById('add-beneficiary-btn');
    const beneficiaryList = document.querySelector('.beneficiary-list');

    if (addBenefBtn && beneficiaryList) {
        addBenefBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = prompt('Enter beneficiary full name:');
            if (!name) return alert('Beneficiary name is required.');
            const account = prompt('Enter beneficiary account number:');
            if (!account) return alert('Account number is required.');

            const li = document.createElement('li');
            li.innerHTML = `${escapeHtml(name)} - Account #${escapeHtml(account)} - <a href="#" class="remove-beneficiary">Remove</a>`;
            beneficiaryList.appendChild(li);
        });

        // Use event delegation for remove links
        beneficiaryList.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('remove-beneficiary')) {
                e.preventDefault();
                const li = e.target.closest('li');
                if (!li) return;
                if (confirm('Remove this beneficiary?')) {
                    li.remove();
                }
            }
        });
    }

    // Initial check: if not logged in, show auth view
    if (!isLoggedIn) {
        dashboardView.classList.add('hidden');
        authView.classList.remove('hidden');
    }
});