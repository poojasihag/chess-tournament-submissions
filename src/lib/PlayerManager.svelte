<script>
  import { playersStore, tournamentsStore, matchesStore, addPlayer, updatePlayer, deletePlayer } from './store.js';

  let searchQuery = '';
  let minRatingFilter = 0;
  let showAddModal = false;
  let editingPlayer = null;
  let deleteError = '';

  // Form State
  let name = '';
  let rating = 1500;
  let email = '';
  let title = 'None';

  function resetForm() {
    name = '';
    rating = 1500;
    email = '';
    title = 'None';
    editingPlayer = null;
    deleteError = '';
  }

  function handleSavePlayer() {
    if (!name.trim()) return;

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, { name, rating: Number(rating), email, title });
    } else {
      addPlayer({ name, rating: Number(rating), email, title });
    }

    showAddModal = false;
    resetForm();
  }

  function handleEdit(player) {
    editingPlayer = player;
    name = player.name;
    rating = player.rating;
    email = player.email || '';
    title = player.title || 'None';
    showAddModal = true;
  }

  function handleDelete(player) {
    deleteError = '';
    // Safety check: is player in any tournament or matches?
    const enrolledTournament = $tournamentsStore.find(t => t.playerIds && t.playerIds.includes(player.id));
    const hasMatchHistory = $matchesStore.find(m => m.player1Id === player.id || m.player2Id === player.id);

    if (enrolledTournament) {
      deleteError = `Cannot delete ${player.name}: Player is currently enrolled in tournament "${enrolledTournament.name}".`;
      return;
    }

    if (hasMatchHistory) {
      deleteError = `Cannot delete ${player.name}: Player has active match records in the database.`;
      return;
    }

    if (confirm(`Are you sure you want to delete player ${player.name}?`)) {
      deletePlayer(player.id);
    }
  }

  $: filteredPlayers = $playersStore.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = p.rating >= minRatingFilter;
    return matchesSearch && matchesRating;
  });

  $: avgRating = $playersStore.length > 0 
    ? Math.round($playersStore.reduce((acc, p) => acc + Number(p.rating), 0) / $playersStore.length) 
    : 0;

  $: gmCount = $playersStore.filter(p => p.title === 'GM').length;
</script>

