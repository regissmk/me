## AI Rules for Web Application Development

This document outlines the technical stack and guidelines for using libraries within this React application to ensure consistency, maintainability, and adherence to best practices.

### Tech Stack Overview

*   **Framework:** React.js
*   **Language:** TypeScript
*   **Routing:** React Router (routes defined in `src/App.tsx`)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (pre-built, not to be modified directly)
*   **Icons:** Lucide React
*   **Animations:** Framer Motion
*   **Backend/Database/Authentication:** Supabase
*   **SEO Management:** React Helmet Async
*   **Rich Text Editing:** React Quill

### Library Usage Guidelines

*   **Styling:**
    *   All styling must be implemented using **Tailwind CSS** utility classes.
    *   Utilize **shadcn/ui** components for common UI elements. These components are considered "black boxes" and should not be edited directly. If a shadcn/ui component requires customization beyond its props, create a new component that wraps or extends its functionality, or build a new component from scratch following the design system.
*   **Icons:**
    *   Use icons exclusively from the **Lucide React** library.
*   **Animations:**
    *   Implement all animations and transitions using **Framer Motion** for smooth and consistent user experiences.
*   **Routing:**
    *   **React Router** is the designated library for client-side routing. All primary route definitions should reside in `src/App.tsx`.
*   **Backend & Authentication:**
    *   **Supabase** is the chosen platform for database management, authentication, and other backend services. All data interactions and authentication flows should leverage the Supabase client.
*   **SEO:**
    *   Manage page titles, meta descriptions, and other head elements using **React Helmet Async**.
*   **Rich Text Editing:**
    *   For any rich text input or display, use the **React Quill** component.
*   **File Structure:**
    *   Components should be placed in `src/components/`.
    *   Pages should be placed in `src/pages/`.
    *   Layouts should be placed in `src/layouts/`.
    *   Context providers should be placed in `src/contexts/`.
    *   Utility functions and client configurations (like Supabase) should be in `src/lib/`.
    *   Directory names must be all lower-case.