// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCuUULC_3uVGFq2ZYW0VZeEZY3yClxKk0Y",
  authDomain: "linksaver-5dd3c.firebaseapp.com",
  projectId: "linksaver-5dd3c",
  storageBucket: "linksaver-5dd3c.firebasestorage.app",
  messagingSenderId: "953086575969",
  appId: "1:953086575969:web:96c7dfca7548b2e3733120"
};

// Lista di email autorizzate (in minuscolo)
const allowedEmails = [
  's.mastellone@gmail.com',
  'eccolamiamail@gmail.com'
];

// Inizializza Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let unsubscribe = null;

// Elementi UI
const loginView = document.getElementById('login-view');
const mainApp = document.getElementById('main-app');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userEmail = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');
const loginMessage = document.getElementById('login-message');

// Gestione stato autenticazione
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Utente loggato, controlla se è autorizzato
    if (allowedEmails.includes(user.email.toLowerCase())) {
      currentUser = user;
      uiForLoggedIn();
      startRealtimeListener();
    } else {
      // Utente non autorizzato
      showMessage('login-message', 'Accesso non autorizzato per questa email.', 'error');
      signOut(auth); // Disconnetti immediatamente
    }
  } else {
    // Utente non loggato
    currentUser = null;
    uiForLoggedOut();
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }
});

// UI per utente loggato
function uiForLoggedIn() {
  loginView.classList.add('hidden');
  mainApp.classList.remove('hidden');
  userProfile.classList.remove('hidden');
  hideMessage('login-message');
  
  userEmail.textContent = currentUser.email;
  userAvatar.src = currentUser.photoURL;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

// UI per utente sloggato
function uiForLoggedOut() {
  mainApp.classList.add('hidden');
  loginView.classList.remove('hidden');
  userProfile.classList.add('hidden');
}

// Event Listener per Login e Logout
loginBtn.addEventListener('click', () => {
  hideMessage('login-message');
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .catch((error) => {
      console.error('Errore login:', error);
      showMessage('login-message', `Login fallito: ${error.message}`, 'error');
    });
});

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  signOut(auth);
});


// Registrazione Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrato'))
      .catch(err => console.error('Errore Service Worker:', err));
  });
}

