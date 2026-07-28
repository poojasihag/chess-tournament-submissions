<script>
  import { tournamentsStore, matchesStore, playersStore } from './store.js';

  let selectedTournamentId = '';

  $: if (!selectedTournamentId && $tournamentsStore.length > 0) {
    selectedTournamentId = $tournamentsStore[0].id;
  }

  $: currentTournament = $tournamentsStore.find(t => t.id === selectedTournamentId);
  $: tournamentMatches = $matchesStore.filter(m => m.tournamentId === selectedTournamentId && m.status === 'Completed');
  $: enrolledPlayerIds = currentTournament ? currentTournament.playerIds || [] : [];
  
  // Calculate Standings & Points
  $: standings = enrolledPlayerIds.map(pId => {
    const player = $playersStore.find(p => p.id === pId) || { name: 'Unknown', rating: '?' };
    const playedMatches = tournamentMatches.filter(m => m.player1Id === pId || m.player2Id === pId);
    const wins = tournamentMatches.filter(m => m.winnerId === pId).length;
    const losses = playedMatches.length - wins;
    const points = wins * 3;
    const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;

    return {
      player,
      played: playedMatches.length,
      wins,
      losses,
      points,
      winRate
    };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.player.rating - a.player.rating;
  });

  $: podiumFirst = standings[0] || null;
  $: podiumSecond = standings[1] || null;
  $: podiumThird = standings[2] || null;
</script>

