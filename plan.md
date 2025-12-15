# Project Plan: Professional Job Application Tracker

## Open Questions
- [x] What photo enhancement service/API should we use? → **Replicate CodeFormer** (face restoration/enhancement model)
- [ ] What AI service should we use for cover letter generation? (e.g., OpenAI GPT, Anthropic Claude, other)
- [ ] What AI service should we use for resume bullet point generation? (same as cover letter or different?)
- [ ] Should users be able to edit generated cover letters and resume bullets before saving?
- [x] What file storage solution should we use for uploaded photos? → **Supabase Storage** (with RLS policies)

---

## Tech Stack

### Frontend
- **Next.js** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn UI** - Component library
- **ESLint 9** - Code linting

### Backend & Database
- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Supabase Storage (for photo uploads)
  - Row Level Security (RLS) for data access control

### Authentication
- **Supabase Auth** - Built-in authentication service (email/password, OAuth providers)

### AI Services (TBD)
- **Photo Enhancement API** - To be determined
- **AI Service for Cover Letters** - To be determined
- **AI Service for Resume Bullets** - To be determined

### Infrastructure & DevOps
- **Git** - Version control
- **GitHub** - Code repository hosting
- **Vercel** - Deployment and hosting platform
- **npm** - Package manager

### Testing (TBD)
- **Unit Testing Framework** - Jest or Vitest (to be determined)
- **E2E Testing Framework** - Playwright or Cypress (to be determined)

### Design Principles
- Minimal, functional, practical design
- Intentional use of color
- Warmer tones palette

---

## Phase 1: Project Foundation & Setup

### 1.1 Project Initialization
- [x] Initialize Next.js project with TypeScript
- [x] Set up Git repository and initial commit
- [x] Configure package.json with project metadata
- [x] Set up .gitignore file

### 1.2 Development Environment
- [x] Install and configure Tailwind CSS v4
- [x] Set up Shadcn UI components library
- [x] Configure ESLint 9
- [x] Set up environment variables structure (.env.local)
- [x] Create project folder structure

### 1.3 Infrastructure Setup
- [x] Create Supabase project
- [x] Set up Supabase database connection
- [ ] Prepare Vercel project (deployment config)

---

## Phase 2: Authentication & Database Schema

### 2.1 Supabase Authentication Integration
- [x] Install Supabase SSR package (@supabase/ssr)
- [x] Configure Supabase middleware for route protection
- [x] Create authentication pages (sign-in, sign-up)
- [x] Set up auth callback route
- [x] Create auth utilities and hooks
- [ ] Test authentication flow

### 2.2 Database Schema Design
- [x] Design database schema for:
  - [x] Users table (linked to Supabase auth user IDs)
  - [x] Jobs table (job applications)
  - [x] Photos table (uploaded and enhanced photos)
  - [x] Cover Letters table (generated cover letters)
  - [x] Resume Bullets table (generated resume bullet points)
- [x] Create Supabase migrations
- [x] Set up Row Level Security (RLS) policies
- [x] Test database connections and queries

---

## Phase 3: Core UI Foundation

### 3.1 Design System Setup
- [x] Define color palette with blue tones (OKLCH color space)
- [x] Configure Tailwind theme with custom colors
- [x] Set up typography system (Geist font family)
- [x] Create base layout components
- [x] Set up Shadcn UI theme configuration

### 3.2 Navigation & Layout
- [x] Create main layout component (marketing + dashboard layouts)
- [x] Build navigation bar/header
- [x] Implement protected route wrapper (dashboard layout)
- [x] Create dashboard/home page structure
- [x] Add loading states and error boundaries

---

## Phase 4: Job Application Tracking (Core Feature)

### 4.1 Job CRUD Operations
- [x] Create job application form component
- [x] Build job list view (dashboard)
- [x] Implement job detail view
- [x] Add job edit functionality
- [x] Add job delete functionality
- [x] Create job status tracking (applied, interview, offer, rejected, etc.)

### 4.2 Job Data Management
- [x] Set up API routes for job operations
- [x] Implement Supabase queries for jobs
- [x] Add form validation
- [x] Create job search/filter functionality
- [x] Add job sorting options

---

## Phase 5: Photo Enhancement & Generation Feature

### 5.1 Photo Upload & Storage
- [x] Create photo upload component
- [x] Set up file storage (Supabase Storage or alternative)
- [x] Implement image preview
- [x] Add image validation (size, format)
- [x] Store uploaded photos in database

### 5.2 Photo Enhancement Integration
- [x] Research and select photo enhancement API/service
- [x] Create API route for photo enhancement
- [x] Integrate enhancement service (Replicate CodeFormer)
- [x] Build enhanced photo display component
- [x] Add download functionality for enhanced photos
- [x] Implement photo history/version tracking