// Gestione installazione PWA
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installPrompt.classList.add('show');
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Installazione: ${outcome}`);
    deferredPrompt = null;
    installPrompt.classList.remove('hidden');
  }
});

// Gestione Web Share API
if (navigator.share) {
  document.getElementById('shareContainer').style.display = 'block';
  document.getElementById('shareBtn').addEventListener('click', handleShare);
}

async function handleShare() {
  try {
    if (navigator.canShare && navigator.canShare({ url: 'https://example.com' })) {
      showMessage('save-message', 'Usa il pulsante "Condividi" del browser per inviare link a questa app', 'success');
    } else {
      showMessage('save-message', 'La condivisione non è supportata su questo dispositivo', 'error');
    }
  } catch (error) {
    console.error('Errore condivisione:', error);
  }
}

// Gestione Share Target
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const sharedUrl = params.get('url') || params.get('text');
  if (sharedUrl) {
    document.getElementById('url').value = sharedUrl;
    switchTab('save');
  }
});

// Listener in tempo reale per sincronizzazione automatica
function startRealtimeListener() {
  if (!currentUser || unsubscribe) return;
  
  const linksRef = collection(db, `users/${currentUser.uid}/links`);
  const q = query(linksRef, orderBy('createdAt', 'desc'));
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('Dati sincronizzati:', snapshot.size, 'link');
    loadLinks();
    updateStats();
  }, (error) => {
    console.error('Errore listener:', error);
  });
}

// Gestione tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.getAttribute('data-tab');
    switchTab(targetTab);
  });
});

function switchTab(targetTab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
  document.getElementById(`${targetTab}-tab`).classList.add('active');
  
  if (targetTab === 'view') {
    loadLinks();
  } else if (targetTab === 'manage') {
    updateStats();
  }
}

// Form di salvataggio con Firebase
document.getElementById('save-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!currentUser) {
    showMessage('save-message', '❌ Non sei connesso', 'error');
    return;
  }
  
  const url = document.getElementById('url').value.trim();
  const date = document.getElementById('date').value;
  const tagsInput = document.getElementById('tags').value.trim();
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
  
  const saveBtn = document.querySelector('#save-form button[type="submit"]');
  saveBtn.disabled = true;
  saveBtn.textContent = '💾 Salvataggio...';
  
  try {
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    await addDoc(linksRef, {
      url,
      date,
      tags,
      createdAt: serverTimestamp()
    });
    
    showMessage('save-message', '✅ Link salvato e sincronizzato!', 'success');
    
    document.getElementById('url').value = '';
    document.getElementById('tags').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    setTimeout(() => {
      hideMessage('save-message');
    }, 2000);
  } catch (error) {
    console.error('Errore salvataggio:', error);
    showMessage('save-message', '❌ Errore nel salvataggio: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Salva Link';
  }
});

// Carica e visualizza i link da Firebase
async function loadLinks(searchQuery = '') {
  if (!currentUser) {
    document.getElementById('links-container').innerHTML = `
      <div class="empty-state">
        <p>❌ Utente non connesso</p>
      </div>
    `;
    return;
  }
  
  try {
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    const q = query(linksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    let links = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      links.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      links = links.filter(link => 
        link.url.toLowerCase().includes(query) ||
        link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    const container = document.getElementById('links-container');
    document.getElementById('link-count').textContent = links.length;
    
    if (links.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>${searchQuery ? 'Nessun link trovato' : 'Nessun link salvato'}</p>
        </div>
      `;
      return;
    }
    
    const grouped = groupLinksByPeriod(links);
    let html = '';
    
    if (grouped.today.length > 0) {
      html += `<div class="group-header">📅 Oggi</div>`;
      html += grouped.today.map(link => renderLinkItem(link)).join('');
    }
    if (grouped.lastWeek.length > 0) {
      html += `<div class="group-header">📆 Ultima settimana</div>`;
      html += grouped.lastWeek.map(link => renderLinkItem(link)).join('');
    }
    if (grouped.lastMonth.length > 0) {
      html += `<div class="group-header">🗓️ Ultimo mese</div>`;
      html += grouped.lastMonth.map(link => renderLinkItem(link)).join('');
    }
    if (grouped.older.length > 0) {
      html += `<div class="group-header">📦 Vecchi</div>`;
      html += grouped.older.map(link => renderLinkItem(link)).join('');
    }
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Errore caricamento:', error);
    showMessage('save-message', '❌ Errore nel caricamento', 'error');
  }
}

// Raggruppa link per periodo
function groupLinksByPeriod(links) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const grouped = { today: [], lastWeek: [], lastMonth: [], older: [] };
  
  links.forEach(link => {
    const linkDate = new Date(link.createdAt);
    if (linkDate >= today) grouped.today.push(link);
    else if (linkDate >= weekAgo) grouped.lastWeek.push(link);
    else if (linkDate >= monthAgo) grouped.lastMonth.push(link);
    else grouped.older.push(link);
  });
  
  return grouped;
}