<div class="ranking-leaderboard">
  <div class="header-section">
    <div>
      <h2 class="title">Tournament Standings & Podium</h2>
      <p class="subtitle">Final rankings, win statistics, and top 3 podium awards</p>
    </div>

    <div class="header-actions">
      <select bind:value={selectedTournamentId} class="form-select tourney-select">
        {#each $tournamentsStore as t}
          <option value={t.id}>{t.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if !currentTournament}
    <div class="glass-card empty-state">
      <div class="empty-icon">🏆</div>
      <h3>No Tournament Selected</h3>
      <p>Select a tournament to view standings and rankings.</p>
    </div>
  {:else}
    <!-- Top 3 Podium Cards -->
    <div class="podium-section">
      <!-- 2nd Place (Silver) -->
      <div class="glass-card podium-card silver-card">
        <div class="podium-badge silver">🥈 2nd Place</div>
        <div class="podium-avatar">
          {podiumSecond ? podiumSecond.player.name.charAt(0) : '?'}
        </div>
        <h3 class="podium-name">{podiumSecond ? podiumSecond.player.name : 'TBD'}</h3>
        <div class="podium-pts">{podiumSecond ? `${podiumSecond.points} PTS` : '0 PTS'}</div>
        <div class="podium-sub">{podiumSecond ? `⚡ ${podiumSecond.player.rating} ELO` : ''}</div>
      </div>

      <!-- 1st Place (Gold Winner) -->
      <div class="glass-card podium-card gold-card">
        <div class="crown-icon">👑</div>
        <div class="podium-badge gold">🥇 1st Place Champion</div>
        <div class="podium-avatar gold-avatar">
          {podiumFirst ? podiumFirst.player.name.charAt(0) : '?'}
        </div>
        <h3 class="podium-name champion">{podiumFirst ? podiumFirst.player.name : 'TBD'}</h3>
        <div class="podium-pts gold-text">{podiumFirst ? `${podiumFirst.points} PTS` : '0 PTS'}</div>
        <div class="podium-sub">{podiumFirst ? `⚡ ${podiumFirst.player.rating} ELO • ${podiumFirst.wins} Wins` : ''}</div>
      </div>

      <!-- 3rd Place (Bronze) -->
      <div class="glass-card podium-card bronze-card">
        <div class="podium-badge bronze">🥉 3rd Place</div>
        <div class="podium-avatar">
          {podiumThird ? podiumThird.player.name.charAt(0) : '?'}
        </div>
        <h3 class="podium-name">{podiumThird ? podiumThird.player.name : 'TBD'}</h3>
        <div class="podium-pts">{podiumThird ? `${podiumThird.points} PTS` : '0 PTS'}</div>
        <div class="podium-sub">{podiumThird ? `⚡ ${podiumThird.player.rating} ELO` : ''}</div>
      </div>
    </div>

    <!-- Complete Leaderboard Table -->
    <div class="glass-card table-container">
      <div class="table-title-bar">
        <h3>Official Rankings Table</h3>
        <span class="badge badge-completed">{tournamentMatches.length} Matches Logged</span>
      </div>

      {#if standings.length === 0}
        <div class="empty-state">
          <p>No players enrolled in this tournament yet.</p>
        </div>
      {:else}
        <table class="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Competitor</th>
              <th>ELO Rating</th>
              <th>Matches Played</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win Rate</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {#each standings as item, index}
              <tr class={index === 0 ? 'gold-row' : index === 1 ? 'silver-row' : index === 2 ? 'bronze-row' : ''}>
                <td class="rank-cell">
                  {#if index === 0}
                    <span class="rank-icon gold">🥇 1</span>
                  {:else if index === 1}
                    <span class="rank-icon silver">🥈 2</span>
                  {:else if index === 2}
                    <span class="rank-icon bronze">🥉 3</span>
                  {:else}
                    <span class="rank-num">#{index + 1}</span>
                  {/if}
                </td>
                <td class="player-cell">
                  <span class="p-name">{item.player.name}</span>
                  {#if item.player.title && item.player.title !== 'None'}
                    <span class="title-tag">{item.player.title}</span>
                  {/if}
                </td>
                <td class="elo-cell">⚡ {item.player.rating}</td>
                <td>{item.played}</td>
                <td class="win-count">+{item.wins}</td>
                <td class="loss-count">-{item.losses}</td>
                <td>
                  <div class="winrate-bar-wrap">
                    <span class="wr-text">{item.winRate}%</span>
                    <span class="wr-bar" style="width: {item.winRate}%"></span>
                  </div>
                </td>
                <td class="points-cell">{item.points} PTS</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ranking-leaderboard {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
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

  .tourney-select {
    min-width: 240px;
    padding: 0.6rem 0.85rem;
  }

  /* Podium Styling */
  .podium-section {
    display: grid;
    grid-template-columns: 1fr 1.15fr 1fr;
    gap: 1.25rem;
    align-items: end;
  }
  @media (max-width: 768px) {
    .podium-section { grid-template-columns: 1fr; }
  }

  .podium-card {
    padding: 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .gold-card {
    border-color: rgba(245, 158, 11, 0.4);
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%);
    box-shadow: 0 15px 35px -10px rgba(245, 158, 11, 0.25);
    transform: translateY(-10px);
  }
  .silver-card {
    border-color: rgba(148, 163, 184, 0.3);
  }
  .bronze-card {
    border-color: rgba(217, 119, 6, 0.3);
  }

  .crown-icon {
    font-size: 2.2rem;
    position: absolute;
    top: -24px;
  }
  .podium-badge {
    font-size: 0.75rem;
    font-weight: 800;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }
  .podium-badge.gold { background: rgba(245, 158, 11, 0.25); color: #fde047; border: 1px solid var(--gold); }
  .podium-badge.silver { background: rgba(148, 163, 184, 0.2); color: #e2e8f0; border: 1px solid var(--silver); }
  .podium-badge.bronze { background: rgba(217, 119, 6, 0.2); color: #fdba74; border: 1px solid var(--bronze); }

  .podium-avatar {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%);
    color: white;
    font-size: 1.5rem;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.75rem;
  }
  .gold-avatar {
    width: 72px; height: 72px;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0f172a;
  }

  .podium-name { font-size: 1.1rem; color: var(--text-main); font-weight: 700; }
  .podium-name.champion { font-size: 1.3rem; color: #fde047; }
  .podium-pts { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem; }
  .gold-text { color: var(--gold); font-size: 1.5rem; }
  .podium-sub { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

  /* Table */
  .table-container { padding: 1.25rem; }
  .table-title-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);
  }
  .standings-table { width: 100%; border-collapse: collapse; text-align: left; }
  .standings-table th { padding: 0.85rem 1rem; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
  .standings-table td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 0.9rem; }
  
  .gold-row td { background: rgba(245, 158, 11, 0.05); }
  .silver-row td { background: rgba(148, 163, 184, 0.03); }
  .bronze-row td { background: rgba(217, 119, 6, 0.03); }

  .rank-icon { font-weight: 800; font-size: 0.95rem; }
  .rank-icon.gold { color: #fde047; }
  .rank-icon.silver { color: #e2e8f0; }
  .rank-icon.bronze { color: #fdba74; }
  .rank-num { color: var(--text-dim); font-weight: 600; }

  .player-cell { display: flex; align-items: center; gap: 0.5rem; }
  .p-name { font-weight: 600; color: var(--text-main); }
  .title-tag { font-size: 0.7rem; font-weight: 700; background: rgba(245, 158, 11, 0.2); color: var(--gold); padding: 0.1rem 0.4rem; border-radius: 4px; }
  .elo-cell { color: var(--gold); font-weight: 600; }
  .win-count { color: #6ee7b7; font-weight: 700; }
  .loss-count { color: #fca5a5; }
  .points-cell { font-family: var(--font-heading); font-weight: 800; color: var(--text-main); font-size: 1rem; }

  .winrate-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }
  .wr-text { font-size: 0.8rem; min-width: 32px; }
  .wr-bar { height: 4px; background: var(--primary); border-radius: 2px; display: inline-block; }

  .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

  @media (max-width: 768px) {
    .header-section {
      flex-direction: column;
      align-items: stretch;
    }
    .tourney-select {
      width: 100%;
    }
    .podium-section {
      grid-template-columns: 1fr;
    }
    .gold-card {
      order: -1;
      transform: none;
    }
    .table-container {
      overflow-x: auto;
    }
  }
</style>
