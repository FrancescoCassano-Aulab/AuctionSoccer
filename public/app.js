class FantaCalcioAuction {
    constructor() {
        this.players = [];
        this.participants = [];
        this.currentBids = [];
        this.selectedPlayer = null;
        this.activeParticipant = null;
        this.auctionHistory = [];
        this.soldPlayers = new Set();
        this.favoritePlayers = new Set();
        this.theme = localStorage.getItem('theme') || 'light';
        this.currentPage = 1;
        this.playersPerPage = 25;
        
        this.init();
    }

    async init() {
        await this.loadPlayersData();
        this.setupEventListeners();
        this.loadSavedState();
        this.applyTheme();
        this.renderPlayers();
        this.renderParticipants();
        this.populateTeamFilter();
        this.renderTeamsQuickInfo();
    }

    async loadPlayersData() {
        try {
            const response = await fetch('players-data.json');
            const data = await response.json();
            
            this.players = [];
            data.squadre.forEach(squadra => {
                squadra.giocatori.forEach(giocatore => {
                    this.players.push({
                        ...giocatore,
                        squadra: squadra.nome,
                        modulo: squadra.modulo,
                        allenatore: squadra.allenatore,
                        id: `${squadra.nome}_${giocatore.nome}`.replace(/\s+/g, '_')
                    });
                });
            });
        } catch (error) {
            console.error('Errore nel caricamento dati giocatori:', error);
            this.showNotification('Errore nel caricamento database giocatori', 'error');
        }
    }

    setupEventListeners() {
        document.getElementById('add-participant-btn').addEventListener('click', () => this.addParticipant());
        document.getElementById('participant-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addParticipant();
        });
        
        document.getElementById('player-search').addEventListener('input', () => {
            this.currentPage = 1;
            this.renderPlayers();
        });
        document.getElementById('role-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderPlayers();
        });
        document.getElementById('team-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderPlayers();
        });
        document.getElementById('status-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderPlayers();
        });
        document.getElementById('sort-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderPlayers();
        });
        
        document.getElementById('teams-view-btn').addEventListener('click', () => this.showTeamsOverview());
        document.getElementById('back-to-auction-btn').addEventListener('click', () => this.backToAuction());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoLastAction());
        
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('auction-modal')) {
                this.closeModal();
            }
        });
    }

    addParticipant() {
        const nameInput = document.getElementById('participant-name');
        const budgetInput = document.getElementById('participant-budget');
        
        const name = nameInput.value.trim();
        const budget = parseInt(budgetInput.value) || 500;
        
        if (!name) {
            this.showNotification('Inserisci il nome della squadra', 'warning');
            return;
        }
        
        if (this.participants.find(p => p.name === name)) {
            this.showNotification('Squadra già esistente', 'warning');
            return;
        }
        
        const participant = {
            id: Date.now().toString(),
            name,
            budget,
            initialBudget: budget,
            players: [],
            roleCount: { P: 0, D: 0, C: 0, A: 0 }
        };
        
        this.participants.push(participant);
        this.renderParticipants();
        this.renderTeamsQuickInfo();
        this.saveState();
        
        nameInput.value = '';
        budgetInput.value = '500';
        
        this.showNotification(`Squadra ${name} aggiunta con successo`, 'success');
    }

    removeParticipant(id) {
        const participant = this.participants.find(p => p.id === id);
        if (!participant) return;
        
        participant.players.forEach(playerId => {
            this.soldPlayers.delete(playerId);
        });
        
        this.participants = this.participants.filter(p => p.id !== id);
        
        if (this.activeParticipant && this.activeParticipant.id === id) {
            this.activeParticipant = null;
        }
        
        this.renderParticipants();
        this.renderPlayers();
        this.renderTeamsQuickInfo();
        this.saveState();
        
        this.showNotification(`Squadra ${participant.name} rimossa`, 'success');
    }

    setActiveParticipant(id) {
        this.activeParticipant = this.participants.find(p => p.id === id);
        this.renderParticipants();
    }

    renderParticipants() {
        const container = document.getElementById('teams-grid');
        const progressContainer = document.getElementById('auction-progress');
        
        // Update auction progress
        const totalPlayers = this.participants.reduce((sum, p) => sum + p.players.length, 0);
        const totalBudget = this.participants.reduce((sum, p) => sum + p.initialBudget, 0);
        const spentBudget = this.participants.reduce((sum, p) => sum + (p.initialBudget - p.budget), 0);
        
        progressContainer.innerHTML = `
            <div class="progress-stats">
                <span>👥 ${this.participants.length} Squadre</span>
                <span>⚽ ${totalPlayers} Giocatori acquistati</span>
                <span>💰 ${spentBudget}/${totalBudget} spesi</span>
                <span>📊 ${Math.round((spentBudget/totalBudget)*100)}% budget utilizzato</span>
            </div>
        `;
        
        if (this.participants.length === 0) {
            container.innerHTML = '<div class="no-teams"><p>➕ Aggiungi la prima squadra per iniziare l\'asta</p></div>';
            return;
        }
        
        container.innerHTML = this.participants.map(participant => {
            const budgetPercentage = (participant.budget / participant.initialBudget) * 100;
            const spentAmount = participant.initialBudget - participant.budget;
            const isActive = this.activeParticipant && this.activeParticipant.id === participant.id;
            
            const avgPlayerPrice = participant.players.length > 0 ? 
                Math.round(spentAmount / participant.players.length) : 0;
            
            // Raggruppa giocatori per ruolo per visualizzazione
            const playersByRole = {
                P: participant.players.filter(p => p.ruolo === 'P'),
                D: participant.players.filter(p => p.ruolo === 'D'),
                C: participant.players.filter(p => p.ruolo === 'C'),
                A: participant.players.filter(p => p.ruolo === 'A')
            };
            
            return `
                <div class="team-card ${isActive ? 'active' : ''}" onclick="app.setActiveParticipant('${participant.id}')">
                    <div class="team-header">
                        <div class="team-name">${participant.name} ${isActive ? '👑' : ''}</div>
                        <div class="budget-display">
                            <span class="budget-amount">${participant.budget}</span>
                            <span class="budget-label">budget</span>
                        </div>
                    </div>
                    
                    <div class="budget-bar">
                        <div class="budget-fill" style="width: ${budgetPercentage}%"></div>
                    </div>
                    
                    <div class="team-players-main">
                        ${['P', 'D', 'C', 'A'].map(role => {
                            const players = playersByRole[role];
                            const roleNames = { P: 'POR', D: 'DIF', C: 'CEN', A: 'ATT' };
                            const roleLimits = { P: 3, D: 8, C: 8, A: 6 };
                            const currentCount = players.length;
                            const limit = roleLimits[role];
                            
                            let badgeClass = 'role-count-badge';
                            if (currentCount >= limit) {
                                badgeClass += ' limit-reached';
                            } else if (currentCount === limit - 1) {
                                badgeClass += ' limit-warning';
                            }
                            
                            return `
                                <div class="role-section role-section-${role.toLowerCase()}">
                                    <div class="role-header">
                                        <span class="role-label">${roleNames[role]}</span>
                                        <span class="${badgeClass}">${currentCount}/${limit}</span>
                                    </div>
                                    <div class="players-list">
                                        ${players.map(player => `
                                            <div class="team-player-item">
                                                <span class="player-name">${player.nome}</span>
                                                <span class="player-price">${player.prezzo}</span>
                                            </div>
                                        `).join('')}
                                        ${players.length === 0 ? '<div class="empty-role">-</div>' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="team-summary">
                        <div class="summary-stats">
                            <span>💰 Spesi: ${spentAmount}</span>
                            <span>📊 Media: ${avgPlayerPrice}</span>
                            <span>👥 Tot: ${participant.players.length}</span>
                        </div>
                        <div class="team-actions">
                            <button onclick="event.stopPropagation(); app.viewTeamRoster('${participant.id}')" class="team-action-btn view-roster-btn">
                                📋 Dettagli
                            </button>
                            <button onclick="event.stopPropagation(); app.deleteTeam('${participant.id}')" class="team-action-btn remove-team-btn">
                                🗑️ Elimina
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Force horizontal scroll by setting grid width (table mode)
        setTimeout(() => {
            const teamsGrid = document.getElementById('teams-grid');
            if (teamsGrid && this.participants.length > 0) {
                const teamCardWidth = 140; // Fixed width from CSS
                const gap = 0.4 * 16; // border-spacing converted to px
                const totalWidth = (this.participants.length * teamCardWidth) + ((this.participants.length + 1) * gap);
                teamsGrid.style.width = `${totalWidth}px`;
            }
        }, 100);
    }

    renderTeamsQuickInfo() {
        const container = document.getElementById('teams-stats-unified');

        if (this.participants.length === 0) {
            container.innerHTML = `
                <div class="unified-stats-header">
                    <h3 class="unified-stats-title">📊 Statistiche Squadre</h3>
                </div>
                <div class="no-teams-quick">Nessuna squadra creata</div>
            `;
            return;
        }

        // Calcola statistiche per ogni squadra
        const teamStats = this.participants.map(team => {
            const roleLimits = { P: 3, D: 8, C: 8, A: 6 };
            const totalSlots = Object.values(roleLimits).reduce((sum, limit) => sum + limit, 0);
            const currentPlayers = team.players.length;
            const remainingSlots = totalSlots - currentPlayers;
            
            // Calcola giocatori mancanti per ruolo
            const missingByRole = {
                P: Math.max(0, roleLimits.P - team.roleCount.P),
                D: Math.max(0, roleLimits.D - team.roleCount.D),
                C: Math.max(0, roleLimits.C - team.roleCount.C),
                A: Math.max(0, roleLimits.A - team.roleCount.A)
            };
            
            const totalMissing = Object.values(missingByRole).reduce((sum, missing) => sum + missing, 0);
            
            // Calcola massimo spendibile per giocatore (lasciando 1€ per ogni giocatore rimanente)
            const maxSpendPerPlayer = totalMissing > 1 ? 
                Math.max(1, team.budget - (totalMissing - 1)) : 
                team.budget;

            return {
                ...team,
                totalMissing,
                missingByRole,
                maxSpendPerPlayer,
                remainingSlots
            };
        });

        // Ordina per budget (decrescente) e prendi top 8
        const sortedTeams = [...teamStats].sort((a, b) => b.budget - a.budget).slice(0, 8);

        // Header
        let html = `
            <div class="unified-stats-header">
                <h3 class="unified-stats-title">📊 Statistiche Squadre</h3>
            </div>
        `;

        // Render unified stats per ogni squadra
        html += sortedTeams.map(team => {
            // Budget class
            let budgetClass = 'budget-low';
            if (team.budget > 100) budgetClass = 'budget-high';
            else if (team.budget > 50) budgetClass = 'budget-medium';

            // Max spend class
            let spendClass = 'max-spend-low';
            if (team.maxSpendPerPlayer > 50) spendClass = 'max-spend-high';
            else if (team.maxSpendPerPlayer > 20) spendClass = 'max-spend-medium';

            // Genera i badge per ruoli mancanti
            let missingRolesHTML = '';
            if (team.totalMissing === 0) {
                missingRolesHTML = '<span class="role-badge-missing complete">✓ Completa</span>';
            } else {
                const roles = ['P', 'D', 'C', 'A'];
                missingRolesHTML = roles
                    .filter(role => team.missingByRole[role] > 0)
                    .map(role => `<span class="role-badge-missing role-${role}">${role}:${team.missingByRole[role]}</span>`)
                    .join('');
            }

            return `
                <div class="quick-stat-item">
                    <div class="team-stat-row">
                        <span class="team-name-quick">${team.name}</span>
                        <div class="stat-badges-quick">
                            <span class="stat-value-quick ${budgetClass}" title="Budget rimanente">${team.budget}</span>
                            <span class="stat-value-quick ${spendClass}" title="Max spendibile per giocatore">${team.maxSpendPerPlayer}</span>
                        </div>
                    </div>
                    <div class="missing-roles-detail">
                        ${missingRolesHTML}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    populateTeamFilter() {
        const teamFilter = document.getElementById('team-filter');
        const teams = [...new Set(this.players.map(p => p.squadra))].sort();
        
        teamFilter.innerHTML = '<option value="">Tutte le squadre</option>' +
            teams.map(team => `<option value="${team}">${team}</option>`).join('');
    }

    getFilteredPlayers() {
        let filtered = [...this.players];
        
        const search = document.getElementById('player-search').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;
        const teamFilter = document.getElementById('team-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;
        
        if (search) {
            filtered = filtered.filter(p => 
                p.nome.toLowerCase().includes(search) || 
                p.squadra.toLowerCase().includes(search)
            );
        }
        
        if (roleFilter) {
            filtered = filtered.filter(p => p.ruolo === roleFilter);
        }
        
        if (teamFilter) {
            filtered = filtered.filter(p => p.squadra === teamFilter);
        }
        
        if (statusFilter) {
            switch (statusFilter) {
                case 'available':
                    filtered = filtered.filter(p => !this.soldPlayers.has(p.id));
                    break;
                case 'sold':
                    filtered = filtered.filter(p => this.soldPlayers.has(p.id));
                    break;
                case 'favorites':
                    filtered = filtered.filter(p => this.favoritePlayers.has(p.id));
                    break;
                case 'titolare':
                    filtered = filtered.filter(p => p.titolarita >= 60);
                    break;
                case 'rigorista':
                    filtered = filtered.filter(p => p.rigorista);
                    break;
            }
        }
        
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'valore-desc':
                    return b.valore - a.valore;
                case 'valore-asc':
                    return a.valore - b.valore;
                case 'nome-asc':
                    return a.nome.localeCompare(b.nome);
                case 'titolarita-desc':
                    return b.titolarita - a.titolarita;
                default:
                    return b.valore - a.valore;
            }
        });
        
        return filtered;
    }

    renderPlayers() {
        const container = document.getElementById('players-grid');
        const filtered = this.getFilteredPlayers();
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-results">Nessun giocatore trovato</div>';
            return;
        }
        
        // Paginazione
        const totalPages = Math.ceil(filtered.length / this.playersPerPage);
        const startIndex = (this.currentPage - 1) * this.playersPerPage;
        const endIndex = startIndex + this.playersPerPage;
        const playersToShow = filtered.slice(startIndex, endIndex);
        
        const tableHeader = `
            <table class="players-table">
                <thead>
                    <tr>
                        <th>♥</th>
                        <th>Giocatore</th>
                        <th>Ruolo</th>
                        <th>Tier</th>
                        <th>Rating</th>
                        <th>Valore</th>
                        <th>Titolarità</th>
                        <th>Note/Info</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        const playersHTML = playersToShow.map(player => {
            const isSold = this.soldPlayers.has(player.id);
            const isSelected = this.selectedPlayer && this.selectedPlayer.id === player.id;
            const isFavorite = this.favoritePlayers.has(player.id);
            const soldTo = isSold ? this.getSoldTo(player.id) : null;
            
            const qualityRatio = player.valore;
            let qualityColor = '--text-secondary';
            if (qualityRatio >= 20) qualityColor = '--success-color';
            else if (qualityRatio >= 15) qualityColor = '--warning-color';
            else if (qualityRatio >= 10) qualityColor = '--secondary-color';
            
            return `
                <tr class="player-row ${isSold ? 'sold' : ''} ${isSelected ? 'selected' : ''}" 
                    onclick="app.selectPlayer('${player.id}')">
                    <td class="favorite-cell" data-label="♥" onclick="event.stopPropagation(); app.toggleFavorite('${player.id}')">
                        <button class="favorite-btn ${isFavorite ? 'favorited' : ''}">
                            ${isFavorite ? '♥' : '♡'}
                        </button>
                    </td>
                    <td class="player-name-cell" data-label="Giocatore">
                        <div class="player-name">
                            ${player.nome}
                            ${player.rigorista ? '<span class="rigorista-badge">R</span>' : ''}
                            ${isSold ? `<span class="sold-badge">VENDUTO</span>` : ''}
                        </div>
                        <div class="player-team">${player.squadra}</div>
                    </td>
                    <td class="role-cell" data-label="Ruolo">
                        <span class="player-role-badge role-${player.ruolo}">${this.getRoleFullName(player.ruolo)}</span>
                    </td>
                    <td class="tier-cell" data-label="Tier">
                        <span class="fantasy-tier tier-${player.fantasyTier}">${player.fantasyTier}</span>
                    </td>
                    <td class="rating-cell" data-label="Rating">
                        ${this.getPlayerStarRating(player)}
                    </td>
                    <td class="value-cell" data-label="Valore" style="color: var(${qualityColor})">
                        <strong>${player.valore}</strong>
                    </td>
                    <td class="titolarita-cell" data-label="Titolarità">
                        <div class="titolarita-container">
                            <div class="titolarita-bar-mini">
                                <div class="titolarita-fill" style="width: ${player.titolarita}%; background: var(--role-${player.ruolo.toLowerCase()}-color);"></div>
                            </div>
                            <span class="titolarita-text">${player.titolarita}%</span>
                        </div>
                    </td>
                    <td class="notes-cell" data-label="Note/Info">
                        ${player.note ? `<div class="player-note-text">${player.note}</div>` : ''}
                        <div class="player-badges">
                            ${player.titolarita >= 70 ? '<span class="mini-badge">⭐</span>' : ''}
                            ${player.infortunato ? '<span class="mini-badge">⚠️</span>' : ''}
                            ${isSold ? `<div class="sold-info-inline">
                                <span class="sold-to-team">→ ${soldTo}</span>
                                <button onclick="app.undoPlayerSale('${player.id}')" class="undo-sale-btn" title="Annulla vendita">↶</button>
                            </div>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        const tableFooter = `
                </tbody>
            </table>
        `;
        
        // Aggiungi paginazione
        const paginationHTML = this.renderPagination(totalPages, filtered.length);
        
        container.innerHTML = `
            <div class="table-container">
                ${tableHeader + playersHTML + tableFooter}
            </div>
            ${paginationHTML}
        `;
        
        // Aggiungi event listeners per paginazione
        this.setupPaginationListeners();
    }
    
    renderPagination(totalPages, totalPlayers) {
        if (totalPages <= 1) return '';
        
        let paginationHTML = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Pagina ${this.currentPage} di ${totalPages} (${totalPlayers} giocatori)
                </div>
                <div class="pagination-controls">
        `;
        
        // Pulsante Previous
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage - 1}">← Precedente</button>`;
        }
        
        // Numeri pagina
        for (let i = 1; i <= Math.min(totalPages, 10); i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="page-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
            }
        }
        
        // Pulsante Next
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage + 1}">Successiva →</button>`;
        }
        
        paginationHTML += `
                </div>
            </div>
        `;
        
        return paginationHTML;
    }
    
    setupPaginationListeners() {
        document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderPlayers();
            });
        });
    }

    selectPlayer(playerId) {
        if (this.soldPlayers.has(playerId)) {
            this.showNotification('Giocatore già venduto', 'warning');
            return;
        }
        
        this.selectedPlayer = this.players.find(p => p.id === playerId);
        this.renderSelectedPlayer();
        this.renderPlayers();
        this.currentBids = [];
        this.renderBidding();
    }

    toggleFavorite(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        if (this.favoritePlayers.has(playerId)) {
            this.favoritePlayers.delete(playerId);
            this.showNotification(`${player.nome} rimosso dai preferiti`, 'info');
        } else {
            this.favoritePlayers.add(playerId);
            this.showNotification(`${player.nome} aggiunto ai preferiti`, 'success');
        }
        
        this.renderPlayers();
        this.saveState();
    }

    renderSelectedPlayer() {
        const container = document.getElementById('selected-player');
        
        if (!this.selectedPlayer) {
            container.innerHTML = '<span class="no-selection">Seleziona un giocatore</span>';
            return;
        }
        
        const player = this.selectedPlayer;
        const rating = this.getPlayerStarRating(player);
        container.innerHTML = `
            <span class="player-compact-info">
                <strong>${player.nome}</strong> 
                <span class="role-badge-mini role-${player.ruolo}">${player.ruolo}</span>
                <span class="team-mini">${player.squadra}</span>
                <span class="tier-mini tier-${player.fantasyTier}">${player.fantasyTier}</span>
                ${rating} 
                <span class="value-mini">${player.valore}</span>
                <span class="titolarita-mini">${player.titolarita}%</span>
                ${player.rigorista ? '<span class="rig-mini">R</span>' : ''}
            </span>
        `;
    }

    renderBidding() {
        const container = document.getElementById('bidding-section');
        
        if (!this.selectedPlayer) {
            container.innerHTML = '<p class="text-muted">Seleziona un giocatore per iniziare l\'asta</p>';
            return;
        }
        
        if (this.participants.length === 0) {
            container.innerHTML = '<p class="text-muted">Aggiungi partecipanti per iniziare l\'asta</p>';
            return;
        }
        
        const currentBid = this.currentBids.length > 0 ? Math.max(...this.currentBids.map(b => b.amount)) : 0;
        const minBid = currentBid + 1;
        
        container.innerHTML = `
            <div class="bidding-inline-controls">
                <input type="number" id="bid-amount" min="1" placeholder="Prezzo" class="bid-input-mini">
                <select id="team-assignment-select" class="team-select-mini">
                    <option value="">Squadra...</option>
                    ${this.participants.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
                <button onclick="app.assignPlayer()" class="assign-btn-mini">
                    🏆 Assegna
                </button>
                <button onclick="app.quickBid(${this.selectedPlayer.valore})" class="quick-bid-mini">
                    Val.${this.selectedPlayer.valore}
                </button>
            </div>
        `;
    }

    quickBid(amount) {
        document.getElementById('bid-amount').value = amount;
    }

    getRoleFullName(role) {
        const roleNames = {
            'P': 'Portiere',
            'D': 'Difensore', 
            'C': 'Centrocampista',
            'A': 'Attaccante'
        };
        return roleNames[role] || role;
    }

    getPlayerStarRating(player) {
        let rating = 3;
        
        if (player.titolarita >= 80) rating += 1;
        else if (player.titolarita <= 40) rating -= 1;
        
        if (player.rigorista) rating += 1;
        if (player.infortunato) rating -= 2;
        
        if (player.fantasyTier === 'A') rating += 1;
        else if (player.fantasyTier === 'E') rating -= 1;
        
        rating = Math.max(1, Math.min(5, rating));
        
        return `<span class="stars">${'<span class="star-filled">★</span>'.repeat(rating)}${'<span class="star-empty">☆</span>'.repeat(5 - rating)}</span>`;
    }

    placeBid() {
        if (!this.activeParticipant) {
            this.showNotification('Seleziona un partecipante attivo', 'warning');
            return;
        }
        
        const bidAmount = parseInt(document.getElementById('bid-amount').value);
        const currentBid = this.currentBids.length > 0 ? Math.max(...this.currentBids.map(b => b.amount)) : 0;
        
        if (!bidAmount || bidAmount <= currentBid) {
            this.showNotification(`L'offerta deve essere superiore a ${currentBid}`, 'warning');
            return;
        }
        
        if (bidAmount > this.activeParticipant.budget) {
            this.showNotification('Budget insufficiente', 'error');
            return;
        }
        
        this.currentBids.push({
            participant: this.activeParticipant.name,
            participantId: this.activeParticipant.id,
            amount: bidAmount,
            timestamp: new Date()
        });
        
        this.renderBidding();
        document.getElementById('bid-amount').value = '';
        
        this.showNotification(`Offerta di ${bidAmount} registrata per ${this.activeParticipant.name}`, 'success');
    }

    assignPlayer() {
        const bidAmountInput = document.getElementById('bid-amount');
        const bidAmount = parseInt(bidAmountInput.value);
        
        if (!bidAmount || bidAmount <= 0) {
            this.showNotification('Inserisci un prezzo valido', 'warning');
            return;
        }
        
        const selectedTeamId = document.getElementById('team-assignment-select').value;
        if (!selectedTeamId) {
            this.showNotification('Seleziona una squadra per l\'assegnazione', 'warning');
            return;
        }
        
        const winner = this.participants.find(p => p.id === selectedTeamId);
        
        if (!winner) {
            this.showNotification('Errore: partecipante non trovato', 'error');
            return;
        }
        
        // Controllo limiti ruoli: 3P, 8D, 8C, 6A
        const roleLimits = { P: 3, D: 8, C: 8, A: 6 };
        const currentCount = winner.roleCount[this.selectedPlayer.ruolo];
        const limit = roleLimits[this.selectedPlayer.ruolo];
        
        if (currentCount >= limit) {
            this.showNotification(
                `Limite massimo raggiunto per ${this.getRoleFullName(this.selectedPlayer.ruolo)} (${currentCount}/${limit})`, 
                'warning'
            );
            return;
        }
        
        // Avviso quando ci si avvicina al limite
        if (currentCount === limit - 1) {
            this.showNotification(
                `⚠️ Ultimo slot disponibile per ${this.getRoleFullName(this.selectedPlayer.ruolo)} (${currentCount + 1}/${limit})`, 
                'warning'
            );
        }
        
        winner.budget -= bidAmount;
        winner.players.push({
            id: this.selectedPlayer.id,
            nome: this.selectedPlayer.nome,
            ruolo: this.selectedPlayer.ruolo,
            squadra: this.selectedPlayer.squadra,
            prezzo: bidAmount,
            valore: this.selectedPlayer.valore
        });
        winner.roleCount[this.selectedPlayer.ruolo]++;
        
        this.soldPlayers.add(this.selectedPlayer.id);
        
        this.auctionHistory.push({
            player: this.selectedPlayer,
            winner: winner.name,
            price: bidAmount,
            bids: [...this.currentBids],
            timestamp: new Date()
        });
        
        this.showNotification(`${this.selectedPlayer.nome} assegnato a ${winner.name} per ${bidAmount}`, 'success');
        
        this.selectedPlayer = null;
        this.currentBids = [];
        this.renderSelectedPlayer();
        this.renderBidding();
        this.renderPlayers();
        this.renderParticipants();
        this.renderTeamsQuickInfo();
        this.saveState();
    }

    renderAIRecommendations() {
        const container = document.getElementById('ai-recommendations');
        
        if (!this.selectedPlayer) {
            container.innerHTML = '<p class="text-muted">Seleziona un giocatore per consigli AI</p>';
            return;
        }
        
        const player = this.selectedPlayer;
        const recommendation = this.getAIRecommendation(player);
        
        container.innerHTML = `
            <div class="ai-rating">
                <span>Rating:</span>
                <span class="stars">${'<span class="star-filled">★</span>'.repeat(recommendation.rating)}${'<span class="star-empty">☆</span>'.repeat(5 - recommendation.rating)}</span>
            </div>
            <div class="ai-advice">
                <strong>Consiglio:</strong> ${recommendation.advice}
            </div>
            <div class="ai-price-suggestion">
                <strong>Offerta consigliata:</strong> ${recommendation.suggestedPrice}
            </div>
            ${recommendation.alerts.length > 0 ? `
                <div class="ai-alerts">
                    <strong>⚠️ Attenzione:</strong><br>
                    ${recommendation.alerts.join('<br>')}
                </div>
            ` : ''}
        `;
    }

    getAIRecommendation(player) {
        let rating = 3;
        let advice = "Giocatore nella media per il suo ruolo.";
        let suggestedPrice = player.valore;
        let alerts = [];
        
        if (player.titolarita >= 80) {
            rating += 1;
            advice = "Titolare fisso, buon investimento per la continuità.";
        } else if (player.titolarita <= 40) {
            rating -= 1;
            alerts.push("Titolarità incerta, potrebbe giocare poco");
        }
        
        if (player.rigorista) {
            rating += 1;
            suggestedPrice = Math.ceil(player.valore * 1.15);
            advice += " Rigorista: valore aggiunto importante.";
        }
        
        if (player.infortunato) {
            rating -= 2;
            alerts.push("Attualmente infortunato, rischio elevato");
            suggestedPrice = Math.ceil(player.valore * 0.8);
        }
        
        if (player.fantasyTier === 'A') {
            rating = Math.min(5, rating + 1);
            advice = "Top player del reparto, investimento sicuro.";
            suggestedPrice = Math.ceil(player.valore * 1.1);
        } else if (player.fantasyTier === 'E') {
            rating = Math.max(1, rating - 1);
            advice = "Scelta rischiosa, considerare alternative.";
            suggestedPrice = Math.ceil(player.valore * 0.9);
        }
        
        const qualityPriceRatio = player.valore / (player.titolarita + 1);
        if (qualityPriceRatio < 0.3) {
            advice += " Ottimo rapporto qualità/prezzo!";
            rating = Math.min(5, rating + 1);
        }
        
        rating = Math.max(1, Math.min(5, rating));
        
        return {
            rating,
            advice,
            suggestedPrice,
            alerts,
            qualityPriceRatio
        };
    }

    renderTeamsOverview() {
        // This function is now handled by renderParticipants since teams are the main focus
        this.renderParticipants();
    }
    
    viewTeamRoster(teamId) {
        const team = this.participants.find(p => p.id === teamId);
        if (!team) return;
        
        const modal = document.getElementById('auction-modal');
        const modalContent = document.querySelector('.modal-content');
        
        const roleNames = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' };
        
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <div class="team-roster-modal">
                <h2>🏆 Rosa ${team.name}</h2>
                <div class="roster-summary">
                    <div class="summary-stat">
                        <span class="stat-value">${team.budget}</span>
                        <span class="stat-label">Budget rimanente</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${team.players.length}</span>
                        <span class="stat-label">Giocatori</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">${team.initialBudget - team.budget}</span>
                        <span class="stat-label">Spesi</span>
                    </div>
                </div>
                
                <div class="roster-by-role">
                    ${['P', 'D', 'C', 'A'].map(role => {
                        const playersInRole = team.players.filter(p => p.ruolo === role);
                        const totalSpent = playersInRole.reduce((sum, p) => sum + p.prezzo, 0);
                        const avgPrice = playersInRole.length > 0 ? Math.round(totalSpent / playersInRole.length) : 0;
                        
                        return `
                            <div class="role-section">
                                <h4>${roleNames[role]} (${playersInRole.length}) - €${totalSpent} (media €${avgPrice})</h4>
                                <div class="players-in-role">
                                    ${playersInRole.map(player => `
                                        <div class="roster-player">
                                            <span class="player-name">${player.nome}</span>
                                            <span class="player-team">${player.squadra}</span>
                                            <span class="player-price">${player.prezzo}</span>
                                            <span class="player-value ${player.prezzo <= player.valore ? 'good-deal' : 'expensive'}">
                                                (val. ${player.valore})
                                            </span>
                                        </div>
                                    `).join('')}
                                    ${playersInRole.length === 0 ? '<p class="no-players">Nessun giocatore in questo ruolo</p>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Re-attach close event listener
        modalContent.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        modal.style.display = 'block';
    }

    updateAnalytics() {
        const container = document.getElementById('analytics-dashboard');
        
        const totalSpent = this.participants.reduce((sum, p) => sum + (p.initialBudget - p.budget), 0);
        const avgSpent = this.participants.length > 0 ? totalSpent / this.participants.length : 0;
        const playersSold = this.auctionHistory.length;
        const avgPrice = playersSold > 0 ? totalSpent / playersSold : 0;
        
        const mostExpensive = this.auctionHistory.length > 0 ? 
            this.auctionHistory.reduce((max, auction) => auction.price > max.price ? auction : max) : null;
        
        const bestDeals = this.auctionHistory
            .map(auction => ({
                ...auction,
                ratio: auction.player.valore / auction.price
            }))
            .filter(auction => auction.ratio > 1.2)
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, 3);
        
        container.innerHTML = `
            <div class="stat-item">
                <span>Totale speso:</span>
                <span>${totalSpent}</span>
            </div>
            <div class="stat-item">
                <span>Media per squadra:</span>
                <span>${Math.round(avgSpent)}</span>
            </div>
            <div class="stat-item">
                <span>Giocatori venduti:</span>
                <span>${playersSold}</span>
            </div>
            <div class="stat-item">
                <span>Prezzo medio:</span>
                <span>${Math.round(avgPrice)}</span>
            </div>
            ${mostExpensive ? `
                <div class="stat-item">
                    <span>Più costoso:</span>
                    <span>${mostExpensive.player.nome} (${mostExpensive.price})</span>
                </div>
            ` : ''}
            ${bestDeals.length > 0 ? `
                <div class="best-deals">
                    <h4>Migliori affari:</h4>
                    ${bestDeals.map(deal => `
                        <div class="deal-item">
                            ${deal.player.nome} - ${deal.price} (valore ${deal.player.valore})
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    getSoldTo(playerId) {
        const auction = this.auctionHistory.find(a => a.player.id === playerId);
        return auction ? auction.winner : null;
    }

    undoLastAction() {
        if (this.auctionHistory.length === 0) {
            this.showNotification('Nessuna azione da annullare', 'warning');
            return;
        }
        
        const lastAuction = this.auctionHistory.pop();
        const participant = this.participants.find(p => p.name === lastAuction.winner);
        
        if (participant) {
            participant.budget += lastAuction.price;
            participant.players = participant.players.filter(p => p.id !== lastAuction.player.id);
            participant.roleCount[lastAuction.player.ruolo]--;
        }
        
        this.soldPlayers.delete(lastAuction.player.id);
        
        this.renderParticipants();
        this.renderPlayers();
        this.renderTeamsOverview();
        this.renderTeamsQuickInfo();
        this.saveState();
        
        this.showNotification(`Annullata vendita di ${lastAuction.player.nome}`, 'success');
    }

    undoPlayerSale(playerId) {
        const auction = this.auctionHistory.find(a => a.player.id === playerId);
        if (!auction) {
            this.showNotification('Vendita non trovata', 'error');
            return;
        }

        const participant = this.participants.find(p => p.name === auction.winner);
        if (participant) {
            participant.budget += auction.price;
            participant.players = participant.players.filter(p => p.id !== playerId);
            participant.roleCount[auction.player.ruolo]--;
        }

        this.soldPlayers.delete(playerId);
        this.auctionHistory = this.auctionHistory.filter(a => a.player.id !== playerId);

        this.renderParticipants();
        this.renderPlayers();
        this.renderTeamsOverview();
        this.renderTeamsQuickInfo();
        this.saveState();

        this.showNotification(`Annullata vendita di ${auction.player.nome}`, 'success');
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.getElementById('theme-toggle').textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    exportData() {
        const exportData = {
            participants: this.participants,
            auctionHistory: this.auctionHistory,
            soldPlayers: Array.from(this.soldPlayers),
            timestamp: new Date().toISOString()
        };
        
        const csvData = this.generateCSV();
        
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `fantacalcio-asta-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Dati esportati con successo', 'success');
    }

    generateCSV() {
        let csv = 'Squadra,Giocatore,Ruolo,Squadra Serie A,Prezzo,Valore,Rapporto\n';
        
        this.participants.forEach(participant => {
            participant.players.forEach(player => {
                const ratio = (player.valore / player.prezzo).toFixed(2);
                csv += `${participant.name},${player.nome},${player.ruolo},${player.squadra},${player.prezzo},${player.valore},${ratio}\n`;
            });
        });
        
        return csv;
    }

    saveState() {
        const state = {
            participants: this.participants,
            auctionHistory: this.auctionHistory,
            soldPlayers: Array.from(this.soldPlayers),
            favoritePlayers: Array.from(this.favoritePlayers),
            activeParticipant: this.activeParticipant ? this.activeParticipant.id : null
        };
        
        localStorage.setItem('fantacalcio-auction-state', JSON.stringify(state));
    }

    loadSavedState() {
        const saved = localStorage.getItem('fantacalcio-auction-state');
        if (!saved) return;
        
        try {
            const state = JSON.parse(saved);
            this.participants = state.participants || [];
            this.auctionHistory = state.auctionHistory || [];
            this.soldPlayers = new Set(state.soldPlayers || []);
            this.favoritePlayers = new Set(state.favoritePlayers || []);
            
            if (state.activeParticipant) {
                this.activeParticipant = this.participants.find(p => p.id === state.activeParticipant);
            }
            
            this.showNotification('Stato precedente caricato', 'success');
        } catch (error) {
            console.error('Errore nel caricamento stato:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1500);
    }

    closeModal() {
        document.getElementById('auction-modal').style.display = 'none';
    }

    showTeamsOverview() {
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('teams-overview-page').style.display = 'block';
        this.renderTeamsOverviewPage();
    }

    backToAuction() {
        document.querySelector('.main-content').style.display = 'flex';
        document.getElementById('teams-overview-page').style.display = 'none';
    }

    renderTeamsOverviewPage() {
        const summaryContainer = document.getElementById('teams-page-summary');
        const teamsContainer = document.getElementById('teams-complete-view');

        // Summary statistics
        const totalSpent = this.participants.reduce((sum, p) => sum + (p.initialBudget - p.budget), 0);
        const totalPlayers = this.participants.reduce((sum, p) => sum + p.players.length, 0);
        const avgSpent = this.participants.length > 0 ? Math.round(totalSpent / this.participants.length) : 0;

        summaryContainer.innerHTML = `
            <div>👥 Squadre: ${this.participants.length}</div>
            <div>⚽ Giocatori: ${totalPlayers}</div>
            <div>💰 Totale speso: ${totalSpent}</div>
            <div>📊 Media squadra: ${avgSpent}</div>
        `;

        // Teams with complete rosters
        const teamsGrid = `
            <div class="complete-teams-grid">
                ${this.participants.map(participant => {
            const spentAmount = participant.initialBudget - participant.budget;
            const avgPrice = participant.players.length > 0 ? Math.round(spentAmount / participant.players.length) : 0;

            const roleNames = { P: 'Portieri', D: 'Difensori', C: 'Centrocampo', A: 'Attaccanti' };
            const playersByRole = {
                P: participant.players.filter(p => p.ruolo === 'P'),
                D: participant.players.filter(p => p.ruolo === 'D'),
                C: participant.players.filter(p => p.ruolo === 'C'),
                A: participant.players.filter(p => p.ruolo === 'A')
            };

            return `
                <div class="complete-team-column">
                    <div class="complete-team-header">
                        <div class="complete-team-name">${participant.name}</div>
                        <div class="complete-team-stats">
                            <div class="complete-stat-item">
                                <span class="complete-stat-value">${participant.budget}</span>
                                <span class="complete-stat-label">Budget rimanente</span>
                            </div>
                            <div class="complete-stat-item">
                                <span class="complete-stat-value">${spentAmount}</span>
                                <span class="complete-stat-label">Spesi</span>
                            </div>
                            <div class="complete-stat-item">
                                <span class="complete-stat-value">${avgPrice}</span>
                                <span class="complete-stat-label">Prezzo medio</span>
                            </div>
                        </div>
                    </div>

                    <div class="complete-team-card">
                    ${['P', 'D', 'C', 'A'].map(role => {
                        const players = playersByRole[role];
                        const roleTotal = players.reduce((sum, p) => sum + p.prezzo, 0);
                        const roleLimits = { P: 3, D: 8, C: 8, A: 6 };
                        const currentCount = players.length;
                        const limit = roleLimits[role];
                        
                        let countClass = 'complete-role-count';
                        if (currentCount >= limit) {
                            countClass += ' limit-reached';
                        } else if (currentCount === limit - 1) {
                            countClass += ' limit-warning';
                        }
                        
                        return `
                            <div class="complete-role-section complete-role-${role.toLowerCase()}">
                                <div class="complete-role-header">
                                    <span class="complete-role-title">${roleNames[role]}</span>
                                    <span class="${countClass}">${currentCount}/${limit} (${roleTotal})</span>
                                </div>
                                <div class="complete-players-list">
                                    ${(() => {
                                        const roleLimits = { P: 3, D: 8, C: 8, A: 6 };
                                        const maxSlots = roleLimits[role];
                                        const playerItems = players.map(player => `
                                            <div class="complete-player-item">
                                                <div class="complete-player-info">
                                                    <div class="complete-player-name">${player.nome}</div>
                                                </div>
                                                <div class="complete-player-price">${player.prezzo}</div>
                                            </div>
                                        `);
                                        
                                        // Aggiungi slot vuoti per raggiungere il limite
                                        for (let i = players.length; i < maxSlots; i++) {
                                            playerItems.push(`
                                                <div class="complete-player-item empty-slot">
                                                    <div class="complete-player-info">
                                                        <div class="complete-player-name">-</div>
                                                    </div>
                                                    <div class="complete-player-price">-</div>
                                                </div>
                                            `);
                                        }
                                        
                                        return playerItems.join('');
                                    })()}
                                </div>
                            </div>
                        `;
                    }).join('')}
                    
                    <div class="team-delete-section" style="margin-top: 1.5rem; text-align: center;">
                        <button onclick="app.deleteTeam('${participant.id}')" class="delete-team-btn" style="padding: 0.75rem 1.5rem; background: var(--gradient-danger); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                            🗑️ Elimina Squadra
                        </button>
                    </div>
                    </div>
                </div>
            `;
        }).join('')}
            </div>
        `;
        
        teamsContainer.innerHTML = teamsGrid;
        
        // Force horizontal scroll for complete teams view
        setTimeout(() => {
            const completeTeamsGrid = teamsContainer.querySelector('.complete-teams-grid');
            if (completeTeamsGrid && this.participants.length > 0) {
                const teamCardWidth = 240; // Fixed width from CSS
                const gap = 16; // 1rem gap between columns
                const totalWidth = (this.participants.length * (teamCardWidth + gap)) + 32; // 32px per padding
                completeTeamsGrid.style.width = `${Math.max(totalWidth, window.innerWidth)}px`;
            }
            
            // Setup sticky headers with JavaScript
            this.setupStickyHeaders();
        }, 100);
    }

    setupStickyHeaders() {
        const teamsCompleteView = document.querySelector('.teams-complete-view');
        const headers = document.querySelectorAll('.complete-team-header');
        
        if (!teamsCompleteView || headers.length === 0) return;
        
        const handleScroll = () => {
            const containerRect = teamsCompleteView.getBoundingClientRect();
            const scrollTop = teamsCompleteView.scrollTop;
            const scrollLeft = teamsCompleteView.scrollLeft;
            
            headers.forEach((header, index) => {
                const column = header.closest('.complete-team-column');
                if (!column) return;
                
                // Calculate column position accounting for scroll
                const baseLeft = (index * 256) + 16; // 240px width + 16px margin
                const adjustedLeft = baseLeft - scrollLeft;
                
                // Always keep header at top when scrolling vertically
                if (scrollTop > 0) {
                    header.classList.add('fixed');
                    header.style.top = `${containerRect.top}px`;
                    header.style.left = `${containerRect.left + adjustedLeft}px`;
                    header.style.zIndex = '150';
                } else {
                    header.classList.remove('fixed');
                    header.style.top = '0';
                    header.style.left = '0';
                    header.style.zIndex = '100';
                }
            });
        };
        
        teamsCompleteView.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll); // Handle window resize
        handleScroll(); // Initial call
    }

    removePlayerFromTeam(teamId, playerId) {
        const team = this.participants.find(p => p.id === teamId);
        if (!team) return;

        const playerIndex = team.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const removedPlayer = team.players[playerIndex];
        
        // Rimborsa il budget
        team.budget += removedPlayer.prezzo;
        
        // Rimuovi il giocatore dalla squadra
        team.players.splice(playerIndex, 1);
        team.roleCount[removedPlayer.ruolo]--;
        
        // Rimuovi dall'elenco venduti
        this.soldPlayers.delete(playerId);
        
        // Rimuovi dalla storia aste
        this.auctionHistory = this.auctionHistory.filter(auction => auction.player.id !== playerId);
        
        // Aggiorna tutte le visualizzazioni
        this.renderTeamsOverviewPage();
        this.renderParticipants();
        this.renderPlayers();
        this.renderTeamsQuickInfo();
        this.saveState();
        
        this.showNotification(`${removedPlayer.nome} rimosso da ${team.name}. Budget rimborsato: ${removedPlayer.prezzo}`, 'success');
    }

    deleteTeam(teamId) {
        if (!confirm('Sei sicuro di voler eliminare questa squadra? Tutti i giocatori torneranno disponibili.')) {
            return;
        }

        const team = this.participants.find(p => p.id === teamId);
        if (!team) return;

        // Rilascia tutti i giocatori della squadra
        team.players.forEach(player => {
            this.soldPlayers.delete(player.id);
        });

        // Rimuovi dalle aste storiche
        this.auctionHistory = this.auctionHistory.filter(auction => 
            !team.players.some(player => player.id === auction.player.id)
        );

        // Rimuovi la squadra
        this.participants = this.participants.filter(p => p.id !== teamId);

        // Se era la squadra attiva, rimuovi selezione
        if (this.activeParticipant && this.activeParticipant.id === teamId) {
            this.activeParticipant = null;
        }

        // Aggiorna tutte le visualizzazioni
        this.renderTeamsOverviewPage();
        this.renderParticipants();
        this.renderPlayers();
        this.renderTeamsQuickInfo();
        this.saveState();

        this.showNotification(`Squadra ${team.name} eliminata. Giocatori rilasciati.`, 'success');
    }
    
    getRoleFullName(role) {
        const roleNames = {
            'P': 'Portieri',
            'D': 'Difensori', 
            'C': 'Centrocampisti',
            'A': 'Attaccanti'
        };
        return roleNames[role] || role;
    }
}

const app = new FantaCalcioAuction();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        app.closeModal();
        app.selectedPlayer = null;
        app.renderSelectedPlayer();
        app.renderPlayers();
    }
});