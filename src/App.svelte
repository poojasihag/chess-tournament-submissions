<script>
  import PlayerManager from './lib/PlayerManager.svelte';
  import TournamentManager from './lib/TournamentManager.svelte';
  import MatchSystem from './lib/MatchSystem.svelte';
  import RankingLeaderboard from './lib/RankingLeaderboard.svelte';
  import { playersStore, tournamentsStore, matchesStore } from './lib/store.js';

  let activeTab = 'players'; // 'players' | 'tournaments' | 'matches' | 'rankings'
</script>

<main class="app-container">
  <!-- Navigation Header -->
  <header class="navbar glass-card">
    <div class="brand">
      <div class="logo-icon">♟️</div>
      <div>
        <h1 class="brand-title">ChessArena</h1>
        <span class="brand-subtitle">Tournament Management System</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button 
        class="nav-btn {activeTab === 'players' ? 'active' : ''}" 
        on:click={() => activeTab = 'players'}
      >
        <span class="tab-icon">♟️</span> Players
        <span class="badge-count">{$playersStore.length}</span>
      </button>

      <button 
        class="nav-btn {activeTab === 'tournaments' ? 'active' : ''}" 
        on:click={() => activeTab = 'tournaments'}
      >
        <span class="tab-icon">🏆</span> Tournaments
        <span class="badge-count">{$tournamentsStore.length}</span>
      </button>

      <button 
        class="nav-btn {activeTab === 'matches' ? 'active' : ''}" 
        on:click={() => activeTab = 'matches'}
      >
        <span class="tab-icon">🎲</span> Matches
        <span class="badge-count">{$matchesStore.length}</span>
      </button>

      <button 
        class="nav-btn {activeTab === 'rankings' ? 'active' : ''}" 
        on:click={() => activeTab = 'rankings'}
      >
        <span class="tab-icon">🥇</span> Leaderboard
      </button>
    </nav>
  </header>

  <!-- Main View Area -->
  <section class="main-content">
    {#if activeTab === 'players'}
      <PlayerManager />
    {:else if activeTab === 'tournaments'}
      <TournamentManager />
    {:else if activeTab === 'matches'}
      <MatchSystem />
    {:else if activeTab === 'rankings'}
      <RankingLeaderboard />
    {/if}
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>ChessArena • Chess Tournament Management System</p>
    <p class="sub-footer">Built with Svelte & JavaScript for Bytelogik Technical Evaluation</p>
  </footer>
</main>

<style>
  .app-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.5rem 1rem 3rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-height: 100vh;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }
  .logo-icon {
    font-size: 2rem;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--gold) 0%, #d97706 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px var(--gold-glow);
  }
  .brand-title {
    font-size: 1.5rem;
    color: var(--text-main);
    line-height: 1.1;
  }
  .brand-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .nav-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    font-family: var(--font-heading);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-main);
  }
  .nav-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 4px 14px var(--primary-glow);
  }
  .badge-count {
    background: rgba(255, 255, 255, 0.15);
    padding: 0.1rem 0.45rem;
    border-radius: 10px;
    font-size: 0.75rem;
  }

  @media (max-width: 768px) {
    .app-container {
      padding: 1rem 0.5rem 2rem 0.5rem;
      gap: 1.25rem;
    }
    .navbar {
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
      gap: 0.85rem;
    }
    .brand {
      justify-content: center;
      text-align: center;
    }
    .nav-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      width: 100%;
    }
    .nav-btn {
      width: 100%;
      justify-content: center;
      padding: 0.55rem 0.5rem;
      font-size: 0.85rem;
    }
  }

  .main-content {
    flex: 1;
  }

  .footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
    color: var(--text-dim);
    font-size: 0.8rem;
  }
  .sub-footer {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
  }
</style>
