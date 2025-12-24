# 🏗️ Translation Management System (TMS) - Senior Technical Overview

---

## 🚀 1. Executive Summary & Architecture

This project is a **Modern Translation Management System (TMS)** designed to streamline the workflow between Clients, Translators, and Administrators. It leverages a **Modular Monolithic Architecture** with clear separation of concerns, ensuring scalability, maintainability, and type safety across the full stack.

### **Core Architecture Patterns:**
*   **Layered Architecture:** `Controller` → `Service/Business Logic` → `Data Access Layer (Mongoose Models)`.
*   **Event-Driven Communication:** Real-time updates via **Socket.io** for notifications, chat, and project status changes.
*   **State Management Strategy:**
    *   **Server State:** Handled via APIs and direct DB queries.
    *   **Client State:** Managed by **Zustand** (global stores like Auth, Project, System) to minimize prop drilling and ensure reactive UI updates.
*   **Role-Based Access Control (RBAC):** Strict permissions middleware (`protect`, `authorize`) ensuring data security for `ADMIN`, `SUPER_ADMIN`, `CLIENT`, and `TRANSLATOR` roles.

---

## 🛠️ 2. Technology Stack

### **Backend (The Core Engine)**
*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js (RESTful API)
*   **Language:** TypeScript (Strict typing for robustness)
*   **Database:** MongoDB & Mongoose (NoSQL, flexible schema for dynamic project data)
*   **Real-time:** Socket.io (Bi-directional communication)
*   **Authentication:** JWT (JSON Web Tokens) & Bcrypt (Password Hashing)
*   **File Handling:** Multer (Streaming uploads for optimized memory usage)
*   **AI Integration:** OpenAI SDK / Google Gemini (for automated translation suggestions)

### **Frontend (The User Experience)**
*   **Library:** React 18 (Functional Components, Hooks)
*   **Build Tool:** Vite (Lightning-fast HMR and bundling)
*   **Styling:** TailwindCSS (Utility-first, responsive design, Dark/Light mode support)
*   **State Management:** Zustand (Lightweight, flux-like state)
*   **Routing:** React Router DOM v6
*   **Validation:** Zod + React Hook Form (Type-safe form handling)
*   **UI Components:** Lucide React (Icons), Glassmorphism Design System

### **DevOps & Infrastructure**
*   **Containerization:** Docker & Docker Compose (Consistent dev/prod environments)
*   **Process Management:** PM2 (Production process manager for Node.js)
*   **CI/CD (Contextual):** GitHub Actions (Linting, Build Checks - *assumed standard practice*)

---

## 🗄️ 3. Database Design (Schema Highlights)

The database is normalized where necessary but leverages NoSQL flexibility for document storage.

1.  **Users:** Stores credentials, roles (`role`), and profile data. Indexed by `email`.
2.  **Projects:** The central entity.
    *   Relational link to `ClientId` (User).
    *   Relational link to `AssignedTranslators` (Array of User IDs).
    *   Embedded `Files` array (metadata for uploaded docs).
    *   Embedded `Deliverables` array (final files).
3.  **Segments:** *Critical for Translation Memory.*
    *   Stores `sourceText`, `targetText`, `status` (DRAFT, TRANSLATED, CONFIRMED).
    *   Linked to `Project` and `FileIndex`.
    *   Allows granular translation control (sentence-by-sentence).
4.  **SystemSettings:** Key-value store for dynamic app config (e.g., `allowed_file_types`, `max_file_size_mb`).

---

## 🔄 4. Key Functional Workflows

### **A. Project Lifecycle (The "Happy Path")**
1.  **Creation:** Client/Admin creates a project → Uploads file → Backend parses file (counts words, extracts text).
2.  **Assignment:** Admin assigns Translator(s) via the `assignTranslator` endpoint.
3.  **Execution (CAT Tool):**
    *   Translator opens **Translation Editor**.
    *   Fetches `Segments` for the specific file.
    *   Uses **AI Suggestions** (Gemini/OpenAI) to speed up work.
    *   Saves segments (Status: `TRANSLATED`).
4.  **Verification:** Admin reviews segments.
5.  **Delivery:** Final document is regenerated from segments and uploaded as a `Deliverable`.
6.  **Completion:** Project marked `COMPLETED`.

### **B. Real-time Interactions**
*   **Notifications:** When a project is assigned, the Translator receives an instant UI popup and sidebar badge update via Socket.io.
*   **Dashboard Stats:** Live aggregation of "Active Projects", "Words Translated", and "Pending Tasks".

---

## 🛡️ 5. Security & Best Practices Implemented

1.  **Input Validation:** Not just on Frontend! Backend explicitly validates file types (magic bytes inspection logic suggested for future, currently extension based) and payloads using strict typing.
2.  **Middleware Chain:**
    *   `protect`: Verifies JWT token presence and validity.
    *   `authorize(...)`: Checks User Role against allowed route roles.