<div class="player-manager">
  <!-- Header & Stats Cards -->
  <div class="header-section">
    <div>
      <h2 class="title">Player Directory</h2>
      <p class="subtitle">Manage chess competitors, ratings, and master titles</p>
    </div>
    <button class="btn btn-gold" on:click={() => { resetForm(); showAddModal = true; }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add New Player
    </button>
  </div>

  <div class="stats-grid">
    <div class="glass-card stat-card">
      <div class="stat-icon purple">♟️</div>
      <div>
        <div class="stat-value">{$playersStore.length}</div>
        <div class="stat-label">Total Players</div>
      </div>
    </div>
    <div class="glass-card stat-card">
      <div class="stat-icon gold">⭐</div>
      <div>
        <div class="stat-value">{avgRating}</div>
        <div class="stat-label">Avg ELO Rating</div>
      </div>
    </div>
    <div class="glass-card stat-card">
      <div class="stat-icon emerald">👑</div>
      <div>
        <div class="stat-value">{gmCount}</div>
        <div class="stat-label">Grandmasters</div>
      </div>
    </div>
  </div>

  {#if deleteError}
    <div class="alert alert-danger">
      <span>⚠️ {deleteError}</span>
      <button class="alert-close" on:click={() => deleteError = ''}>✕</button>
    </div>
  {/if}

  <!-- Controls Bar -->
  <div class="controls-bar glass-card">
    <div class="search-box">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" placeholder="Search player by name or email..." bind:value={searchQuery} class="form-input search-input" />
    </div>

    <div class="filter-box">
      <label class="filter-label">Min Rating:</label>
      <input type="range" min="1000" max="2800" step="50" bind:value={minRatingFilter} class="range-slider" />
      <span class="rating-badge">{minRatingFilter}+ ELO</span>
    </div>
  </div>

  <!-- Players Table Grid -->
  <div class="glass-card table-container">
    {#if filteredPlayers.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No Players Found</h3>
        <p>Try adjusting your search criteria or add a new player.</p>
      </div>
    {:else}
      <table class="players-table">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Title</th>
            <th>ELO Rating</th>
            <th>Email Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredPlayers as player (player.id)}
            <tr>
              <td class="player-cell">
                <div class="avatar">{player.name.charAt(0)}</div>
                <div class="player-info">
                  <span class="player-name">{player.name}</span>
                </div>
              </td>
              <td>
                <span class="badge {player.title === 'GM' ? 'badge-gold' : 'badge-subtle'}">
                  {player.title || 'None'}
                </span>
              </td>
              <td class="rating-cell">
                <span class="rating-num">{player.rating}</span>
                <span class="rating-bar" style="width: {Math.min(100, Math.max(10, (player.rating - 1000) / 20))}%"></span>
              </td>
              <td class="email-cell">{player.email || '—'}</td>
              <td class="actions-cell">
                <button class="action-btn edit-btn" title="Edit Player" on:click={() => handleEdit(player)}>✏️</button>
                <button class="action-btn delete-btn" title="Delete Player" on:click={() => handleDelete(player)}>🗑️</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<!-- Modal for Create / Edit -->
{#if showAddModal}
  <div class="modal-overlay" on:click|self={() => showAddModal = false}>
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>{editingPlayer ? 'Edit Player Details' : 'Add New Player'}</h3>
        <button class="modal-close" on:click={() => showAddModal = false}>✕</button>
      </div>
      <form on:submit|preventDefault={handleSavePlayer}>
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" required placeholder="e.g. Garry Kasparov" bind:value={name} class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ELO Rating *</label>
            <input type="number" min="500" max="3200" required bind:value={rating} class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Title</label>
            <select bind:value={title} class="form-select">
              <option value="None">None</option>
              <option value="GM">Grandmaster (GM)</option>
              <option value="IM">International Master (IM)</option>
              <option value="FM">FIDE Master (FM)</option>
              <option value="CM">Candidate Master (CM)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" placeholder="player@chess.com" bind:value={email} class="form-input" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" on:click={() => showAddModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">{editingPlayer ? 'Save Changes' : 'Create Player'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .player-manager {
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
  .title {
    font-size: 1.75rem;
    color: var(--text-main);
  }
  .subtitle {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }
  .stat-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem;
  }
  .stat-icon {
    font-size: 1.75rem;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
  }
  .stat-value {
    font-size: 1.6rem;
    font-weight: 800;
    font-family: var(--font-heading);
    color: var(--text-main);
  }
  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .search-box {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1;
    min-width: 250px;
  }
  .search-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-dim);
  }
  .search-input {
    padding-left: 2.75rem;
  }
  .filter-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .filter-label {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .rating-badge {
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .table-container {
    overflow-x: auto;
  }
  .players-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .players-table th {
    padding: 1rem 1.25rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-light);
  }
  .players-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .players-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }

  .player-cell {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }
  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  .player-name {
    font-weight: 600;
    color: var(--text-main);
  }

  .badge-gold {
    background: rgba(245, 158, 11, 0.2);
    color: #fcd34d;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  .badge-subtle {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
  }

  .rating-num {
    font-family: var(--font-heading);
    font-weight: 700;
    color: var(--gold);
    display: block;
  }
  .rating-bar {
    display: block;
    height: 3px;
    background: var(--gold);
    border-radius: 2px;
    margin-top: 4px;
  }

  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }
  .action-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    transition: background var(--transition-fast);
  }
  .action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }
  .modal-content {
    width: 100%;
    max-width: 480px;
    padding: 1.75rem;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  .modal-close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    cursor: pointer;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .alert {
    padding: 0.85rem 1.25rem;
    border-radius: var(--radius-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .alert-danger {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }
  .alert-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
  }
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
  }
  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
</style>
