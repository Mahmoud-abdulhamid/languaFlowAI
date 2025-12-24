# System Overview

## Introduction
This project is a full-stack Translation System leveraging AI for automated translations and a comprehensive dashboard for management.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Database**: MongoDB
- **Real-time**: Socket.io
- **AI Integration**: Google Generative AI, OpenAI

## Architecture

### Backend (`/backend`)
- **Entry Point**: `src/main.ts`
- **API Structure**: RESTful API under `/api/v1`
- **Key Routes**:
    - `/auth`: Authentication
    - `/users`: User management
    - `/projects`: Project management
    - `/ai`: AI translation services
    - `/dashboard`: Analytics
    - `/roles`: RBAC (Role-Based Access Control)
- **Services**:
    - `socketService`: Handles real-time events.

### Frontend (`/frontend`)
- **Entry Point**: `src/main.tsx` -> `src/App.tsx`
- **State Management**: Zustand
- **Routing**: React Router DOM (v7)
- **Styling**: TailwindCSS
- **Key Areas**:
    - **Public**: Landing Page, Public Profile, Login
    - **Protected**: Dashboard, Projects, Editor
    - **Admin**: User Management, Role Management, System Settings

## Key Features
1. **AI Translation**: Integration with Gemini and OpenAI for translating content.
2. **Project Management**: Creation and tracking of translation projects.
3. **Role-Based Access**: Granular permissions (Admin, Super Admin, Translator, Client).
4. **Real-time Collaboration**: Socket.io integration for updates.
5. **Live Dashboard**: Monitoring active users and system status.
