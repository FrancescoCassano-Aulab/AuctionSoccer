# 📘 Guida all'Applicazione FantaCassi - Gestionale Asta Fantacalcio

## 🎯 Panoramica

**FantaCassi** è un'applicazione web completa per la gestione di aste fantacalcio della Serie A. L'app permette di organizzare e condurre aste in tempo reale con più partecipanti, gestire budget, monitorare i limiti di ruoli e visualizzare statistiche dettagliate.

## 🏗️ Architettura dell'Applicazione

L'applicazione è costruita con:
- **Frontend**: HTML5, CSS3, JavaScript (ES6+) vanilla
- **Backend**: Laravel 11 (principalmente per servire file statici)
- **Database**: File JSON statico per i dati dei giocatori
- **Storage**: LocalStorage del browser per il salvataggio dello stato

### 📁 Struttura dei File Principali

```
├── public/
│   ├── fantacalcio-auction.html  # Interfaccia principale
│   ├── app.js                    # Logica dell'applicazione
│   ├── styles.css                # Stili CSS
│   └── players-data.json         # Database giocatori
├── resources/                    # File Laravel (non utilizzati attivamente)
└── composer.json                 # Dipendenze PHP/Laravel
```

## ⚽ Funzionalità Principali

### 1. **Gestione Database Giocatori**
- **Database**: 600+ giocatori della Serie A 2025/26
- **Dati per giocatore**:
  - Nome, ruolo (P, D, C, A), squadra di appartenenza
  - Tier fantasy (A-E), percentuale di titolarità
  - Valore di mercato stimato, flag rigorista
  - Note e informazioni aggiuntive

### 2. **Sistema di Asta**

#### Creazione Squadre Partecipanti
- **Aggiunta squadre**: Nome personalizzato + budget iniziale (default 500€)
- **Gestione budget**: Controllo automatico disponibilità fondi
- **Limits ruoli**: Controllo automatico limiti per ruolo (3P, 8D, 8C, 6A)

#### Processo di Asta
1. **Selezione giocatore**: Click su giocatore dalla tabella
2. **Inserimento prezzo**: Campo numerico per l'offerta
3. **Selezione squadra**: Dropdown delle squadre partecipanti
4. **Assegnazione**: Controllo automatico budget e limiti ruoli
5. **Conferma**: Aggiornamento automatico di tutti i dati

### 3. **Interfaccia Utente Avanzata**

#### Vista Principale
- **Pannelli fissi superiori**:
  - Filtri di ricerca e ordinamento
  - Sezione asta con giocatore selezionato e controlli rapidi
- **Tabella giocatori**:
  - Visualizzazione completa di tutti i dati
  - Paginazione (25 giocatori per pagina)
  - Sistema preferiti (♥)
  - Indicatori visuali per status (venduto/disponibile)

#### Vista Squadre Compatta
- **Scroll orizzontale**: Visualizzazione di tutte le squadre in una riga
- **Cards animate**: Hover effects e selezione visiva
- **Informazioni rapide**: Budget, giocatori per ruolo, statistiche
- **Azioni rapide**: Visualizza dettagli, elimina squadra

#### Vista Squadre Completa
- **Layout Excel-like**: Colonne fisse con scroll orizzontale
- **Headers sticky**: Le intestazioni rimangono visibili durante lo scroll
- **Dettagli completi**: Tutti i giocatori organizzati per ruolo
- **Slot visuali**: Mostra chiaramente i posti liberi per ogni ruolo

### 4. **Sistema di Filtri e Ricerca**

#### Filtri Disponibili
- **Ricerca testuale**: Nome giocatore o squadra di appartenenza
- **Filtro ruolo**: P, D, C, A o tutti
- **Filtro squadra**: Tutte le 20 squadre di Serie A
- **Filtro status**: Disponibili, venduti, preferiti, titolari, rigoristi
- **Ordinamento**: Per valore (crescente/decrescente), nome A-Z, titolarità

### 5. **Gestione Stato e Persistenza**

#### Salvataggio Automatico
- **LocalStorage**: Stato completo salvato automaticamente
- **Dati persistenti**:
  - Squadre partecipanti e loro rose
  - Cronologia aste completate
  - Giocatori preferiti
  - Squadra attiva selezionata

#### Funzionalità di Undo
- **Annulla ultima azione**: Pulsante globale di undo
- **Annulla vendita specifica**: Pulsante per ogni giocatore venduto
- **Ripristino completo**: Budget e disponibilità giocatori

### 6. **Esportazione Dati**
- **Formato CSV**: Export completo di tutte le rose
- **Dati inclusi**: Squadra, giocatore, ruolo, prezzo, valore, rapporto qualità/prezzo
- **Nome file**: Data automatica nel nome file

### 7. **Temi e Accessibilità**
- **Tema chiaro/scuro**: Switch automatico con preferenze salvate
- **Design responsivo**: Ottimizzato per desktop, tablet e mobile
- **Shortcuts keyboard**: ESC per chiudere modal e deselezionare

## 🎮 Come Utilizzare l'Applicazione

### Fase 1: Preparazione
1. **Aprire** `fantacalcio-auction.html` nel browser
2. **Aggiungere partecipanti**: Inserire nome squadra e budget (default 500€)
3. **Ripetere** per tutte le squadre partecipanti all'asta

### Fase 2: Ricerca e Selezione Giocatori
1. **Utilizzare filtri** per trovare giocatori specifici
2. **Consultare statistiche**: Valore, titolarità, tier fantasy
3. **Marcare preferiti** (♥) per giocatori interessanti
4. **Ordinare** per valore o altri criteri

