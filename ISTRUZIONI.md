# Istruzioni per Link Saver PWA

Questo file contiene tutte le istruzioni per configurare e pubblicare la tua applicazione.

## 1. Funzionalità "Condividi da altra app"

Questa funzione è legata a una caratteristica delle PWA chiamata **Web Share Target**.

Quando installi la PWA sul tuo dispositivo (telefono o computer), puoi condividere un link da qualsiasi altra app (es. Chrome, YouTube, ecc.) e scegliere "Link Saver" come destinazione.

L'app si aprirà automaticamente con l'URL già compilato, pronto per essere salvato.

## 2. Configurazione di Firebase

Per far funzionare il salvataggio online, devi creare un progetto su Firebase e inserire le tue credenziali personali nel file `app.js`.

**Passaggi:**

1.  **Vai alla [Firebase Console](https://console.firebase.google.com/)** e accedi con il tuo account Google.
2.  **Crea un nuovo progetto:** Clicca su "**+ Aggiungi progetto**", inserisci un nome e segui i passaggi. Puoi disabilitare Google Analytics se non ti serve.
3.  **Aggiungi un'app Web:**
    *   Nella dashboard del progetto, clicca sull'icona Web (`</>`).
    *   Dai un nome alla tua app (es. "Link Saver") e clicca su **Registra app**.
4.  **Copia la configurazione:** Firebase ti mostrerà un oggetto `firebaseConfig`. **Copialo**.
5.  **Incolla in `app.js`:** Apri `app.js` e sostituisci l'oggetto `firebaseConfig` segnaposto con quello che hai appena copiato.
6.  **Abilita l'Autenticazione Anonima:**
    *   Nel menu a sinistra, vai su **Build > Authentication**.
    *   Clicca su **Inizia** e vai sulla scheda **Metodi di accesso**.
    *   Seleziona **Anonimo**, abilitalo e salva.
7.  **Abilita il Database Firestore:**
    *   Nel menu a sinistra, vai su **Build > Firestore Database**.
    *   Clicca su **Crea database**.
    *   Scegli **Inizia in modalità di produzione** e clicca **Avanti**.
    *   Scegli una località e clicca **Abilita**.
8.  **Imposta le Regole di Sicurezza:**
    *   Vai nella scheda **Regole** di Firestore.
    *   Sostituisci il contenuto con le seguenti regole e clicca su **Pubblica**:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId}/{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

## 3. Pubblicazione su GitHub Pages

Per rendere la tua PWA accessibile a tutti, puoi pubblicarla gratuitamente su GitHub Pages.

**Prerequisiti:**
*   Avere [Git](https://git-scm.com/downloads) installato.
*   Avere un account su [GitHub](https://github.com/).

**Passaggi:**

1.  **Crea un nuovo repository su GitHub:**
    *   Vai su GitHub e clicca su "New repository".
    *   Dagli un nome (es. `link-saver-pwa`), assicurati che sia **Pubblico** e crea il repository senza aggiungere file (come README o .gitignore).
2.  **Inizializza Git nel tuo progetto locale:**
    *   Apri un terminale nella cartella del tuo progetto (`C:\Users\User\Documents\ProgettiGoogleCLI\link-saver-extension-pwa`).
    *   Esegui questi comandi uno per uno:
    ```bash
    git init
    git add .
    git commit -m "Prima versione"
    ```
3.  **Collega il repository locale a GitHub:**
    *   Esegui il comando che trovi nella pagina del tuo repository GitHub sotto la sezione "...or push an existing repository from the command line". Sarà simile a questo (sostituisci con il tuo URL):
    ```bash
    git remote add origin https://github.com/TUO_NOME_UTENTE/link-saver-pwa.git
    git branch -M main
    git push -u origin main
    ```
4.  **Abilita GitHub Pages:**
    *   Nel tuo repository su GitHub, vai su **Settings > Pages**.
    *   Nella sezione "Branch", seleziona `main` come branch sorgente e lascia la cartella su `/ (root)`.
    *   Clicca su **Save**.
5.  **Attendi la pubblicazione:**
    *   Dopo qualche minuto, il tuo sito sarà online all'indirizzo `https://TUO_NOME_UTENTE.github.io/link-saver-pwa/`.

Ora hai tutte le istruzioni in un unico posto!
