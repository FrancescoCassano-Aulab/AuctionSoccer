# 🏆 FantaCassi - Gestionale Asta Fantacalcio Serie A 2025/26

Un sistema completo per gestire l'asta del fantacalcio con database di 500+ giocatori Serie A e AI assistant integrato.

## 🚀 Come Iniziare

1. **Avvia il server:**
   ```bash
   node server.js
   ```

2. **Apri il browser:**
   ```
   http://localhost:3001
   ```

## ✨ Funzionalità Principali

### 👥 Gestione Partecipanti
- ➕ Aggiungi/rimuovi squadre partecipanti
- 💰 Budget personalizzabile (default 500 crediti)
- 📊 Tracciamento budget in tempo reale
- 🎯 Indicatore visivo partecipante attivo

### 🏷️ Sistema di Offerte
- 🔍 Selezione giocatore dal database completo
- 💸 Rilanci con controllo automatico budget
- 📝 Cronologia offerte per ogni giocatore
- 🏆 Assegnazione automatica al vincitore
- ⚡ Offerte rapide (+10%, +20%, valore base)

### 🗃️ Database Intelligente
- 📋 **Tutti i 500+ giocatori Serie A 2025/26**
- 🔧 **Filtri avanzati:**
  - 👤 Ruolo (P/D/C/A)
  - ⚽ Squadra Serie A
  - ✅ Status (Disponibili/Venduti/Titolari/Rigoristi)
- 🔍 Ricerca testuale nome/squadra
- 📊 Ordinamento per valore, titolarità
- 🏷️ **Indicatori visivi:**
  - 🎯 Rigoristi
  - ⭐ Titolari fissi
  - ⚠️ Infortunati
  - 🏅 Tier Fantasy (A-E)

### 🤖 AI Assistant Avanzato
Per ogni giocatore selezionato:
- ⭐ **Rating 1-5 stelle** basato su titolarità, rigori, tier
- 💡 **Consigli personalizzati** sull'offerta massima
- ⚠️ **Alert automatici** per rischi (infortuni, ballottaggi)
- 📈 **Calcolo rapporto** Valore/Prezzo
- 🎯 **Suggerimenti intelligenti** basati su performance

### 📋 Gestione Rose
- 👀 Visualizzazione rose per squadra
- 🔢 Contatori automatici per ruolo (P/D/C/A)
- 📊 Calcolo budget speso/rimanente
- 📱 Vista responsive per tutti i dispositivi

### 📊 Analytics e Statistiche
- 💰 Spesa totale per squadra
- 📊 Prezzo medio per ruolo
- 🏆 Giocatori più pagati
- 💎 **Migliori affari** (rapporto qualità/prezzo)
- 📈 Trend di mercato in tempo reale

## 🎮 Come Usare

1. **Aggiungi Partecipanti:** Inserisci nome squadra e budget nella sidebar sinistra
2. **Seleziona Partecipante Attivo:** Clicca su una squadra per attivarla
3. **Scegli Giocatore:** Naviga nel database e clicca su un giocatore
4. **Consulta AI:** Leggi consigli e rating nell'AI Assistant
5. **Fai Offerte:** Usa i controlli di rilancio o le offerte rapide
6. **Assegna Giocatore:** Conferma l'assegnazione al vincitore

## 🔧 Controlli Speciali

- 🌙 **Toggle Dark Mode:** Pulsante luna/sole nell'header
- ↶ **Annulla Ultimo Acquisto:** Per correggere errori
- 📊 **Esporta Dati:** Download CSV con tutte le rose
- 💾 **Salvataggio Automatico:** LocalStorage mantiene stato

## 📱 Responsive Design

- 🖥️ **Desktop:** Layout a 3 colonne ottimizzato
- 📱 **Mobile/Tablet:** Interfaccia adattiva con stack verticale
- ⚡ **Touch-Friendly:** Ottimizzato per dispositivi touch

## 🎨 Caratteristiche UI/UX

- 🎨 **Design moderno** con gradienti e animazioni smooth
- 🌙 **Dark mode completo** con transizioni fluide
- 🔔 **Notifiche in tempo reale** per ogni azione
- ✨ **Animazioni** per feedback immediato
- 📊 **Indicatori visivi** per stato giocatori

## 💾 Persistenza Dati

Il sistema salva automaticamente:
- Partecipanti e budget
- Cronologia acquisti
- Stato asta corrente
- Preferenze tema

I dati vengono mantenuti nel browser tramite LocalStorage.