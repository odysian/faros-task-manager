# FAROS Task Manager - Frontend

The React-based user interface for the **FAROS Task Manager** system.

**Live Demo:** [https://faros.odysian.dev](https://faros.odysian.dev)

<details>
  <summary><strong>Watch the Mobile Demo</strong> (Click to Expand)</summary>

  <br>

  https://github.com/user-attachments/assets/5ed8dd35-2fa7-44b5-a72b-0d8d50913cad

  <br>
</details>

--- 

> **Note:** This repository serves as the client-side interface for the [FAROS Backend API](https://github.com/odysian/task-manager-api). The primary focus of this project is the backend engineering, distributed infrastructure, and DevOps practices found in the core API repository. This frontend was built with AI assistance to demonstrate the full functionality of the backend system.

---

## Tech Stack

* **Framework:** [React 18](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Deployment:** AWS S3 + CloudFront (via GitHub Actions)

---

## Setup & Running Locally

1. **Clone the repository**
```bash
git clone https://github.com/odysian/task-manager-frontend.git
cd task-manager-frontend

```


2. **Install dependencies**
```bash
npm install

```


3. **Configure Environment**
Create a `.env` file in the root directory:
```properties
# Points to your local FastAPI backend or production URL
VITE_API_URL=http://localhost:8000

```


4. **Start the development server**
```bash
npm run dev

```


The app will run at `http://localhost:5173`.

---

## Deployment Infrastructure

This frontend is deployed as a static site using a high-performance AWS architecture:

* **AWS S3:** Hosts the static build files (HTML/CSS/JS).
* **AWS CloudFront:** Distributes content globally via edge locations.
* **GitHub Actions:** Automates deployment on push to `main`:
1. Installs dependencies & builds the project (`npm run build`).
2. Syncs the `dist/` folder to the S3 bucket.
3. Invalidates the CloudFront cache to ensure users see the latest version instantly.

---

## Connects To

This frontend consumes the following backend services:

* **Authentication:** JWT-based login, registration, and password resets.
* **Task Management:** CRUD operations, filtering, and bulk updates.
* **Real-time Interactions:** Comments and notifications.
* **File Storage:** Secure file upload/download via AWS S3 Presigned URLs.

For the core engineering work, please visit the **[Backend API Repository](https://github.com/odysian/task-manager-api)**.
