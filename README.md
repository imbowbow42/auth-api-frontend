# Auth API Frontend

A modern, responsive frontend login page inspired by the premium UI/UX of Claude's platform. This vanilla JavaScript application leverages Vite for fast development and serves as the UI layer for the `auth-api` backend.

## Features

- **Pristine UI/UX**: Clean, minimalist design with typography and layouts similar to professional platforms.
- **Dark/Light Mode**: Full CSS token support for beautiful light and dark variants, with persistent theme storage using `localStorage`.
- **JWT Authentication Flow**: Fully integrated with the backend REST API for logging in and retrieving JWTs securely.
- **Account Registration**: Smooth inline view toggling allows users to sign up without leaving the card or refreshing the page.
- **Google Single Sign-On (SSO)**: Natively integrated with Google Identity Services for one-click authentication.

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
</p>

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
You must also have the `auth-api` backend running locally (by default, it runs on `http://localhost:3000`).

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/imbowbow42/auth-api-frontend.git
   cd auth-api-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *Note: Because the backend explicitly whitelists certain ports via CORS, the frontend Vite server is configured to run on port `3300` (`http://localhost:3300/`).*

## API Compatibility

This frontend is configured by default to hit `http://localhost:3000`. Ensure your target backend is operational on this port, or adjust the `API_BASE_URL` in `main.js`.

### Implemented Endpoints
- `POST /auth/login`
- `POST /auth/register` 
- `POST /auth/google-login`

## Architecture

This project was intentionally kept lightweight without a heavy frontend framework like React or Vue. 
- `index.html`: Holds the semantic structure of the login/registration card and the `<script>` for Google services.
- `style.css`: Contains CSS variables determining light/dark states and handles all transitions.
- `main.js`: Intercepts form submissions, acts as the API bridge, orchestrates the state toggle, and injects error/success messaging directly into the DOM.
