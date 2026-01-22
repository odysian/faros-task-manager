# FAROS Task Manager - Frontend

React frontend for the FAROS task management app.

**Live Demo:** https://faros.odysian.dev  
**Backend Repo:** https://github.com/odysian/task-manager-api
<details>
  <summary><strong>Watch the Mobile Demo</strong> (Click to Expand)</summary>

  <br>

  https://github.com/user-attachments/assets/5ed8dd35-2fa7-44b5-a72b-0d8d50913cad

  <br>
</details>

## Tech Stack

- React 18 with Vite
- Tailwind CSS
- Axios for API calls
- Lucide React for icons
- Deployed on CloudFront + S3

## Features

The UI provides:
- Task dashboard with filtering and search
- User authentication (login, register, password reset)
- Task creation and editing
- File uploads and downloads
- Comments on tasks
- Task sharing with permissions
- Activity timeline
- User settings and notifications preferences

## Running Locally

```bash
# Clone repository
git clone https://github.com/odysian/task-manager-frontend
cd task-manager-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Visit http://localhost:5173

**Note:** You'll need the backend API running at `http://localhost:8000` (see [backend repo](https://github.com/odysian/task-manager-api) for setup).

## Project Structure

```
src/
├── components/
│   ├── Auth/         # Login, register, password reset
│   ├── Tasks/        # Task list, forms, dashboard
│   ├── Settings/     # User settings, notifications
│   ├── Activity/     # Activity timeline
│   └── Common/       # Shared components
├── api.js            # Axios configuration
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Deployment

Deployed to AWS using GitHub Actions:
- Builds React app (`npm run build`)
- Uploads to S3 bucket
- Served via CloudFront CDN
- Deploys automatically on push to `main`

## Contact

**Chris**
- GitHub: [@odysian](https://github.com/odysian)
- Website: https://odysian.dev
- Email: c.colosimo@odysian.dev
