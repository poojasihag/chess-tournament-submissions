<script>
  import { 
    tournamentsStore, 
    playersStore, 
    addTournament, 
    updateTournament, 
    deleteTournament,
    addPlayerToTournament,
    removePlayerFromTournament 
  } from './store.js';

  let showAddModal = false;
  let showRosterModal = false;
  let editingTournament = null;
  let selectedTournament = null;

  // Form fields
  let name = '';
  let description = '';
  let startDate = new Date().toISOString().split('T')[0];
  let status = 'Draft';

  // Roster search
  let playerSearch = '';

  function resetForm() {
    name = '';
    description = '';
    startDate = new Date().toISOString().split('T')[0];
    status = 'Draft';
    editingTournament = null;
  }

  function handleSaveTournament() {
    if (!name.trim()) return;

    if (editingTournament) {
      updateTournament(editingTournament.id, { name, description, startDate, status });
    } else {
      addTournament({ name, description, startDate, status });
    }

    showAddModal = false;
    resetForm();
  }

  function handleEdit(tournament) {
    editingTournament = tournament;
    name = tournament.name;
    description = tournament.description || '';
    startDate = tournament.startDate;
    status = tournament.status;
    showAddModal = true;
  }

  function handleDelete(id, tourneyName) {
    if (confirm(`Are you sure you want to delete tournament "${tourneyName}"? This will also remove associated match pairings.`)) {
      deleteTournament(id);
    }
  }

  function openRosterModal(tournament) {
    selectedTournament = tournament;
    playerSearch = '';
    showRosterModal = true;
  }

  // Get enrolled players objects for selected tournament
  $: enrolledPlayers = selectedTournament ? $playersStore.filter(p => selectedTournament.playerIds.includes(p.id)) : [];
  
  // Available players to add
  $: availablePlayers = selectedTournament 
    ? $playersStore.filter(p => 
        !selectedTournament.playerIds.includes(p.id) &&
        p.name.toLowerCase().includes(playerSearch.toLowerCase())
      ) 
    : [];
</script>

