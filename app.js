if (window.location.hash === "#tv") {
    isTVMode = true;
    document.body.classList.add('tv-mode');
}let productionOrders = JSON.parse(localStorage.getItem('sandGravelOrders')) || [];
let currentAnnouncement = localStorage.getItem('sandGravelAnnounce') || "Salut ! N'oubliez pas, aujourd'hui c'est la production !";
let isTVMode = false;

const form = document.getElementById('prod-form');
const grid = document.getElementById('orders-grid');
const announceText = document.getElementById('announcement-text');
const adminMsgInput = document.getElementById('admin-message-input');

announceText.innerText = currentAnnouncement;
if (adminMsgInput) adminMsgInput.value = currentAnnouncement;
renderAll();

// Basculer la vue avec le bouton Sand&Gravel
window.toggleTVMode = function() {
    isTVMode = !isTVMode;
    document.body.classList.toggle('tv-mode', isTVMode);
};

// Touche Échap pour repasser en mode régie
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && isTVMode) {
        toggleTVMode();
    }
});

window.updateMessageFromInput = function() {
    const newMsg = adminMsgInput.value.trim();
    if (newMsg !== "") {
        currentAnnouncement = newMsg;
        localStorage.setItem('sandGravelAnnounce', currentAnnouncement);
        announceText.innerText = currentAnnouncement;
    }
};

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedProduct = document.getElementById('item-select').value;
    const target = parseInt(document.getElementById('target-qty').value);
    const client = document.getElementById('client-name').value || "Interne";

    productionOrders.push({
        id: Date.now(),
        name: selectedProduct,
        target: target,
        current: 0,
        client: client
    });

    saveAndRender();
    form.reset();
});

function saveAndRender() {
    localStorage.setItem('sandGravelOrders', JSON.stringify(productionOrders));
    renderAll();
}

function renderAll() {
    renderTopLiveBanner();
    renderOrders();
}

function renderTopLiveBanner() {
    const goalDetailsList = document.getElementById('goal-details-list');
    const goalProgressFill = document.getElementById('goal-progress-fill');

    goalDetailsList.innerHTML = '';

    if (productionOrders.length === 0) {
        goalDetailsList.innerHTML = `<span style="color: #8b949e; font-size: 1rem;">Aucun objectif actif</span>`;
        goalProgressFill.style.width = "0%";
        return;
    }

    let totalTarget = 0;
    let totalCurrent = 0;

    productionOrders.forEach(order => {
        totalTarget += order.target;
        totalCurrent += order.current;

        const remaining = Math.max(0, order.target - order.current);
        const tag = document.createElement('span');

        let styleClass = 'tag-verre';
        let icon = '🪟';
        if (order.name.includes('Silice')) { styleClass = 'tag-silice'; icon = '🧪'; }
        if (order.name.includes('Quartz')) { styleClass = 'tag-quartz'; icon = '💎'; }

        tag.className = `goal-item-tag ${styleClass}`;
        tag.innerHTML = `${icon} ${remaining.toLocaleString('fr-FR')} ${order.name}`;
        goalDetailsList.appendChild(tag);
    });

    const globalPercentage = Math.min(Math.round((totalCurrent / totalTarget) * 100), 100);
    goalProgressFill.style.width = `${globalPercentage}%`;
}

function renderOrders() {
    grid.innerHTML = '';

    if (productionOrders.length === 0) {
        grid.innerHTML = `<p style="color: #8b949e; grid-column: 1/-1;">Aucun produit demandé pour le moment.</p>`;
        return;
    }

    productionOrders.forEach(order => {
        const percentage = Math.min(Math.round((order.current / order.target) * 100), 100);
        const isDone = percentage >= 100;

        let cardClass = 'card-verre';
        let icon = '🪟';
        if (order.name.includes('Silice')) { cardClass = 'card-silice'; icon = '🧪'; }
        if (order.name.includes('Quartz')) { cardClass = 'card-quartz'; icon = '💎'; }

        const card = document.createElement('div');
        card.className = `order-card ${cardClass}`;
        card.innerHTML = `
            <div class="order-header">
                <span class="order-title">${icon} ${order.name}</span>
                <span class="client-tag">👤 ${order.client}</span>
            </div>
            <div class="order-stats">
                ${order.current.toLocaleString('fr-FR')} / ${order.target.toLocaleString('fr-FR')} 
                <span class="percentage">(${percentage}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-add-progress" onclick="addProgress(${order.id})">+ Produire</button>
                <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">Terminer</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

window.addProgress = function(id) {
    const order = productionOrders.find(o => o.id === id);
    if (order) {
        const amount = prompt(`Quantité produite à ajouter à "${order.name}" :`, "500");
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
            order.current += parseInt(amount);
            saveAndRender();
        }
    }
};

window.deleteOrder = function(id) {
    if (confirm("Clôturer ce produit ?")) {
        productionOrders = productionOrders.filter(o => o.id !== id);
        saveAndRender();
    }
};