3.  **Data Sanitization:** MongoDB query sanitization to prevent injection capabilities.
4.  **Error Handling:** Centralized `try-catch` blocks in controllers with standardized error responses (500 for server, 400 for bad requests).

---

## 🔮 6. Future Roadmap (Senior Perspective)

*   **Microservices Transition:** Breaking out the "AI Translation Engine" into a separate Python/FastAPI service for better NLP handling.
*   **Redis Caching:** Implementing Redis for `Dashboard` stats to reduce database load on expensive aggregation queries.
*   **Automated Testing:** Expanding Jest/Vitest coverage for unit tests and Cypress/Playwright for E2E flows.
*   **Glossary Management:** Building a centralized Term Base (TB) to enforce terminology consistency across projects.

---
*Created for Technical Review & Team Knowledge Transfer*

<br>
<br>

---
---

# 🏗️ نظام إدارة الترجمة (TMS) - نظرة تقنية شاملة (Arabic Version)

---

## 🚀 1. الملخص التنفيذي وهندسة النظام (Executive Summary & Architecture)

هذا المشروع عبارة عن **نظام إدارة ترجمة حديث (TMS)** مصمم لتبسيط سير العمل بين العملاء، المترجمين، والمسؤولين. يعتمد النظام على **هندسة معمارية وحدوية معيارية (Modular Monolithic Architecture)** مع فصل واضح للمسؤوليات، مما يضمن القابلية للتوسع، سهولة الصيانة، وأمان الأنواع (Type Safety) عبر جميع أجزاء النظام.

### **أنماط الهندسة الأساسية:**
*   **الهندسة الطبقية (Layered Architecture):** المتحكم (Controller) ← المنطق الخدمي/التجاري (Service Logic) ← طبقة الوصول للبيانات (Mongoose Models).
*   **الاتصال المعتمد على الأحداث (Event-Driven):** تحديثات فورية عبر **Socket.io** للإشعارات، المحادثات، وتغييرات حالة المشاريع.
*   **استراتيجية إدارة الحالة (State Management):**
    *   **حالة الخادم (Server State):** تُدار عبر واجهات برمجة التطبيقات (APIs) واستعلامات قاعدة البيانات المباشرة.
    *   **حالة العميل (Client State):** تُدار بواسطة **Zustand** (مخازن عالمية مثل Auth, Project, System) لتقليل تمرير الخصائص (Prop Drilling) وضمان تحديثات واجهة مستخدم تفاعلية.
*   **التحكم في الوصول القائم على الأدوار (RBAC):** استخدام برمجيات وسيطة صارمة للأذونات (`protect`, `authorize`) لضمان أمن البيانات لأدوار `ADMIN` (المسؤول)، `SUPER_ADMIN` (المشرف العام)، `CLIENT` (العميل)، و `TRANSLATOR` (المترجم).

---

## 🛠️ 2. حزمة التقنيات (Technology Stack)

### **الواجهة الخلفية (Backend - المحرك الأساسي)**
*   **بيئة التشغيل:** Node.js (v18+)
*   **إطار العمل:** Express.js (لبناء واجهات RESTful API)
*   **اللغة:** TypeScript (كتابة أنواع صارمة لزيادة المتانة)
*   **قاعدة البيانات:** MongoDB & Mongoose (قاعدة بيانات NoSQL، مخطط مرن لبيانات المشاريع الديناميكية)
*   **الوقت الحقيقي:** Socket.io (اتصال ثنائي الاتجاه)
*   **المصادقة:** JWT (لرموز الويب) & Bcrypt (لتشفير كلمات المرور)
*   **معالجة الملفات:** Multer (رفع متدفق لتحسين استخدام الذاكرة)
*   **تكامل الذكاء الاصطناعي:** OpenAI SDK / Google Gemini (لاقتراحات الترجمة الآلية)

### **الواجهة الأمامية (Frontend - تجربة المستخدم)**
*   **المكتبة:** React 18 (مكونات وظيفية، Hooks)
*   **أداة البناء:** Vite (تجميع وتحديث سريع جداً - HMR)
*   **التصميم:** TailwindCSS (تصميم متجاوب يعتمد على الأدوات المساعدة، دعم الوضع الداكن/الفاتح)
*   **إدارة الحالة:** Zustand (خفيف وسريع، يشبه نمط Flux)
*   **التوجيه:** React Router DOM v6
*   **التحقق:** Zod + React Hook Form (معالجة نماذج آمنة الأنواع)
*   **مكونات الواجهة:** Lucide React (للأيقونات)، ونظام تصميم Glassmorphism

### **العمليات والبنية التحتية (DevOps)**
*   **الحاويات:** Docker & Docker Compose (بيئات تطوير وإنتاج متطابقة)
*   **إدارة العمليات:** PM2 (مدير عمليات الإنتاج لـ Node.js)
*   **التكامل المستمر/النشر المستمر (CI/CD):** GitHub Actions (الفحص التلقائي، اختبارات البناء - *افتراض قياسي*)

---

## 🗄️ 3. تصميم قاعدة البيانات (أبرز ملامح المخطط)

