<script>
  import { 
    matchesStore, 
    tournamentsStore, 
    playersStore, 
    addMatches, 
    updateMatchWinner 
  } from './store.js';

  let selectedTournamentId = '';

  // Auto-select first active or draft tournament
  $: if (!selectedTournamentId && $tournamentsStore.length > 0) {
    selectedTournamentId = $tournamentsStore[0].id;
  }

  $: currentTournament = $tournamentsStore.find(t => t.id === selectedTournamentId);
  $: tournamentMatches = $matchesStore.filter(m => m.tournamentId === selectedTournamentId);
  $: enrolledPlayerIds = currentTournament ? currentTournament.playerIds || [] : [];
  $: enrolledPlayersList = $playersStore.filter(p => enrolledPlayerIds.includes(p.id));

  // Fisher-Yates Shuffle Algorithm for Random Match Pairing
  function generateRandomPairings() {
    if (!currentTournament) return;

    if (enrolledPlayerIds.length < 2) {
      alert('At least 2 enrolled players are required to generate match pairings.');
      return;
    }

    // Shuffle array of player IDs
    const shuffled = [...enrolledPlayerIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newMatches = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newMatches.push({
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        tournamentId: selectedTournamentId,
        player1Id: shuffled[i],
        player2Id: shuffled[i + 1],
        winnerId: null,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      });
    }

    addMatches(newMatches);
  }

  // Randomly select a winner for a specific match
  function simulateRandomWinner(match) {
    const players = [match.player1Id, match.player2Id];
    const randomIndex = Math.floor(Math.random() * players.length);
    const winnerId = players[randomIndex];
    updateMatchWinner(match.id, winnerId);
  }

  // Simulate winners for all pending matches in tournament
  function simulateAllMatches() {
    const pendingMatches = tournamentMatches.filter(m => m.status !== 'Completed');
    if (pendingMatches.length === 0) {
      alert('No pending matches to simulate.');
      return;
    }
    pendingMatches.forEach(m => simulateRandomWinner(m));
  }

  function getPlayer(id) {
    return $playersStore.find(p => p.id === id) || { name: 'Unknown Player', rating: '?' };
  }
</script>

