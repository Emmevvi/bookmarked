# Istruzioni per Link Saver PWA

Questo file contiene tutte le istruzioni per configurare e pubblicare la tua applicazione.

## 1. Funzionalità "Condividi da altra app"

Questa funzione è legata a una caratteristica delle PWA chiamata **Web Share Target**.

Quando installi la PWA sul tuo dispositivo (telefono o computer), puoi condividere un link da qualsiasi altra app (es. Chrome, YouTube, ecc.) e scegliere "Link Saver" come destinazione.

L'app si aprirà automaticamente con l'URL già compilato, pronto per essere salvato.

## 2. Configurazione di Firebase

Per far funzionare il salvataggio online, devi creare un progetto su Firebase e configurare l'autenticazione.

**Passaggi:**

1.  **Vai alla [Firebase Console](https://console.firebase.google.com/)** e accedi con il tuo account Google.
2.  **Crea un nuovo progetto:** Clicca su "**+ Aggiungi progetto**", inserisci un nome e segui i passaggi.
3.  **Aggiungi un'app Web:**
    *   Nella dashboard del progetto, clicca sull'icona Web (`</>`).
    *   Dai un nome alla tua app e clicca su **Registra app**.
4.  **Copia la configurazione:** Firebase ti mostrerà un oggetto `firebaseConfig`. **Copialo** e incollalo in cima al file `app.js`, sostituendo quello esistente.
5.  **Abilita l'Autenticazione con Google:**
    *   Nel menu a sinistra, vai su **Build > Authentication**.
    *   Clicca su **Inizia** e vai sulla scheda **Sign-in method** (o Metodi di accesso).
    *   Seleziona **Google** dalla lista dei provider, **abilitalo** e fornisci un'email di supporto per il progetto. Salva.
    *   Assicurati che il provider **Anonimo** sia disabilitato.

## 3. Limitare l'Accesso (Lista Utenti Autorizzati)

Per limitare l'accesso solo a specifici account Google, devi modificare una lista all'interno del codice.

1.  **Apri il file `app.js`**.
2.  In cima al file, troverai un array chiamato `allowedEmails`.
3.  **Modifica questo array** per aggiungere o rimuovere gli indirizzi email (in minuscolo) che vuoi autorizzare.

```javascript
// Esempio
const allowedEmails = [
  'utente1@gmail.com',
  'utente2@example.com'
];
```

## 4. Pubblicazione su GitHub Pages

Per rendere la tua PWA accessibile a tutti, puoi pubblicarla gratuitamente su GitHub Pages.

**Passaggi Iniziali:**

*   Avere [Git](https://git-scm.com/downloads) installato.
*   Avere un account su [GitHub](https://github.com/).

**Procedura:**

1.  **Crea un nuovo repository su GitHub:**
    *   Vai su GitHub e crea un **nuovo repository pubblico**.
2.  **Inizializza Git e carica i file:**
    *   Apri un terminale nella cartella del tuo progetto.
    *   Esegui questi comandi per collegare il progetto a GitHub e caricare i file (sostituisci l'URL con quello del tuo repository):
    ```bash
    git init
    git add .
    git commit -m "Prima versione"
    git remote add origin https://github.com/TUO_NOME_UTENTE/NOME_REPO.git
    git branch -M main
    git push -u origin main
    ```
3.  **Abilita GitHub Pages:**
    *   Nel tuo repository su GitHub, vai su **Settings > Pages**.
    *   Nella sezione "Branch", seleziona `main` e clicca su **Save**.
4.  **Autorizza il dominio su Firebase:**
    *   Dopo aver pubblicato il sito, GitHub ti darà un URL tipo `https://TUO_NOME_UTENTE.github.io/NOME_REPO/`.
    *   **Copia il dominio base**, che è `TUO_NOME_UTENTE.github.io`.
    *   Torna sulla **Console di Firebase > Authentication > Settings > Domains**.
    *   Clicca su **Add domain** e incolla il dominio che hai copiato (es: `tuo-nome-utente.github.io`).

Dopo qualche minuto, il tuo sito sarà online e funzionante all'indirizzo fornito da GitHub.