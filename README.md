# Easy Balance - Frontend

Easy Balance is a modern, responsive personal finance and budget tracking dashboard. This repository contains the frontend application built with React, Vite, and Tailwind CSS.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Oxlint](https://oxc.rs/docs/guide/usage/linter/introduction)

---

## ✨ Features

- **Interactive Dashboard**: Real-time summary of expenses, income, and budgets.
- **Monthly Views**: Track fixed and variable expenses categorized by month.
- **Account Sidebar**: Quick look at account balances and statuses.
- **Configuration Management**: Dynamically configure budget parameters.
- **Dark Mode**: Fully responsive, sleek dark mode theme support.
- **Authentication**: JWT-based authentication and secure session management.

---

## 🛠️ Local Development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Environment Configuration

By default, the frontend connects to `http://localhost:8080/api`. To customize this, copy `.env.example`:

```bash
cp .env.example .env.local
```

And set:
```env
VITE_API_URL=http://localhost:8080/api
```

### Steps

1. **Clone the repository**:
   ```bash
   git clone git@github.com:stv10/easy-balance-frontend.git
   cd easy-balance-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will run locally at `http://localhost:5173/`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ⚙️ Environment Variables

| Variable | Required | Description | Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | No | Base URL for the Easy Balance backend API. | `http://localhost:8080/api` |

---

## 🐳 Docker & Container Deployment

This repository includes a multi-stage Docker build config for production deployments (using Nginx to serve static files).

### Build locally
```bash
docker build -t ghcr.io/stv10/easy-balance-frontend:latest .
```

### Run Container (with custom API URL)
```bash
docker run -d -p 80:80 \
  -e VITE_API_URL=https://api.yourdomain.com/api \
  ghcr.io/stv10/easy-balance-frontend:latest
```

### Pull Image from GitHub Container Registry (GHCR)
```bash
docker pull ghcr.io/stv10/easy-balance-frontend:latest
```
