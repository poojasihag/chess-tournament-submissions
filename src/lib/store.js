import { writable } from 'svelte/store';

// Helper for local storage persistence
function createPersistentStore(key, initialValue) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const data = saved ? JSON.parse(saved) : initialValue;
  const store = writable(data);

  store.subscribe(value => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  return store;
}

// Initial Sample Data if empty
const initialPlayers = [
  { id: 'p1', name: 'Magnus Carlsen', rating: 2832, email: 'magnus@chess.com', title: 'GM', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Hikaru Nakamura', rating: 2802, email: 'hikaru@chess.com', title: 'GM', createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Fabiano Caruana', rating: 2795, email: 'fabiano@chess.com', title: 'GM', createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Gukesh D', rating: 2794, email: 'gukesh@chess.com', title: 'GM', createdAt: new Date().toISOString() },
  { id: 'p5', name: 'Arjun Erigaisi', rating: 2778, email: 'arjun@chess.com', title: 'GM', createdAt: new Date().toISOString() },
  { id: 'p6', name: 'Praggnanandhaa R', rating: 2757, email: 'pragg@chess.com', title: 'GM', createdAt: new Date().toISOString() }
];

const initialTournaments = [
  {
    id: 't1',
    name: 'Masters Candidates 2026',
    description: 'Grandmaster level championship tournament',
    startDate: '2026-08-01',
    status: 'Active',
    playerIds: ['p1', 'p2', 'p3', 'p4'],
    createdAt: new Date().toISOString()
  }
];

const initialMatches = [
  {
    id: 'm1',
    tournamentId: 't1',
    player1Id: 'p1',
    player2Id: 'p2',
    winnerId: 'p1',
    status: 'Completed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    tournamentId: 't1',
    player1Id: 'p3',
    player2Id: 'p4',
    winnerId: 'p4',
    status: 'Completed',
    createdAt: new Date().toISOString()
  }
];

export const playersStore = createPersistentStore('chess_arena_players', initialPlayers);
export const tournamentsStore = createPersistentStore('chess_arena_tournaments', initialTournaments);
export const matchesStore = createPersistentStore('chess_arena_matches', initialMatches);

// Player Helper Actions
export function addPlayer(playerData) {
  const newPlayer = {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    ...playerData
  };
  playersStore.update(list => [newPlayer, ...list]);
  return newPlayer;
}

export function updatePlayer(id, updatedFields) {
  playersStore.update(list =>
    list.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
  );
}

export function deletePlayer(id) {
  playersStore.update(list => list.filter(p => p.id !== id));
}

// Tournament Helper Actions
export function addTournament(tournamentData) {
  const newTournament = {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    status: 'Draft',
    playerIds: [],
    createdAt: new Date().toISOString(),
    ...tournamentData
  };
  tournamentsStore.update(list => [newTournament, ...list]);
  return newTournament;
}

export function updateTournament(id, updatedFields) {
  tournamentsStore.update(list =>
    list.map(t => (t.id === id ? { ...t, ...updatedFields } : t))
  );
}

export function deleteTournament(id) {
  tournamentsStore.update(list => list.filter(t => t.id !== id));
  // Remove associated matches
  matchesStore.update(list => list.filter(m => m.tournamentId !== id));
}

export function addPlayerToTournament(tournamentId, playerId) {
  tournamentsStore.update(list =>
    list.map(t => {
      if (t.id === tournamentId) {
        if (!t.playerIds.includes(playerId)) {
          return { ...t, playerIds: [...t.playerIds, playerId] };
        }
      }
      return t;
    })
  );
}

export function removePlayerFromTournament(tournamentId, playerId) {
  tournamentsStore.update(list =>
    list.map(t => {
      if (t.id === tournamentId) {
        return { ...t, playerIds: t.playerIds.filter(id => id !== playerId) };
      }
      return t;
    })
  );
}

// Match Helper Actions
export function addMatches(newMatchesList) {
  matchesStore.update(list => [...newMatchesList, ...list]);
}

export function updateMatchWinner(matchId, winnerId) {
  matchesStore.update(list =>
    list.map(m => (m.id === matchId ? { ...m, winnerId, status: 'Completed' } : m))
  );
}
