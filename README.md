# Smart Property Analyzer Dubai

Een geavanceerde web applicatie voor het analyseren van vastgoed investeringen in Dubai, gebouwd met moderne web technologieën.

## 🏗️ Project Info

**Smart Property Analyzer Dubai** is een comprehensive tool voor vastgoed investeerders en professionals die actief zijn in de Dubai vastgoedmarkt. De applicatie biedt:

- **Property Analysis**: Gedetailleerde analyse van vastgoed eigenschappen
- **Investment Dashboard**: Overzicht van investeringsmogelijkheden
- **Journey Simulator**: Simulatie van investeringsscenario's
- **Insights Panel**: Markt inzichten en trends
- **Mobile Optimized**: Volledig responsive design voor alle apparaten

## 🚀 Technologieën

Dit project is gebouwd met:

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Radix UI primitives
- **Charts**: Recharts voor data visualisatie
- **Forms**: React Hook Form + Zod validatie
- **PDF Export**: jsPDF voor rapporten

## 📱 Features

- **Responsive Design**: Optimalisatie voor desktop, tablet en mobiel
- **Dark/Light Theme**: Automatische thema detectie en toggle
- **Real-time Data**: Live updates van vastgoed informatie
- **Export Functionaliteit**: PDF rapporten genereren
- **Interactive Charts**: Data visualisatie met Recharts
- **Form Validation**: Robuuste form handling met Zod schema's

## 🛠️ Lokale Ontwikkeling

### Vereisten
- Node.js 18+ 
- npm of yarn

### Installatie

```bash
# 1. Clone de repository
git clone <YOUR_GITHUB_REPO_URL>
cd smart-property-analyzer-dubai

# 2. Installeer dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173 in je browser
```

### Beschikbare Scripts

```bash
npm run dev          # Start development server
npm run build        # Build voor productie
npm run preview      # Preview van productie build
npm run lint         # ESLint check
```

## 🚀 Deployment naar Vercel

### Via GitHub

1. **Push naar GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: Smart Property Analyzer Dubai"
   git push origin main
   ```

2. **Verbinden met Vercel**:
   - Ga naar [vercel.com](https://vercel.com)
   - Log in met je GitHub account
   - Klik "New Project"
   - Selecteer je repository
   - Vercel detecteert automatisch dat het een Vite project is
   - Klik "Deploy"

### Vercel Configuratie

De applicatie is al geconfigureerd voor Vercel deployment met:
- Automatische build detectie
- Optimale build settings voor Vite
- Environment variable support

## 📁 Project Structuur

```
src/
├── components/          # React componenten
│   ├── ui/             # shadcn/ui componenten
│   ├── AppHeader.tsx   # Hoofd navigatie
│   ├── PropertyAnalyzer.tsx # Hoofd property analyzer
│   └── ...
├── pages/              # Route componenten
├── hooks/              # Custom React hooks
├── lib/                # Utility functies
└── assets/             # Afbeeldingen en media
```

## 🎨 Customisatie

### Theming
- Pas kleuren aan in `tailwind.config.ts`
- Wijzig component styling in `src/components/ui/`
- Voeg nieuwe componenten toe via shadcn/ui CLI

### Content
- Update Dubai-specifieke data in componenten
- Voeg nieuwe property types toe
- Pas berekeningen aan voor lokale markt

## 📊 Performance

- **Lighthouse Score**: Geoptimaliseerd voor Core Web Vitals
- **Bundle Size**: Tree-shaking en code splitting
- **Images**: Geoptimaliseerde afbeeldingen met Vite
- **Mobile**: Touch-friendly interface en snelle laadtijden

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is ontwikkeld voor commercieel gebruik in de Dubai vastgoedmarkt.

## 📞 Contact

Voor vragen over dit project of samenwerking, neem contact op via de applicatie of repository issues.

---

**Gebouwd met ❤️ voor de Dubai vastgoedmarkt**