<div class="match-system">
  <div class="header-section">
    <div>
      <h2 class="title">Match Pairing & Simulator</h2>
      <p class="subtitle">Random pairing engine, match scheduling, and winner recording</p>
    </div>
    
    <div class="header-actions">
      <!-- Select Active Tournament -->
      <select bind:value={selectedTournamentId} class="form-select tourney-select">
        {#each $tournamentsStore as t}
          <option value={t.id}>{t.name} ({t.playerIds ? t.playerIds.length : 0} Players)</option>
        {/each}
      </select>

      <button class="btn btn-gold" on:click={generateRandomPairings}>
        🎲 Generate Random Pairings
      </button>
      
      <button class="btn btn-primary" on:click={simulateAllMatches}>
        ⚡ Simulate All Winners
      </button>
    </div>
  </div>

  {#if !currentTournament}
    <div class="glass-card empty-state">
      <div class="empty-icon">🎲</div>
      <h3>No Tournament Selected</h3>
      <p>Please create or select a tournament to generate matches.</p>
    </div>
  {:else}
    <!-- Tournament Stats Banner -->
    <div class="glass-card banner-card">
      <div class="banner-item">
        <span class="b-label">Tournament</span>
        <span class="b-val">{currentTournament.name}</span>
      </div>
      <div class="banner-item">
        <span class="b-label">Enrolled Roster</span>
        <span class="b-val">{enrolledPlayersList.length} Competitors</span>
      </div>
      <div class="banner-item">
        <span class="b-label">Matches Scheduled</span>
        <span class="b-val">{tournamentMatches.length} Total ({tournamentMatches.filter(m => m.status === 'Completed').length} Finished)</span>
      </div>
    </div>

    <!-- Match Grid -->
    {#if tournamentMatches.length === 0}
      <div class="glass-card empty-state">
        <div class="empty-icon">⚔️</div>
        <h3>No Matches Generated</h3>
        <p>Click "Generate Random Pairings" to pair enrolled players using the Fisher-Yates algorithm.</p>
      </div>
    {:else}
      <div class="matches-grid">
        {#each tournamentMatches as match (match.id)}
          {@const p1 = getPlayer(match.player1Id)}
          {@const p2 = getPlayer(match.player2Id)}
          {@const isP1Winner = match.winnerId === match.player1Id}
          {@const isP2Winner = match.winnerId === match.player2Id}

          <div class="glass-card match-card {match.status === 'Completed' ? 'completed' : ''}">
            <div class="match-header">
              <span class="match-status {match.status === 'Completed' ? 'badge-completed' : 'badge-draft'}">
                {match.status === 'Completed' ? '✓ Finished' : '⌛ Pending'}
              </span>
              <span class="match-id">Match #{match.id.slice(-4)}</span>
            </div>

            <div class="versus-wrap">
              <!-- Player 1 Card -->
              <div class="player-vs-box {isP1Winner ? 'winner' : ''}">
                <div class="vs-avatar">{p1.name.charAt(0)}</div>
                <div class="vs-name">{p1.name}</div>
                <div class="vs-rating">⚡ {p1.rating}</div>
                {#if isP1Winner}
                  <span class="winner-crown">👑 Winner</span>
                {/if}
              </div>

              <div class="vs-badge">VS</div>

              <!-- Player 2 Card -->
              <div class="player-vs-box {isP2Winner ? 'winner' : ''}">
                <div class="vs-avatar second">{p2.name.charAt(0)}</div>
                <div class="vs-name">{p2.name}</div>
                <div class="vs-rating">⚡ {p2.rating}</div>
                {#if isP2Winner}
                  <span class="winner-crown">👑 Winner</span>
                {/if}
              </div>
            </div>

            <!-- Match Action Bar -->
            <div class="match-actions">
              {#if match.status === 'Completed'}
                <div class="result-summary">
                  Result: <strong class="gold-text">{getPlayer(match.winnerId).name}</strong> won!
                </div>
              {:else}
                <div class="action-buttons-wrap">
                  <button class="btn btn-secondary btn-sm" on:click={() => updateMatchWinner(match.id, match.player1Id)}>
                    🏆 {p1.name} Wins
                  </button>
                  <button class="btn btn-gold btn-sm" on:click={() => simulateRandomWinner(match)}>
                    🎲 Random Winner
                  </button>
                  <button class="btn btn-secondary btn-sm" on:click={() => updateMatchWinner(match.id, match.player2Id)}>
                    🏆 {p2.name} Wins
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .match-system {
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .tourney-select {
    min-width: 220px;
    padding: 0.6rem 0.85rem;
  }

  .banner-card {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .banner-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .b-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
  .b-val { font-size: 1.2rem; font-weight: 700; font-family: var(--font-heading); color: var(--gold); }

  .matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
  }
  .match-card {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .match-card.completed {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .match-id {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  .versus-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .player-vs-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    text-align: center;
    transition: all var(--transition-normal);
  }
  .player-vs-box.winner {
    border-color: var(--gold);
    background: rgba(245, 158, 11, 0.1);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
  }
  .vs-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
  .vs-avatar.second {
    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  }
  .vs-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
  }
  .vs-rating {
    font-size: 0.75rem;
    color: var(--gold);
  }
  .winner-crown {
    margin-top: 0.4rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--gold);
  }

  .vs-badge {
    font-family: var(--font-heading);
    font-weight: 900;
    font-size: 0.9rem;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.05);
    padding: 0.3rem 0.6rem;
    border-radius: 50%;
    border: 1px solid var(--border-light);
  }

  .match-actions {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
  }
  .action-buttons-wrap {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .result-summary {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  .gold-text { color: var(--gold); }

  .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

  @media (max-width: 640px) {
    .header-section {
      flex-direction: column;
      align-items: stretch;
    }
    .header-actions {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }
    .tourney-select {
      width: 100%;
    }
    .matches-grid {
      grid-template-columns: 1fr;
    }
    .action-buttons-wrap {
      flex-direction: column;
    }
    .action-buttons-wrap .btn {
      width: 100%;
    }
  }
</style>