### Fase 3: Conduzione Asta
1. **Cliccare su giocatore** per iniziare asta
2. **Inserire prezzo** nel campo dedicato
3. **Selezionare squadra** vincitrice dal dropdown
4. **Cliccare "Assegna"** per completare l'acquisto
5. **Verificare** aggiornamento automatico budget e rose

### Fase 4: Monitoraggio
1. **Vista squadre**: Scorrere per vedere tutte le rose
2. **Controlli limiti**: Verificare giocatori per ruolo
3. **Statistiche**: Budget rimanente, spesa media, totale giocatori

### Fase 5: Gestione e Correzioni
1. **Undo globale**: Annullare ultima azione
2. **Undo specifico**: Annullare vendite singole
3. **Eliminazione squadre**: Rimuovere partecipanti se necessario

## 📊 Logica di Business

### Controllo Budget
- **Verifica fondi**: Impossibile spendere oltre il budget disponibile
- **Aggiornamento real-time**: Budget aggiornato immediatamente dopo acquisti
- **Alert visivi**: Indicatori colorati per livelli budget

### Limiti Ruoli (Regolamento Classico)
- **Portieri (P)**: Massimo 3
- **Difensori (D)**: Massimo 8
- **Centrocampisti (C)**: Massimo 8
- **Attaccanti (A)**: Massimo 6
- **Totale squadra**: 25 giocatori massimo

### Sistema di Valutazione
- **Valore base**: Prezzo stimato di mercato
- **Tier fantasy**: Classificazione A (migliore) - E (peggiore)
- **Titolarità**: Percentuale di partite da titolare
- **Bonus rigorista**: Indicatore per tiratori di rigori

## 🎨 Caratteristiche Interfaccia

### Design System
- **Colori ruoli**:
  - Portieri (P): Blu (#3498db)
  - Difensori (D): Verde (#2ecc71)
  - Centrocampisti (C): Arancione (#f39c12)
  - Attaccanti (A): Rosso (#e74c3c)

### Elementi Visuali
- **Gradienti**: Moderne transizioni di colore
- **Ombre**: Effetti depth per card e elementi
- **Animazioni**: Hover effects e transizioni fluide
- **Badges**: Indicatori colorati per status e ruoli

### Responsive Design
- **Desktop**: Vista completa con tutte le funzionalità
- **Tablet**: Layout ottimizzato con scroll orizzontale
- **Mobile**: Interface compatta con priorità alle funzioni essenziali

## 🔧 Configurazione e Personalizzazione

### Modifica Budget Default
Nel file `app.js`, linea 98:
```javascript
const budget = parseInt(budgetInput.value) || 500; // Cambia 500 con valore desiderato
```

### Modifica Limiti Ruoli
Nel file `app.js`, linea 677:
```javascript
const roleLimits = { P: 3, D: 8, C: 8, A: 6 }; // Modifica limiti
```

### Personalizzazione Colori
Nel file `styles.css`, sezione `:root`:
```css
--role-p-color: #3498db; /* Colore portieri */
--role-d-color: #2ecc71; /* Colore difensori */
/* ... altri colori ... */
```

## 🚀 Deployment e Hosting

### Requisiti Minimi
- **Web server**: Apache, Nginx, o server statico
- **PHP**: 8.1+ (per Laravel, opzionale per uso statico)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Installazione
1. **Caricare file** su web server
2. **Aprire** `fantacalcio-auction.html` nel browser
3. **Pronto all'uso**: Nessuna configurazione aggiuntiva richiesta

### Uso Offline
L'applicazione funziona completamente offline dopo il primo caricamento, grazie a:
- File JavaScript e CSS inclusi
- Database JSON locale
- Storage browser per persistenza

## ⚡ Performance e Ottimizzazioni

### Gestione Memoria
- **Paginazione giocatori**: Solo 25 giocatori visualizzati per volta
- **Lazy rendering**: Squadre caricate on-demand
- **Storage ottimizzato**: Solo dati essenziali in localStorage

### Rendering Ottimizzato
- **Virtual scrolling**: Per liste lunghe di giocatori
- **Debounced search**: Ricerca ottimizzata con ritardo
- **Cached DOM queries**: Elementi DOM memorizzati per performance

## 🛠️ Troubleshooting

### Problemi Comuni

**1. Dati non salvati**
- **Causa**: LocalStorage disabilitato
- **Soluzione**: Abilitare storage browser o utilizzare modalità incognito

**2. Giocatori non visibili**
- **Causa**: Filtri troppo restrittivi
- **Soluzione**: Reset filtri o controllo termini ricerca

**3. Budget non aggiornato**
- **Causa**: Errore JavaScript
- **Soluzione**: Refresh pagina e ripetere operazione

**4. Layout rotto su mobile**
- **Causa**: Viewport non corretto
- **Soluzione**: Rotare dispositivo o utilizzare browser aggiornato

### Reset Completo
Per resettare completamente l'applicazione:
1. Aprire Console browser (F12)
2. Eseguire: `localStorage.removeItem('fantacalcio-auction-state')`
3. Refresh della pagina

## 📈 Statistiche e Analytics

### Metriche Disponibili
- **Budget utilizzato**: Per squadra e totale
- **Spesa media**: Per giocatore e per squadra
- **Distribuzione ruoli**: Giocatori per posizione
- **Rapporto qualità/prezzo**: Valore vs prezzo pagato

### Report Esportabili
- **CSV completo**: Tutte le rose con statistiche
- **Cronologia aste**: Log completo delle transazioni
- **Analisi spesa**: Breakdown per squadra e ruolo

---

*Questa guida copre tutte le funzionalità principali di FantaCassi. Per domande specifiche o personalizzazioni avanzate, consultare il codice sorgente in `app.js` e `styles.css`.*