### 5.3 AI Headshot Generation (NEW)
- [x] Create photo generator component with style selection
- [x] Build customization UI (headshot style, background, attire)
- [x] Create API route for AI headshot generation (Replicate PhotoMaker)
- [x] Implement 4-step flow: Upload → Customize → Generate → Download
- [x] Add before/after comparison view
- [x] Support multiple style presets (Corporate, Startup, Creative, Executive)
- [x] Support background options (Studio, Office, Outdoor, Gradient, Abstract)
- [x] Support attire options (Formal, Business Casual, Smart Casual, Creative)

---

## Phase 6: Cover Letter Generation

### 6.1 Cover Letter Generation Setup
- [x] Research and select AI service for cover letter generation → **Anthropic Claude**
- [x] Set up AI service API keys and configuration
- [x] Design prompt templates for cover letter generation
- [x] Create API route for cover letter generation

### 6.2 Cover Letter UI & Features
- [x] Build job description input form
- [x] Create cover letter generation interface
- [x] Display generated cover letter
- [x] Add edit functionality for generated cover letters
- [x] Implement save/export functionality
- [ ] Link cover letters to specific job applications

---

## Phase 7: Resume Bullet Point Generation

### 7.1 Resume Bullet Generation Setup
- [x] Research and select AI service for resume bullet generation → **Anthropic Claude** (same as cover letters)
- [x] Set up AI service API keys (if different from cover letters) → Reuses existing ANTHROPIC_API_KEY
- [x] Design prompt templates for resume bullet generation
- [x] Create API route for resume bullet generation

### 7.2 Resume Bullet UI & Features
- [x] Build job description input form (reuse or create new)
- [x] Create resume bullet generation interface
- [x] Display generated bullet points
- [x] Add edit functionality for generated bullets
- [x] Implement save/export functionality (copy to clipboard, save to database)

---

## Phase 7.5: Unified Smart Apply Flow (NEW)

### 7.5.1 Smart Apply Wizard
- [x] Create unified "Smart Apply" page with multi-step wizard
- [x] Step 1: Job details input (company, title, description, etc.)
- [x] Step 2: Resume input (paste text or upload PDF/image)
- [x] Step 3: AI generates both cover letter AND resume bullets simultaneously
- [x] Step 4: Review, edit, and save all materials together

### 7.5.2 Backend Integration
- [x] Create combined API route for generating both materials at once
- [x] Link generated cover letters to job applications
- [x] Link generated resume bullets to job applications
- [x] Save job application, cover letter, and bullets in single transaction

### 7.5.3 UI/UX Improvements
- [x] Add progress indicator for wizard steps
- [x] Show side-by-side or tabbed view for cover letter and bullets
- [x] Allow copying all materials at once
- [x] Quick navigation back to edit specific sections

---

## Phase 8: Testing

### 8.1 Unit Tests
- [ ] Set up testing framework (Jest/Vitest)
- [ ] Write unit tests for business logic:
  - [ ] Job CRUD operations
  - [ ] Photo processing logic
  - [ ] Cover letter generation logic
  - [ ] Resume bullet generation logic
- [ ] Achieve good test coverage

### 8.2 E2E Tests
- [ ] Set up E2E testing framework (Playwright/Cypress)
- [ ] Write E2E tests for core user journeys:
  - [ ] User authentication flow
  - [ ] Creating and managing job applications
  - [ ] Uploading and enhancing photos
  - [ ] Generating cover letters
  - [ ] Generating resume bullets

---

## Phase 9: Polish & Optimization

### 9.1 User Experience
- [ ] Add loading states throughout the app
- [ ] Implement error handling and user feedback
- [ ] Add success/error toast notifications
- [ ] Optimize image loading and display
- [ ] Improve mobile responsiveness

### 9.2 Performance & Security
- [ ] Optimize API routes and database queries
- [ ] Implement rate limiting for AI generation endpoints
- [ ] Add input sanitization and validation
- [ ] Review and strengthen RLS policies
- [ ] Optimize bundle size and code splitting

---

## Phase 10: Deployment

### 10.1 Pre-Deployment
- [ ] Set up production environment variables
- [ ] Configure Vercel deployment settings
- [ ] Set up production Supabase instance
- [ ] Configure Supabase Auth for production
- [ ] Run final tests in staging environment

### 10.2 Deployment & Monitoring
- [ ] Deploy to Vercel
- [ ] Set up custom domain (if applicable)
- [ ] Configure monitoring and error tracking
- [ ] Set up analytics (optional)
- [ ] Create deployment documentation

---

## Phase 11: Documentation & Cleanup

### 11.1 Documentation
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Create API documentation
- [ ] Add code comments where necessary

### 11.2 Final Cleanup
- [ ] Review and clean up unused code
- [ ] Ensure all commits are descriptive
- [ ] Final code review
- [ ] Update plan.md with completed items

---

## Notes
- Each phase should be completed and tested before moving to the next
- Use descriptive Git commit messages
- Test authentication and database setup thoroughly before building features
- Consider implementing features incrementally within each phase

