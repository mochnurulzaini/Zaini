# 💰 MoneyFlow — Aplikasi Keuangan Pribadi

Aplikasi manajemen keuangan pribadi modern berbasis PWA. Dibangun dengan React + TypeScript + Vite. **Full Offline** — semua data tersimpan di LocalStorage perangkat kamu.

---

## ✨ Fitur Lengkap

| Fitur | Deskripsi |
|---|---|
| 📊 Dashboard | Saldo, statistik bulanan, grafik arus keuangan |
| 💳 Transaksi | Tambah/edit/hapus, pencarian realtime, filter & sorting |
| 🏷️ Kategori | Kategori kustom dengan ikon & warna |
| 🎯 Anggaran | Batas pengeluaran per kategori + warning |
| 🐖 Tabungan | Target tabungan + progress tracking |
| 📈 Statistik | Grafik mingguan / bulanan / tahunan + pie chart |
| ⚙️ Pengaturan | Dark mode, PIN lock, export/import JSON |
| 🔒 Keamanan | PIN 4–8 digit dengan SHA-256 hashing |
| 📱 PWA | Install ke home screen, offline-ready |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js >= 18
- npm atau yarn

### Langkah

```bash
# 1. Clone / extract project
cd moneyflow

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
# → http://localhost:5173

# 4. Build untuk production
npm run build

# 5. Preview hasil build
npm run preview
```

---

## 🗂️ Struktur Folder

```
src/
├── app/
│   └── App.tsx              # Root component
├── components/
│   ├── Amount.tsx            # Format Rupiah
│   ├── EmptyState.tsx        # Empty states
│   ├── ErrorBoundary.tsx     # Error handling
│   ├── PageHeader.tsx        # Page headers
│   ├── PinLock.tsx           # PIN screen
│   ├── StatCard.tsx          # Stat cards
│   ├── Toast.tsx             # Notifications
│   └── TransactionItem.tsx   # Transaction row
├── features/
│   └── transactions/
│       └── TransactionModal.tsx
├── layouts/
│   └── AppLayout.tsx         # Sidebar + bottom nav
├── pages/
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── CategoriesPage.tsx
│   ├── BudgetsPage.tsx
│   ├── SavingsPage.tsx
│   ├── StatisticsPage.tsx
│   └── SettingsPage.tsx
├── routes/
│   └── AppRoutes.tsx
├── stores/
│   ├── transactionStore.ts   # Zustand
│   ├── categoryStore.ts
│   ├── budgetStore.ts
│   ├── savingsStore.ts
│   └── uiStore.ts
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
└── utils/
    ├── cn.ts
    ├── defaults.ts
    ├── helpers.ts
    └── storage.ts            # LocalStorage utils
```

---

## 💾 Penyimpanan Data

Semua data disimpan di **LocalStorage** browser dengan key:

| Key | Data |
|---|---|
| `moneyflow_transactions` | Semua transaksi |
| `moneyflow_categories` | Kategori |
| `moneyflow_budgets` | Anggaran |
| `moneyflow_savings` | Target tabungan |
| `moneyflow_settings` | Pengaturan & PIN |

Data **tidak dikirim ke server** manapun. Seluruh aplikasi berjalan offline.

### Backup & Restore
- **Settings → Ekspor Data** → unduh file `.json`
- **Settings → Impor Data** → pulihkan dari file backup

---

## 🎨 Stack Teknologi

| Teknologi | Fungsi |
|---|---|
| React 18 | UI Framework |
| TypeScript 5 | Type safety |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Zustand 4 | State management |
| React Router DOM 6 | Routing |
| Framer Motion 11 | Animasi |
| Recharts 2 | Grafik |
| Lucide React | Icons |
| date-fns | Date formatting |
| vite-plugin-pwa | PWA support |

---

## 📱 PWA — Install ke Home Screen

### Android (Chrome)
1. Buka di Chrome
2. Tap menu ⋮ → **"Tambah ke layar utama"**

### iPhone (Safari)
1. Buka di Safari
2. Tap Share → **"Add to Home Screen"**

### Desktop (Chrome/Edge)
1. Klik ikon install di address bar

---

## 🚢 Deploy

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload folder dist/ ke Netlify
```

### GitHub Pages
```bash
# Set base di vite.config.ts: base: '/repo-name/'
npm run build
# Push dist/ ke branch gh-pages
```

---

## 📄 Lisensi

MIT — bebas digunakan dan dimodifikasi.

---

## 🛠️ Development Notes

- I installed the `tailwindcss-animate` plugin and committed `package.json`/`package-lock.json`.
- If you want to push the commit to a remote repository, add a remote and push:

```bash
git remote add origin <remote-url>
git push -u origin master
```

- Start the dev server locally:

```bash
npm install
npm run dev
# opens at http://localhost:5173
```

If you want, provide a remote URL and I can add the remote and push the commit for you.