<div class="tournament-manager">
  <div class="header-section">
    <div>
      <h2 class="title">Tournaments</h2>
      <p class="subtitle">Organize chess events, manage rosters, and control tournament status</p>
    </div>
    <button class="btn btn-gold" on:click={() => { resetForm(); showAddModal = true; }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Create Tournament
    </button>
  </div>

  <!-- Tournament Grid -->
  {#if $tournamentsStore.length === 0}
    <div class="glass-card empty-state">
      <div class="empty-icon">🏆</div>
      <h3>No Tournaments Created Yet</h3>
      <p>Click "Create Tournament" to start pairing players and running chess matches.</p>
    </div>
  {:else}
    <div class="tournaments-grid">
      {#each $tournamentsStore as tournament (tournament.id)}
        <div class="glass-card tournament-card">
          <div class="card-header">
            <div class="badge-wrap">
              <span class="badge {tournament.status === 'Active' ? 'badge-active' : tournament.status === 'Completed' ? 'badge-completed' : 'badge-draft'}">
                {tournament.status}
              </span>
              <span class="date-badge">📅 {tournament.startDate}</span>
            </div>
            <div class="card-actions">
              <button class="icon-btn" title="Edit Tournament" on:click={() => handleEdit(tournament)}>✏️</button>
              <button class="icon-btn delete-icon" title="Delete Tournament" on:click={() => handleDelete(tournament.id, tournament.name)}>🗑️</button>
            </div>
          </div>

          <h3 class="tournament-name">{tournament.name}</h3>
          <p class="tournament-desc">{tournament.description || 'No description provided.'}</p>

          <div class="roster-preview">
            <div class="roster-info">
              <span class="roster-count">♟️ {tournament.playerIds ? tournament.playerIds.length : 0} Players Enrolled</span>
            </div>
            <button class="btn btn-secondary btn-sm" on:click={() => openRosterModal(tournament)}>
              Manage Roster 👥
            </button>
          </div>

          <!-- Status Switcher Shortcuts -->
          <div class="status-bar">
            <span class="status-label">Change Status:</span>
            <div class="status-buttons">
              <button 
                class="status-pill {tournament.status === 'Draft' ? 'active' : ''}" 
                on:click={() => updateTournament(tournament.id, { status: 'Draft' })}
              >Draft</button>
              <button 
                class="status-pill {tournament.status === 'Active' ? 'active' : ''}" 
                on:click={() => updateTournament(tournament.id, { status: 'Active' })}
              >Active</button>
              <button 
                class="status-pill {tournament.status === 'Completed' ? 'active' : ''}" 
                on:click={() => updateTournament(tournament.id, { status: 'Completed' })}
              >Completed</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal: Create / Edit Tournament -->
{#if showAddModal}
  <div class="modal-overlay" on:click|self={() => showAddModal = false}>
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>{editingTournament ? 'Edit Tournament' : 'Create Tournament'}</h3>
        <button class="modal-close" on:click={() => showAddModal = false}>✕</button>
      </div>
      <form on:submit|preventDefault={handleSaveTournament}>
        <div class="form-group">
          <label class="form-label">Tournament Name *</label>
          <input type="text" required placeholder="e.g. World Chess Blitz Cup" bind:value={name} class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea rows="3" placeholder="Tournament details, location, or format..." bind:value={description} class="form-input"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input type="date" required bind:value={startDate} class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Initial Status</label>
            <select bind:value={status} class="form-select">
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" on:click={() => showAddModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">{editingTournament ? 'Save Changes' : 'Create Tournament'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Modal: Manage Roster & Player Enrolment -->
{#if showRosterModal && selectedTournament}
  <div class="modal-overlay" on:click|self={() => showRosterModal = false}>
    <div class="modal-content glass-card roster-modal">
      <div class="modal-header">
        <div>
          <h3>Roster Enrolment</h3>
          <p class="subtitle">{selectedTournament.name}</p>
        </div>
        <button class="modal-close" on:click={() => showRosterModal = false}>✕</button>
      </div>

      <div class="roster-split">
        <!-- Currently Enrolled -->
        <div class="roster-col">
          <h4 class="col-title">Enrolled Players ({enrolledPlayers.length})</h4>
          {#if enrolledPlayers.length === 0}
            <div class="empty-sub">No players enrolled yet. Add from available list.</div>
          {:else}
            <div class="player-list">
              {#each enrolledPlayers as player (player.id)}
                <div class="roster-item enrolled">
                  <div>
                    <div class="p-name">{player.name}</div>
                    <div class="p-rating">⚡ {player.rating} ELO</div>
                  </div>
                  <button class="btn btn-danger btn-sm" on:click={() => {
                    removePlayerFromTournament(selectedTournament.id, player.id);
                    selectedTournament = $tournamentsStore.find(t => t.id === selectedTournament.id);
                  }}>Remove ✕</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Available Players -->
        <div class="roster-col">
          <h4 class="col-title">Available Players ({availablePlayers.length})</h4>
          <input type="text" placeholder="Search available players..." bind:value={playerSearch} class="form-input search-sub" />
          
          {#if availablePlayers.length === 0}
            <div class="empty-sub">All players are enrolled or no matches.</div>
          {:else}
            <div class="player-list">
              {#each availablePlayers as player (player.id)}
                <div class="roster-item available">
                  <div>
                    <div class="p-name">{player.name}</div>
                    <div class="p-rating">⚡ {player.rating} ELO</div>
                  </div>
                  <button class="btn btn-primary btn-sm" on:click={() => {
                    addPlayerToTournament(selectedTournament.id, player.id);
                    selectedTournament = $tournamentsStore.find(t => t.id === selectedTournament.id);
                  }}>Add +</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-gold" on:click={() => showRosterModal = false}>Done</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .tournament-manager {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .title { font-size: 1.75rem; color: var(--text-main); }
  .subtitle { font-size: 0.9rem; color: var(--text-muted); }

  .tournaments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  .tournament-card {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .date-badge {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .card-actions { display: flex; gap: 0.4rem; }
  .icon-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 0.35rem 0.55rem;
    cursor: pointer;
  }
  .icon-btn:hover { background: rgba(255, 255, 255, 0.15); }

  .tournament-name {
    font-size: 1.3rem;
    color: var(--text-main);
  }
  .tournament-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .roster-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .roster-count {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--gold);
  }

  .status-bar {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  .status-label {
    font-size: 0.75rem;
    color: var(--text-dim);
    text-transform: uppercase;
  }
  .status-buttons {
    display: flex;
    gap: 0.4rem;
  }
  .status-pill {
    flex: 1;
    padding: 0.3rem;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    color: var(--text-muted);
    cursor: pointer;
    text-align: center;
    transition: all var(--transition-fast);
  }
  .status-pill.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }
  .modal-content {
    width: 100%;
    max-width: 500px;
    padding: 1.75rem;
  }
  .roster-modal { max-width: 720px; }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
  }
  .modal-close {
    background: none; border: none; color: var(--text-muted); font-size: 1.25rem; cursor: pointer;
  }

  .roster-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 640px) {
    .roster-split { grid-template-columns: 1fr; }
  }
  .roster-col {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .col-title {
    font-size: 0.9rem;
    color: var(--text-main);
  }
  .search-sub {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
    overflow-y: auto;
  }
  .roster-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }
  .p-name { font-weight: 600; font-size: 0.85rem; color: var(--text-main); }
  .p-rating { font-size: 0.75rem; color: var(--gold); }
  .empty-sub { font-size: 0.8rem; color: var(--text-dim); text-align: center; padding: 1.5rem 0; }

  .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }

  @media (max-width: 640px) {
    .header-section {
      flex-direction: column;
      align-items: stretch;
    }
    .tournaments-grid {
      grid-template-columns: 1fr;
    }
    .modal-content {
      padding: 1.25rem;
    }
  }
</style>