قاعدة البيانات مُنظمة (Normalized) عند الضرورة ولكنها تستفيد من مرونة NoSQL لتخزين المستندات.

1.  **Users (المستخدمون):** يخزن الاعتمادات، الأدوار (`role`)، وبيانات الملف الشخصي. مفهرس بواسطة `email`.
2.  **Projects (المشاريع):** الكيان المركزي.
    *   رابط علاقي مع `ClientId` (المستخدم).
    *   رابط علاقي مع `AssignedTranslators` (مصفوفة معرفات المستخدمين).
    *   مصفوفة `Files` مضمنة (بيانات وصفية للملفات المرفوعة).
    *   مصفوفة `Deliverables` مضمنة (الملفات النهائية).
3.  **Segments (القطاعات):** *عنصر حيوي لذاكرة الترجمة.*
    *   تخزن `sourceText` (النص المصدر)، `targetText` (النص الهدف)، `status` (مسودة، مترجم، مؤكد).
    *   مرتبطة بـ `Project` و `FileIndex`.
    *   تسمح بتحكم دقيق في الترجمة (جملة بجملة).
4.  **SystemSettings (إعدادات النظام):** مخزن مفتاح-قيمة لإعدادات التطبيق الديناميكية (مثلاً: `allowed_file_types`، `max_file_size_mb`).

---

## 🔄 4. سير العمل الوظيفي الرئيسي (Key Workflows)

### **أ. دورة حياة المشروع (المسار الطبيعي)**
1.  **الإنشاء:** يقوم العميل/المسؤول بإنشاء مشروع ← رفع ملف ← الواجهة الخلفية تحلل الملف (عد الكلمات، استخراج النص).
2.  **التعيين:** يقوم المسؤول بتعيين مترجم(ين) عبر نقطة الاتصال `assignTranslator`.
3.  **التنفيذ (أداة CAT):**
    *   يفتح المترجم **محرر الترجمة**.
    *   يجلب `Segments` (القطاعات) الخاصة بالملف.
    *   يستخدم **اقتراحات الذكاء الاصطناعي** (Gemini/OpenAI) لتسريع العمل.
    *   يحفظ القطاعات (تتحول الحالة إلى: `TRANSLATED`).
4.  **التحقق:** يقوم المسؤول بمراجعة القطاعات.
5.  **التسليم:** يتم إعادة إنشاء المستند النهائي من القطاعات ورفعه كـ `Deliverable`.
6.  **الانتهاء:** يتم وضع علامة `COMPLETED` على المشروع.

### **ب. التفاعلات في الوقت الحقيقي**
*   **الإشعارات:** عند تعيين مشروع، يتلقى المترجم نافذة منبثقة فورية وتحديثاً للشارة في الشريط الجانبي عبر Socket.io.
*   **إحصائيات لوحة التحكم:** تجميع مباشر لـ "المشاريع النشطة"، "الكلمات المترجمة"، و "المهام المعلقة".

---

## 🛡️ 5. الأمان وأفضل الممارسات المطبقة

1.  **التحقق من المدخلات (Input Validation):** ليس فقط في الواجهة الأمامية! الواجهة الخلفية تتحقق صراحةً من أنواع الملفات (منطق فحص البايتات السحرية مقترح للمستقبل، حالياً يعتمد على الامتداد) والحمولات باستخدام أنواع صارمة.
2.  **سلسلة البرمجيات الوسيطة (Middleware Chain):**
    *   `protect`: تتحقق من وجود وصحة رمز JWT.
    *   `authorize(...)`: تتحقق من دور المستخدم مقابل الأدوار المسموح بها للمسار.
3.  **تعقيم البيانات (Data Sanitization):** تعقيم استعلامات MongoDB لمنع هجمات الحقن (Injection).
4.  **معالجة الأخطاء (Error Handling):** كتل `try-catch` مركزية في المتحكمات مع استجابات أخطاء موحدة (500 للخادم، 400 للطلبات غير الصحيحة).

---

## 🔮 6. خارطة الطريق المستقبلية (من منظور Senior)

*   **الانتقال إلى الخدمات المصغرة (Microservices):** فصل "محرك الترجمة بالذكاء الاصطناعي" إلى خدمة منفصلة بـ Python/FastAPI لمعالجة لغوية (NLP) أفضل.
*   **التخزين المؤقت (Redis Caching):** تطبيق Redis لإحصائيات `Dashboard` لتقليل الحمل على قاعدة البيانات في استعلامات التجميع المكلفة.
*   **الاختبار الآلي (Automated Testing):** توسيع تغطية Jest/Vitest لاختبارات الوحدات و Cypress/Playwright لتدفقات النهاية إلى النهاية (E2E).
*   **إدارة المصطلحات (Glossary Management):** بناء قاعدة مصطلحات مركزية (TB) لفرض اتساق المصطلحات عبر المشاريع.

---
*تم الإنشاء للمراجعة التقنية ونقل المعرفة للفريق*
