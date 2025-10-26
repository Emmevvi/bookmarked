# Link Saver PWA - README

Una semplice ma potente Progressive Web App (PWA) per salvare, etichettare e ritrovare i tuoi link importanti. Sincronizzata in tempo reale con Firebase e accessibile ovunque.

![Screenshot dell'app](https://i.imgur.com/esempio.png) <!-- Sostituisci con un vero screenshot -->

## ✨ Caratteristiche Principali

- **Salvataggio Intelligente**: Salva link con URL, data e tag multipli (separati da virgola).
- **Sincronizzazione Cloud**: I tuoi link sono salvati su Firebase Firestore e sincronizzati in tempo reale su tutti i tuoi dispositivi.
- **Installabile (PWA)**: Installa l'app su desktop o mobile per un'esperienza nativa e accesso offline.
- **Accesso Offline**: Grazie al Service Worker, puoi visualizzare i link che hai già caricato anche senza connessione a internet.
- **Autenticazione Sicura**: Accesso protetto tramite account Google.
- **Accesso Limitato**: L'uso dell'applicazione è ristretto a una lista pre-approvata di utenti, garantendo privacy e controllo.
- **Gestione Dati**: Esporta tutti i tuoi dati in formato JSON o importa un backup precedente.
- **Web Share Target**: Salva link direttamente da altre app sul tuo dispositivo (es. browser, YouTube) tramite il menu di condivisione nativo.

## 🛠️ Stack Tecnologico

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend & Database**: Firebase (Firestore, Authentication)
- **Architettura**: Progressive Web App (PWA)

## 🚀 Setup e Deploy

Per le istruzioni complete su come configurare il progetto Firebase e come effettuare il deploy su GitHub Pages, consulta il file `ISTRUZIONI.md`.

## 🔐 Gestione delle Regole di Sicurezza

Le regole di sicurezza di Firestore sono fondamentali per proteggere i dati dell'applicazione. La lista di utenti autorizzati è gestita direttamente in queste regole per impedire accessi non autorizzati.

**Importante:** Qualsiasi modifica alla lista di email autorizzate deve essere fatta nel file `firestore.rules` e poi distribuita su Firebase.

### Come aggiornare le regole

1.  **Modifica `firestore.rules`**: Apri il file `firestore.rules` nella radice del progetto.
2.  **Aggiorna le email**: Aggiungi o rimuovi indirizzi email dall'array `allowedEmails` all'interno della funzione `isAllowedUser()`.

    ```javascript
    // Esempio
    function isAllowedUser() {
      let allowedEmails = [
        'email1@example.com',
        'email2@example.com'
      ];
      // ...
    }
    ```

3.  **Distribuisci le modifiche**: Puoi distribuire le nuove regole in due modi:

    **A) Tramite la Console Firebase (Metodo Semplice)**
    *   Vai alla [console di Firebase](https://console.firebase.google.com/) e seleziona il tuo progetto.
    *   Vai su **Build > Firestore Database > Scheda Regole**.
    *   Copia l'intero contenuto di `firestore.rules` e incollalo nell'editor della console.
    *   Clicca su **Pubblica**.

    **B) Tramite la Firebase CLI (Metodo Consigliato)**
    *   Assicurati di avere la [Firebase CLI](https://firebase.google.com/docs/cli) installata e di aver effettuato l'accesso (`firebase login`).
    *   Esegui questo comando dalla radice del progetto:
        ```bash
        firebase deploy --only firestore:rules
        ```