// Render singolo link
function renderLinkItem(link) {
  return `
    <div class="link-item" data-id="${link.id}">
      <a href="${link.url}" class="link-url" target="_blank" rel="noopener">${link.url}</a>
      <div class="link-date">📅 ${formatDate(link.date)}</div>
      ${link.tags.length > 0 ? `
        <div class="link-tags">
          ${link.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      <div class="link-actions">
        <button class="btn-small btn-delete" onclick="deleteLink('${link.id}')">🗑️ Elimina</button>
      </div>
    </div>
  `;
}

// Ricerca
document.getElementById('search').addEventListener('input', (e) => {
  loadLinks(e.target.value);
});

// Elimina un link da Firebase
window.deleteLink = async (id) => {
  if (!confirm('Sei sicuro di voler eliminare questo link?')) return;
  if (!currentUser) return alert('Non sei connesso');
  
  try {
    await deleteDoc(doc(db, `users/${currentUser.uid}/links`, id));
  } catch (error) {
    console.error('Errore eliminazione:', error);
    alert("Errore nell'eliminazione: " + error.message);
  }
};

// Export dati da Firebase
document.getElementById('export-btn').addEventListener('click', async () => {
  if (!currentUser) return showMessage('manage-message', '❌ Non sei connesso', 'error');
  
  try {
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    const q = query(linksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const links = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      links.push({
        url: data.url,
        date: data.date,
        tags: data.tags,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    const dataStr = JSON.stringify(links, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-saver-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage('manage-message', '✅ Dati esportati con successo!', 'success');
    setTimeout(() => hideMessage('manage-message'), 2000);
  } catch (error) {
    console.error('Errore export:', error);
    showMessage('manage-message', "❌ Errore nell'export: " + error.message, 'error');
  }
});

// Import dati in Firebase
document.getElementById('import-btn').addEventListener('click', async () => {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];
  
  if (!file) return showMessage('manage-message', '❌ Seleziona un file da importare', 'error');
  if (!currentUser) return showMessage('manage-message', '❌ Non sei connesso', 'error');
  
  try {
    const text = await file.text();
    const importedLinks = JSON.parse(text);
    
    if (!Array.isArray(importedLinks)) throw new Error('Il file non contiene un array valido');
    
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    const querySnapshot = await getDocs(linksRef);
    const existingUrls = new Set(querySnapshot.docs.map(doc => doc.data().url));
    
    let importCount = 0;
    for (const link of importedLinks) {
      if (link.url && !existingUrls.has(link.url)) {
        await addDoc(linksRef, {
          url: link.url,
          date: link.date || new Date().toISOString().split('T')[0],
          tags: link.tags || [],
          createdAt: serverTimestamp()
        });
        importCount++;
      }
    }
    
    showMessage('manage-message', `✅ Importati ${importCount} nuovi link!`, 'success');
    fileInput.value = '';
    setTimeout(() => hideMessage('manage-message'), 3000);
  } catch (error) {
    console.error('Errore import:', error);
    showMessage('manage-message', "❌ Errore nell'importazione: " + error.message, 'error');
  }
});

// Cancella tutti i dati da Firebase
document.getElementById('clear-btn').addEventListener('click', async () => {
  if (!confirm('Sei sicuro di voler cancellare TUTTI i link? Questa azione è irreversibile!')) return;
  if (!currentUser) return showMessage('manage-message', '❌ Non sei connesso', 'error');
  
  try {
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    const querySnapshot = await getDocs(linksRef);
    
    const deletePromises = querySnapshot.docs.map(document => deleteDoc(document.ref));
    await Promise.all(deletePromises);
    
    showMessage('manage-message', '✅ Tutti i dati sono stati cancellati', 'success');
    setTimeout(() => hideMessage('manage-message'), 2000);
  } catch (error) {
    console.error('Errore cancellazione:', error);
    showMessage('manage-message', '❌ Errore nella cancellazione: ' + error.message, 'error');
  }
});

// Aggiorna statistiche
async function updateStats() {
  if (!currentUser) return document.getElementById('total-count').textContent = '0';
  
  try {
    const linksRef = collection(db, `users/${currentUser.uid}/links`);
    const querySnapshot = await getDocs(linksRef);
    document.getElementById('total-count').textContent = querySnapshot.size;
  } catch (error) {
    console.error('Errore stats:', error);
  }
}

// Utility per formattare la data
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Mostra messaggio
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = `message ${type}`;
  el.classList.remove('hidden');
}

// Nascondi messaggio
function hideMessage(elementId) {
  document.getElementById(elementId).classList.add('hidden');
}

// Cleanup al termine
window.addEventListener('beforeunload', () => {
  if (unsubscribe) {
    unsubscribe();
  }
});