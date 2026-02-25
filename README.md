# AI Form Builder 🚀

> **Main Core Idea:** Transform natural language prompts into fully structured, live Google Forms in seconds using Groq Llama 3.3.

---

## ⚡ High-Impact Highlights
- **Prompt to Form**: Instant generation and deployment of Google Forms.
- **AI Expansion**: Add questions to live forms using AI prompts.
- **Resume-Ready UI**: Clean, professional, static design with full Dark/Light theme support.
- **Zero Configuration**: Ready-to-use templates for common use cases.

---

## ✨ Features

### 1. 🧙‍♂️ AI Form Wizard
Describe your form idea (e.g., *"Event registration for a 5k run with t-shirt sizes"*) and let the AI handle the rest.
- **Intelligent Analysis**: Groq AI analyzes your prompt and suggests logical sections.
- **Section Selection**: Pick and choose from AI-suggested fields to customize the structure.
- **Instant Deployment**: Deploys a live Google Form directly to your account.

### 2. 🧩 Smart Form Expansion
Already have a form? Add more complexity with a single prompt.
- **Seamless Appending**: Describe new sections or questions, and AI appends them to your existing Google Form.
- **Context Aware**: The AI understands the existing form structure to ensure consistent question types.

### 3. 📝 AI Form Templates
Don't want to start from scratch? Use one of our high-impact templates:
- **Customer Feedback**
- **Event RSVP**
- **Job Application**
- **Health & Wellness Survey**
- **Course Feedback**
- **Product Order Form**

### 4. 📂 Workspace Management
- **Dashboard Search**: Quickly find forms in your workspace.
- **Status Tracking**: Monitor which forms are Live or Expired.
- **Duplication**: Clone existing form structures with one click.
- **Instant Sharing**: Fast access to public links and edit URLs.

---

## 🎨 Design Philosophy: Clean & Professional
This application version has been polished for a **cinematic yet minimal** experience:
- **No Distractions**: All non-essential animations have been removed for a clean, professional aesthetic.
- **Full Theme Support**: Seamlessly switch between **Dark** and **Light** modes with consistent styling across all components.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views.

---

## 🛠️ Tech Stack

### Frontend
- **React & Vite**: Fast, modern frontend framework.
- **Tailwind CSS**: Utility-first styling with a custom theme system.
- **Lucide React**: Crisp, professional icon set.
- **Clean CSS**: Custom-built design tokens for theme consistency.

### Backend
- **Node.js & Express**: High-performance backend routing.
- **Groq SDK (Llama 3.3)**: State-of-the-art AI inference for form generation.
- **Google APIs**: Direct integration with Google Forms and Sheets.
- **MongoDB & Mongoose**: Secure storage for form metadata and user workspaces.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Groq API Key
- Google Cloud Console Credentials (OAuth 2.0)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tarunkulkarni4/AI-form-builder
   cd ai-form-builder
   ```

2. **Backend Setup**:
   - Navigate to `/server`
   - Create a `.env` file based on `.env.example`
   - Install dependencies: `npm install`
   - Run server: `npm run dev`

3. **Frontend Setup**:
   - Navigate to `/client`
   - Create a `.env` file for client-side keys
   - Install dependencies: `npm install`
   - Run client: `npm run dev`

---

## 🔐 Security & Persistence
- **Google OAuth**: Secure login and form management.
- **Automatic Sync**: Form responses are automatically synced to Google Sheets for easy analysis.
- **Date-Based Expiry**: Set forms to close automatically on a specific date.
