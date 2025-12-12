
export const translations = {
    en: {
        dir: 'ltr',
        flag: '🇬🇧',
        name: 'English',
        nav: {
            features: 'Features',
            technology: 'Technology',
            roadmap: 'Roadmap',
            contact: 'Contact',
            access: 'Access Platform'
        },
        hero: {
            system_online: 'System Online v2.4 (AI Enabled)',
            title_prefix: 'The OS for',
            title_gradient: 'Modern Translation Agencies',
            description: 'Built specifically for LSPs to manage projects, translators, and clients in one unified platform. Stop juggling tools and start scaling your agency.',
            launch_demo: 'Launch Demo',
            explore_features: 'Explore Features',
            stats: {
                enterprise: 'Enterprise Ready',
                multi_lang: 'Multi-Language',
                ai_powered: 'AI Powered'
            },
            badge: {
                label: 'Efficiency Boost',
                value: '+450%'
            }
        },
        features: {
            label: 'Power & Precision',
            title_prefix: 'Everything you need to',
            title_gradient: 'Ship Faster',
            items: {
                ai_nexus: { title: 'AI Nexus', desc: 'Advanced AI integration that assists with translation, generates glossaries, and suggests improvements in real-time.' },
                chat_hub: { title: 'Chat Hub', desc: 'Real-time communication channels for teams. Share files, discuss context, and keep everyone aligned.' },
                smart_glossary: { title: 'Smart Glossary', desc: 'Context-aware glossary highlighting in the editor. Never miss a defined term again.' },
                smart_deadlines: { title: 'Smart Deadlines', desc: 'Intelligent countdowns that adapt their urgency visuals based on time remaining.' },
                multi_lingual: { title: 'Multi-Lingual', desc: 'Support for limitless language pairs with instant validation and project setup.' },
                instant_qa: { title: 'Instant QA', desc: 'Automated quality checks and easy status tracking from Draft to Confirmed.' }
            }
        },
        stats: {
            words_processed: 'Words Processed',
            active_projects: 'Active Projects',
            languages: 'Languages',
            uptime: 'Uptime'
        },
        workflow: {
            title: 'From File to',
            title_highlight: 'Global',
            steps: {
                upload: { title: 'Upload Project', desc: 'Drag & drop documents. We support PDF, DOCX, and more.' },
                ai: { title: 'AI Analysis', desc: 'Our engine pre-translates and identifies glossaries instantly.' },
                review: { title: 'Expert Review', desc: 'Professional translators refine constraints and nuances.' },
                delivery: { title: 'Delivery', desc: 'Receive polished, formatted files ready for global launch.' }
            }
        },
        ai: {
            badge: 'Powered by',
            title_highlight: 'Next-Gen AI',
            desc: 'Our AI Nexus isn\'t just a chatbot. It\'s a deep-learning core that understands context, tone, and nuance, effectively doubling translator productivity.',
            features: {
                multimodel: { title: 'Multi-Model Core', desc: 'Seamlessly switches between GPT-4, Gemini Pro, and Claude based on the complexity and domain of the text for optimal results.' },
                context: { title: 'Context Aware', desc: 'The AI remembers project constraints, glossaries, and tone guidelines, ensuring consistency across thousands of segments.' },
                assistant: { title: 'Real-time Assistant', desc: 'Translators can chat with the document. "How do I phrase this friendlier?" or "Summarize this paragraph" directly in the editor.' }
            }
        },
        roadmap: {
            weekly_updates: 'WEEKLY UPDATES',
            title_prefix: 'Building the',
            title_highlight: 'Ultimate Ecosystem',
            desc: 'LinguaFlow is not static. We push code every week. We are evolving from a translation tool into a',
            desc_highlight: ' full-suite Agency Management System',
            desc_suffix: '.',
            items: {
                hr: { title: 'HR & Talent', desc: 'Automated payroll, performance tracking, and recruitment pipelines for your linguists.', status: 'Coming Soon' },
                erp: { title: 'Agency ERP', desc: 'Full resource planning, asset management, and financial forecasting integrated directly into your workflow.', status: 'In Development' },
                crm: { title: 'Advanced CRM', desc: 'Deep client insights, sales pipelines, and automated quoting to grow your B2B relationships.', status: 'Planned' }
            }
        },
        vision: {
            title: 'Our Vision: The Agency OS',
            desc: 'Imagine a world where your PMS, HR, CRM, and CAT tool are one single, intelligent organism. That\'s where we are going.',
            join_us: 'Join us on the journey.'
        },
        cto: {
            meet: 'Meet the',
            architect: 'Architect',
            role: 'CTO & Lead Engineer',
            quote: '"We built LinguaFlow to bridge the gap between human creativity and artificial intelligence. Our mission is to empower developers and translators with tools that feel like superpowers."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'Email', call: 'Call' }
        },
        faq: {
            title: 'Common',
            title_highlight: 'Questions',
            questions: {
                ai_help: { q: 'How does the AI assistant help translators?', a: 'Our AI Nexus analyzes the source text to provide real-time suggestions, grammar checks, and terminology consistency, effectively acting as a co-pilot that speeds up the process by up to 50%.' },
                multiple_projects: { q: 'Can I manage multiple projects simultaneously?', a: 'Absolutely. The Admin Dashboard is designed for scale, allowing you to track unlimited projects, assign resources, and monitor deadlines from a single bird\'s-eye view.' },
                security: { q: 'Is my data secure?', a: 'Security is paramount. We use enterprise-grade encryption for all data in transit and at rest, with role-based access control ensuring that only authorized personnel can view sensitive documents.' },
                clients: { q: 'How do I invite clients?', a: 'Admins can create client accounts and assign them to specific projects. Clients get a restricted, transparent view where they can approve deliverables and chat with the team.' }
            }
        },
        engineering: {
            badge: 'ENGINEERING EXCELLENCE',
            title: 'Built on Rock-Solid',
            title_highlight: 'First Principles',
            desc: 'We didn\'t just build a translation tool; we engineered a robust distributed system designed for 99.99% reliability and seamless scalability.',
            principles: {
                microservices: { title: 'Microservices Architecture', desc: 'Decoupled services ensure that a failure in one module never brings down the whole system.' },
                performance: { title: 'High Performance', desc: 'Optimized via Redis caching and database indexing for sub-millisecond response times.' },
                security: { title: 'Enterprise Security', desc: 'RBAC, AES-256 encryption, and sanitized inputs protect your data at every layer.' },
                scalability: { title: 'Infinite Scalability', desc: 'Built on a stateless backend that autoscales horizontally to handle millions of requests.' }
            }
        },
        roles: {
            title_prefix: 'Built for',
            title_highlight: 'Every Role',
            desc: 'A unified platform that adapts to your needs, whether you\'re managing the system, translating content, or requesting work.',
            types: {
                admin: {
                    label: 'For Admins',
                    title: 'Total Command Center',
                    desc: 'Manage users, projects, and system health from a single, powerful dashboard.',
                    features_list: ['Global Overview', 'User Management', 'System Config', 'Detailed Analytics']
                },
                translator: {
                    label: 'For Translators',
                    title: 'Distraction-Free Workbench',
                    desc: 'A dedicated workspace with integrated glossary, AI tools, and progress tracking.',
                    features_list: ['Smart Editor', 'Glossary Highlights', 'AI Assistant', 'Real-time Diff']
                },
                client: {
                    label: 'For Clients',
                    title: 'Transparent Progress',
                    desc: 'Track your projects in real-time, communicate with the team, and manage deliverables.',
                    features_list: ['Project Wizard', 'Live Status', 'Direct Chat', 'Cost Est.']
                }
            },
            explore: 'Explore'
        },
        tooltips: {
            whatsapp: 'Contact on WhatsApp',
            linkedin: 'Connect on LinkedIn',
            email: 'Email Us',
            call: 'Call Us'
        },
        cta: {
            title: 'Ready to transform your workflow?',
            desc: 'Join thousands of translators and agencies who have switched to the modern OS for localization.',
            button: 'Access Platform'
        },
        footer: {
            rights: 'All rights reserved.',
            developed_by: 'Developed by',
            description: 'The advanced translation management system built for the AI era. Secure, fast, and intelligent.',
            product: {
                title: 'Product',
                features: 'Features',
                integrations: 'Integrations',
                enterprise: 'Enterprise',
                security: 'Security'
            },
            company: {
                title: 'Company',
                about: 'About Us',
                careers: 'Careers',
                blog: 'Blog',
                legal: 'Legal'
            }
        },
        back_to_top: {
            basement_title: 'You\'ve reached the basement! 🏗️',
            basement_desc: 'Looks like you enjoyed the scroll, but this is rock bottom 😅.',
            basement_prompt: 'Want to take the elevator back up, or do you prefer the stairs?',
            elevator: 'Elevator (Fast)',
            stairs: 'Stairs (Slow)'
        }
    },
    ar: {
        dir: 'rtl',
        flag: '🇪🇬',
        name: 'العربية',
        nav: {
            features: 'المميزات',
            technology: 'التكنولوجيا',
            roadmap: 'خارطة الطريق',
            contact: 'تواصل معنا',
            access: 'الدخول للمنصة'
        },
        hero: {
            system_online: 'النظام يعمل v2.4 (مدعوم بالذكاء الاصطناعي)',
            title_prefix: 'نظام التشغيل لـ',
            title_gradient: 'وكالات الترجمة الحديثة',
            description: 'صمم خصيصاً لوكالات الترجمة لإدارة المشاريع والمترجمين والعملاء في منصة موحدة. توقف عن التشتت بين الأدوات وابدأ في تطوير وكالتك.',
            launch_demo: 'جرب النسخة التجريبية',
            explore_features: 'استكشف المميزات',
            stats: {
                enterprise: 'جاهز للمؤسسات',
                multi_lang: 'متعدد اللغات',
                ai_powered: 'مدعوم بالذكاء الاصطناعي'
            },
            badge: {
                label: 'زيادة الكفاءة',
                value: '+450%'
            }
        },
        features: {
            label: 'القوة والدقة',
            title_prefix: 'كل ما تحتاجه لـ',
            title_gradient: 'الإنجاز بشكل أسرع',
            items: {
                ai_nexus: { title: 'رابط الذكاء الاصطناعي', desc: 'تكامل متقدم مع الذكاء الاصطناعي يساعد في الترجمة، إنشاء المسارد، واقتراح التحسينات في الوقت الفعلي.' },
                chat_hub: { title: 'مركز المحادثة', desc: 'قنوات اتصال في الوقت الفعلي للفرق. شارك الملفات، ناقش السياق، وحافظ على التنسيق بين الجميع.' },
                smart_glossary: { title: 'المسرد الذكي', desc: 'تسليط الضوء على المصطلحات في المحرر حسب السياق. لن تفوت أي مصطلح محدد مرة أخرى.' },
                smart_deadlines: { title: 'المواعيد الذكية', desc: 'عد تنازلي ذكي يغير مرئيات الإلحاح بناءً على الوقت المتبقي.' },
                multi_lingual: { title: 'متعدد اللغات', desc: 'دعم لعدد غير محدود من أزواج اللغات مع التحقق الفوري وإعداد المشاريع.' },
                instant_qa: { title: 'فحص الجودة الفوري', desc: 'فحوصات جودة آلية وتتبع سهل للحالة من المسودة إلى التأكيد.' }
            }
        },
        stats: {
            words_processed: 'كلمات تمت معالجتها',
            active_projects: 'مشاريع نشطة',
            languages: 'لغات',
            uptime: 'وقت التشغيل'
        },
        workflow: {
            title: 'من الملف إلى',
            title_highlight: 'العالمية',
            steps: {
                upload: { title: 'رفع المشروع', desc: 'سحب وإفلات المستندات. ندعم PDF و DOCX والمزيد.' },
                ai: { title: 'تحليل الذكاء الاصطناعي', desc: 'محركنا يترجم مبدئياً ويحدد المسارد فوراً.' },
                review: { title: 'مراجعة الخبراء', desc: 'المترجمون المحترفون يصقلون القيود والفروق الدقيقة.' },
                delivery: { title: 'التسليم', desc: 'استلم ملفات مصقولة ومنسقة جاهزة للإطلاق العالمي.' }
            }
        },
        ai: {
            badge: 'مدعوم بـ',
            title_highlight: 'الذكاء الاصطناعي من الجيل التالي',
            desc: 'رابط الذكاء الاصطناعي لدينا ليس مجرد روبوت محادثة. إنه نواة تعلم عميق تفهم السياق والنبرة والفروق الدقيقة، مما يضاعف إنتاجية المترجم.',
            features: {
                multimodel: { title: 'نواة متعددة النماذج', desc: 'التبديل بسلاسة بين GPT-4 و Gemini Pro و Claude بناءً على تعقيد النص ونطاقه للحصول على أفضل النتائج.' },
                context: { title: 'الوعي بالسياق', desc: 'يتذكر الذكاء الاصطناعي قيود المشروع والمسارد وإرشادات النبرة، مما يضمن الاتساق عبر آلاف المقاطع.' },
                assistant: { title: 'مساعد في الوقت الفعلي', desc: 'يمكن للمترجمين الدردشة مع المستند. "كيف أصيغ هذا بشكل أكثر ودية؟" أو "لخص هذه الفقرة" مباشرة في المحرر.' }
            }
        },
        roadmap: {
            weekly_updates: 'تحديثات أسبوعية',
            title_prefix: 'بناء',
            title_highlight: 'النظام البيئي النهائي',
            desc: 'LinguaFlow ليس ثابتاً. نحن ندفع الكود كل أسبوع. نحن نتطور من أداة ترجمة إلى',
            desc_highlight: ' نظام إدارة وكالات متكامل',
            desc_suffix: '.',
            items: {
                hr: { title: 'الموارد البشرية والمواهب', desc: 'كشوف المرتبات الآلية، تتبع الأداء، وخطوط التوظيف للغويين لديك.', status: 'قريباً' },
                erp: { title: 'تخطيط موارد الوكالة (ERP)', desc: 'تخطيط موارد كامل، إدارة الأصول، والتنبؤ المالي المتكامل مباشرة في سير العمل الخاص بك.', status: 'في التطوير' },
                crm: { title: 'إدارة علاقات عملاء متقدمة (CRM)', desc: 'رؤى عميقة للعملاء، خطوط المبيعات، والاقتباس الآلي لتنمية علاقات B2B الخاصة بك.', status: 'مخطط له' }
            }
        },
        vision: {
            title: 'رؤيتنا: نظام تشغيل الوكالة',
            desc: 'تخيل عالماً حيث تكون أنظمة PMS و HR و CRM وأداة CAT كائناً واحداً ذكياً. هذا هو المكان الذي نتجه إليه.',
            join_us: 'انضم إلينا في الرحلة.'
        },
        cto: {
            meet: 'قابل',
            architect: 'المهندس المعماري',
            role: 'المدير التقني والمهندس الرئيسي',
            quote: '"أنشأنا LinguaFlow لسد الفجوة بين الإبداع البشري والذكاء الاصطناعي. مهمتنا هي تمكين المطورين والمترجمين بأدوات تبدو وكأنها قوى خارقة."',
            social: { linkedin: 'لينكد إن', whatsapp: 'واتساب', email: 'البريد الإلكتروني', call: 'اتصال' }
        },
        faq: {
            title: 'أسئلة',
            title_highlight: 'شائعة',
            questions: {
                ai_help: { q: 'كيف يساعد مساعد الذكاء الاصطناعي المترجمين؟', a: 'يحلل رابط الذكاء الاصطناعي النص المصدري لتقديم اقتراحات في الوقت الفعلي، وفحوصات نحوية، واتساق المصطلحات، ويعمل بفعالية كمساعد طيار يسرع العملية بنسبة تصل إلى 50٪.' },
                multiple_projects: { q: 'هل يمكنني إدارة مشاريع متعددة في وقت واحد؟', a: 'بالتأكيد. تم تصميم لوحة تحكم المسؤول للقياس، مما يتيح لك تتبع عدد غير محدود من المشاريع، وتعيين الموارد، ومراقبة المواعيد النهائية من نظرة عامة واحدة.' },
                security: { q: 'هل بياناتي آمنة؟', a: 'الأمان أمر بالغ الأهمية. نستخدم تشفيراً من الدرجة المؤسسية لجميع البيانات أثناء النقل وفي السكون، مع التحكم في الوصول القائم على الأدوار لضمان أن الموظفين المصرح لهم فقط يمكنهم عرض المستندات الحساسة.' },
                clients: { q: 'كيف أقوم بدعوة العملاء؟', a: 'يمكن للمسؤولين إنشاء حسابات عملاء وتعيينهم لمشاريع محددة. يحصل العملاء على عرض مقيد وشفاف حيث يمكنهم الموافقة على التسليمات والدردشة مع الفريق.' }
            }
        },
        engineering: {
            badge: 'التمييز الهندسي',
            title: 'مبني على أسس',
            title_highlight: 'راسخة',
            desc: 'لم نقم فقط ببناء أداة ترجمة؛ لقد صممنا نظاماً موزعاً قوياً مصمماً لموثوقية 99.99٪ وقابلية توسع سلسة.',
            principles: {
                microservices: { title: 'هندسة الخدمات المصغرة', desc: 'تضمن الخدمات المنفصلة أن فشل وحدة واحدة لا يؤدي أبداً إلى توقف النظام بأكمله.' },
                performance: { title: 'أداء عالي', desc: 'محسن عبر التخزين المؤقت Redis وفهرسة قاعدة البيانات لأوقات استجابة سريعة جداً.' },
                security: { title: 'أمان المؤسسات', desc: 'RBAC، تشفير AES-256، والمدخلات المعقمة تحمي بياناتك في كل طبقة.' },
                scalability: { title: 'قابلية توسع لا نهائية', desc: 'مبني على واجهة خلفية عديمة الحالة تتوسع أفقياً للتعامل مع ملايين الطلبات.' }
            }
        },
        roles: {
            title_prefix: 'مصمم لـ',
            title_highlight: 'كل دور',
            desc: 'منصة موحدة تتكيف مع احتياجاتك، سواء كنت تدير النظام، أو تترجم المحتوى، أو تطلب العمل.',
            types: {
                admin: {
                    label: 'للمشرفين',
                    title: 'مركز القيادة الشامل',
                    desc: 'أدر المستخدمين، المشاريع، وحالة النظام من لوحة تحكم واحدة قوية.',
                    features_list: ['نظرة عامة عالمية', 'إدارة المستخدمين', 'إعدادات النظام', 'تحليلات مفصلة']
                },
                translator: {
                    label: 'للمترجمين',
                    title: 'بيئة عمل خالية من التشتت',
                    desc: 'مساحة عمل مخصصة مع قاموس مدمج، أدوات ذكاء اصطناعي، وتتبع التقدم.',
                    features_list: ['محرر ذكي', 'إبراز المصطلحات', 'مساعد ذكي', 'مقارنة آنية']
                },
                client: {
                    label: 'للعملاء',
                    title: 'تقدم شفاف',
                    desc: 'تتبع مشاريعك في الوقت الفعلي، تواصل مع الفريق، وأدر التسليمات.',
                    features_list: ['معالج المشاريع', 'حالة مباشرة', 'دردشة مباشرة', 'تقدير التكلفة']
                }
            },
            explore: 'استكشف'
        },
        tooltips: {
            whatsapp: 'تواصل عبر واتساب',
            linkedin: 'تواصل عبر لينكد إن',
            email: 'راسلنا عبر البريد',
            call: 'اتصل بنا'
        },
        cta: {
            title: 'جاهز لتحويل سير عملك؟',
            desc: 'انضم إلى آلاف المترجمين والوكالات التي انتقلت إلى نظام التشغيل الحديث للترجمة.',
            button: 'الوصول للمنصة'
        },
        footer: {
            rights: 'جميع الحقوق محفوظة.',
            developed_by: 'تطوير',
            description: 'نظام إدارة الترجمة المتقدم المبني لعصر الذكاء الاصطناعي. آمن، سريع، وذكـي.',
            product: {
                title: 'المنتج',
                features: 'المميزات',
                integrations: 'التكاملات',
                enterprise: 'للمؤسسات',
                security: 'الأمان'
            },
            company: {
                title: 'الشركة',
                about: 'عنا',
                careers: 'وظائف',
                blog: 'المدونة',
                legal: 'قانوني'
            }
        },
        back_to_top: {
            basement_title: 'لقد وصلت إلى القبو! 🏗️',
            basement_desc: 'يبدو أنك استمتعت بالتمرير، لكن هذا هو القاع 😅.',
            basement_prompt: 'هل تريد أن تأخذ المصعد للعودة للأعلى، أم تفضل الدرج؟',
            elevator: 'المصعد (سريع)',
            stairs: 'الدرج (بطيء)'
        }
    },
    fr: {
        dir: 'ltr',
        flag: '🇫🇷',
        name: 'Français',
        nav: {
            features: 'Fonctionnalités',
            technology: 'Technologie',
            roadmap: 'Feuille de route',
            contact: 'Contact',
            access: 'Accéder à la plateforme'
        },
        hero: {
            system_online: 'Système en ligne v2.4 (IA activée)',
            title_prefix: 'L\'OS pour',
            title_gradient: 'Agences de traduction modernes',
            description: 'Conçu spécifiquement pour les LSP afin de gérer les projets, les traducteurs et les clients sur une plateforme unifiée. Arrêtez de jongler avec les outils et commencez à développer votre agence.',
            launch_demo: 'Lancer la démo',
            explore_features: 'Explorer les fonctionnalités',
            stats: {
                enterprise: 'Prêt pour l\'entreprise',
                multi_lang: 'Multilingue',
                ai_powered: 'Propulsé par l\'IA'
            },
            badge: {
                label: 'Gain d\'efficacité',
                value: '+450%'
            }
        },
        features: {
            label: 'Puissance & Précision',
            title_prefix: 'Tout ce dont vous avez besoin pour',
            title_gradient: 'Expédier Plus Vite',
            items: {
                ai_nexus: { title: 'Nexus IA', desc: 'Intégration avancée de l\'IA qui aide à la traduction, génère des glossaires et suggère des améliorations en temps réel.' },
                chat_hub: { title: 'Hub de Discussion', desc: 'Canaux de communication en temps réel pour les équipes. Partagez des fichiers, discutez du contexte et gardez tout le monde aligné.' },
                smart_glossary: { title: 'Glossaire Intelligent', desc: 'Mise en évidence contextuelle du glossaire dans l\'éditeur. Ne manquez plus jamais un terme défini.' },
                smart_deadlines: { title: 'Échéances Intelligentes', desc: 'Comptes à rebours intelligents qui adaptent leurs visuels d\'urgence en fonction du temps restant.' },
                multi_lingual: { title: 'Multi-Lingue', desc: 'Prise en charge de paires de langues illimitées avec validation instantanée et configuration de projet.' },
                instant_qa: { title: 'QA Instantané', desc: 'Contrôles de qualité automatisés et suivi facile du statut, du brouillon à la confirmation.' }
            }
        },
        stats: {
            words_processed: 'Mots Traités',
            active_projects: 'Projets Actifs',
            languages: 'Langues',
            uptime: 'Disponibilité'
        },
        workflow: {
            title: 'Du Fichier au',
            title_highlight: 'Global',
            steps: {
                upload: { title: 'Télécharger', desc: 'Glisser-déposer des documents. Nous prenons en charge PDF, DOCX, et plus.' },
                ai: { title: 'Analyse IA', desc: 'Notre moteur pré-traduit et identifie les glossaires instantanément.' },
                review: { title: 'Revue Experte', desc: 'Les traducteurs professionnels affinent les contraintes et les nuances.' },
                delivery: { title: 'Livraison', desc: 'Recevez des fichiers polis et formatés prêts pour le lancement mondial.' }
            }
        },
        ai: {
            badge: 'Propulsé par',
            title_highlight: 'IA de Nouvelle Génération',
            desc: 'Notre Nexus IA n\'est pas juste un chatbot. C\'est un noyau d\'apprentissage profond qui comprend le contexte, le ton et la nuance, doublant efficacement la productivité des traducteurs.',
            features: {
                multimodel: { title: 'Noyau Multi-Modèle', desc: 'Bascule de manière transparente entre GPT-4, Gemini Pro et Claude en fonction de la complexité et du domaine du texte pour des résultats optimaux.' },
                context: { title: 'Conscience du Contexte', desc: 'L\'IA se souvient des contraintes du projet, des glossaires et des directives de ton, assurant la cohérence sur des milliers de segments.' },
                assistant: { title: 'Assistant Temps Réel', desc: 'Les traducteurs peuvent discuter avec le document. "Comment formuler cela plus amicalement ?" ou "Résumez ce paragraphe" directement dans l\'éditeur.' }
            }
        },
        roadmap: {
            weekly_updates: 'MISES À JOUR HEBDOMADAIRES',
            title_prefix: 'Construction de',
            title_highlight: 'l\'Écosystème Ultime',
            desc: 'LinguaFlow n\'est pas statique. Nous poussons du code chaque semaine. Nous évoluons d\'un outil de traduction vers une',
            desc_highlight: ' suite complète de gestion d\'agence',
            desc_suffix: '.',
            items: {
                hr: { title: 'RH & Talents', desc: 'Paie automatisée, suivi des performances et pipelines de recrutement pour vos linguistes.', status: 'Bientôt' },
                erp: { title: 'ERP d\'Agence', desc: 'Planification complète des ressources, gestion des actifs et prévisions financières intégrées directement dans votre flux de travail.', status: 'En Développement' },
                crm: { title: 'CRM Avancé', desc: 'Informations client approfondies, pipelines de vente et devis automatisés pour développer vos relations B2B.', status: 'Prévu' }
            }
        },
        vision: {
            title: 'Notre Vision : L\'OS d\'Agence',
            desc: 'Imaginez un monde où votre PMS, RH, CRM et outil TAO sont un seul organisme intelligent. C\'est là que nous allons.',
            join_us: 'Rejoignez-nous dans l\'aventure.'
        },
        cto: {
            meet: 'Rencontrez',
            architect: 'l\'Architecte',
            role: 'CTO & Ingénieur Principal',
            quote: '"Nous avons créé LinguaFlow pour combler le fossé entre la créativité humaine et l\'intelligence artificielle. Notre mission est de donner aux développeurs et aux traducteurs des outils qui ressemblent à des super-pouvoirs."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'Email', call: 'Appeler' }
        },
        faq: {
            title: 'Questions',
            title_highlight: 'Fréquentes',
            questions: {
                ai_help: { q: 'Comment l\'assistant IA aide-t-il les traducteurs ?', a: 'Notre Nexus IA analyse le texte source pour fournir des suggestions en temps réel, des vérifications grammaticales et une cohérence terminologique, agissant efficacement comme un copilote qui accélère le processus jusqu\'à 50%.' },
                multiple_projects: { q: 'Puis-je gérer plusieurs projets simultanément ?', a: 'Absolument. Le tableau de bord Admin est conçu pour l\'échelle, vous permettant de suivre un nombre illimité de projets, d\'allouer des ressources et de surveiller les délais d\'une vue d\'ensemble unique.' },
                security: { q: 'Mes données sont-elles sécurisées ?', a: 'La sécurité est primordiale. Nous utilisons un cryptage de niveau entreprise pour toutes les données en transit et au repos, avec un contrôle d\'accès basé sur les rôles garantissant que seul le personnel autorisé peut voir les documents sensibles.' },
                clients: { q: 'Comment inviter des clients ?', a: 'Les administrateurs peuvent créer des comptes clients et les affecter à des projets spécifiques. Les clients obtiennent une vue restreinte et transparente où ils peuvent approuver les livrables et discuter avec l\'équipe.' }
            }
        },
        engineering: {
            badge: 'EXCELLENCE EN INGÉNIERIE',
            title: 'Bâti sur des Principes',
            title_highlight: 'Solides',
            desc: 'Nous n\'avons pas seulement construit un outil de traduction ; nous avons conçu un système distribué robuste conçu pour une fiabilité de 99,99% et une évolutivité sans faille.',
            principles: {
                microservices: { title: 'Architecture Microservices', desc: 'Les services découplés garantissent qu\'une défaillance dans un module ne fait jamais tomber tout le système.' },
                performance: { title: 'Haute Performance', desc: 'Optimisé via la mise en cache Redis et l\'indexation de base de données pour des temps de réponse inférieurs à la milliseconde.' },
                security: { title: 'Sécurité d\'Entreprise', desc: 'RBAC, cryptage AES-256 et entrées aseptisées protègent vos données à chaque couche.' },
                scalability: { title: 'Évolutivité Infinie', desc: 'Bâti sur un backend sans état qui s\'adapte horizontalement pour gérer des millions de requêtes.' }
            }
        },
        roles: {
            title_prefix: 'Conçu pour',
            title_highlight: 'Chaque Rôle',
            desc: 'Une plateforme unifiée qui s\'adapte à vos besoins, que vous gériez le système, traduisiez du contenu ou demandiez du travail.',
            types: {
                admin: {
                    label: 'Pour les Admins',
                    title: 'Centre de Commande Total',
                    desc: 'Gérez les utilisateurs, les projets et la santé du système depuis un tableau de bord unique et puissant.',
                    features_list: ['Vue d\'overview', 'Gestion Utilisateurs', 'Config Système', 'Analyses Détaillées']
                },
                translator: {
                    label: 'Pour les Traducteurs',
                    title: 'Plan de Travail Sans Distraction',
                    desc: 'Un espace de travail dédié avec glossaire intégré, outils IA et suivi des progrès.',
                    features_list: ['Éditeur Intelligent', 'Glossaire', 'Assistant IA', 'Diff Temps Réel']
                },
                client: {
                    label: 'Pour les Clients',
                    title: 'Progrès Transparent',
                    desc: 'Suivez vos projets en temps réel, communiquez avec l\'équipe et gérez les livrables.',
                    features_list: ['Assistant Projet', 'Statut en Direct', 'Chat Direct', 'Est. Coût']
                }
            },
            explore: 'Explorer'
        },
        tooltips: {
            whatsapp: 'Contactez sur WhatsApp',
            linkedin: 'Connectez sur LinkedIn',
            email: 'Envoyez-nous un email',
            call: 'Appelez-nous'
        },
        cta: {
            title: 'Prêt à transformer votre flux de travail ?',
            desc: 'Rejoignez des milliers de traducteurs et d\'agences qui sont passés au système d\'exploitation moderne pour la localisation.',
            button: 'Accéder à la plateforme'
        },
        footer: {
            rights: 'Tous droits réservés.',
            developed_by: 'Développé par',
            description: 'Le système de gestion de traduction avancé conçu pour l\'ère de l\'IA. Sécurisé, rapide et intelligent.',
            product: {
                title: 'Produit',
                features: 'Fonctionnalités',
                integrations: 'Intégrations',
                enterprise: 'Entreprise',
                security: 'Sécurité'
            },
            company: {
                title: 'Entreprise',
                about: 'À propos',
                careers: 'Carrières',
                blog: 'Blog',
                legal: 'Légal'
            }
        },
        back_to_top: {
            basement_title: 'Vous avez atteint le sous-sol ! 🏗️',
            basement_desc: 'On dirait que vous avez apprécié le défilement, mais c\'est le fond du gouffre 😅.',
            basement_prompt: 'Voulez-vous reprendre l\'ascenseur, ou préférez-vous l\'escalier?',
            elevator: 'Ascenseur (Rapide)',
            stairs: 'Escalier (Lent)'
        }
    },
    de: {
        dir: 'ltr',
        flag: '🇩🇪',
        name: 'Deutsch',
        nav: {
            features: 'Funktionen',
            technology: 'Technologie',
            roadmap: 'Roadmap',
            contact: 'Kontakt',
            access: 'Plattform zugreifen'
        },
        hero: {
            system_online: 'System Online v2.4 (KI-aktiviert)',
            title_prefix: 'Das Betriebssystem für',
            title_gradient: 'Moderne Übersetzungsagenturen',
            description: 'Speziell für LSPs entwickelt, um Projekte, Übersetzer und Kunden auf einer einheitlichen Plattform zu verwalten. Hören Sie auf, mit Tools zu jonglieren, und skalieren Sie Ihre Agentur.',
            launch_demo: 'Demo starten',
            explore_features: 'Funktionen erkunden',
            stats: {
                enterprise: 'Bereit für Unternehmen',
                multi_lang: 'Mehrsprachig',
                ai_powered: 'KI-betrieben'
            },
            badge: {
                label: 'Effizienzsteigerung',
                value: '+450%'
            }
        },
        features: {
            label: 'Leistung & Präzision',
            title_prefix: 'Alles was Sie brauchen um',
            title_gradient: 'Schneller zu Liefern',
            items: {
                ai_nexus: { title: 'KI Nexus', desc: 'Erweiterte KI-Integration, die bei der Übersetzung hilft, Glossare erstellt und Verbesserungen in Echtzeit vorschlägt.' },
                chat_hub: { title: 'Chat Hub', desc: 'Echtzeit-Kommunikationskanäle für Teams. Dateien teilen, Kontext diskutieren und alle auf dem gleichen Stand halten.' },
                smart_glossary: { title: 'Intelligentes Glossar', desc: 'Kontextbezogene Hervorhebung im Editor. Verpassen Sie nie wieder einen definierten Begriff.' },
                smart_deadlines: { title: 'Intelligente Fristen', desc: 'Intelligente Countdowns, die ihre Dringlichkeitsvisualisierung basierend auf der verbleibenden Zeit anpassen.' },
                multi_lingual: { title: 'Mehrsprachig', desc: 'Unterstützung für unbegrenzte Sprachpaare mit sofortiger Validierung und Projekteinrichtung.' },
                instant_qa: { title: 'Sofortige QA', desc: 'Automatisierte Qualitätsprüfungen und einfache Statusverfolgung vom Entwurf bis zur Bestätigung.' }
            }
        },
        stats: {
            words_processed: 'Verarbeitete Wörter',
            active_projects: 'Aktive Projekte',
            languages: 'Sprachen',
            uptime: 'Betriebszeit'
        },
        workflow: {
            title: 'Von Datei zu',
            title_highlight: 'Global',
            steps: {
                upload: { title: 'Projekt Hochladen', desc: 'Dokumente per Drag & Drop. Wir unterstützen PDF, DOCX und mehr.' },
                ai: { title: 'KI-Analyse', desc: 'Unsere Engine übersetzt vor und identifiziert Glossare sofort.' },
                review: { title: 'Expertenprüfung', desc: 'Professionelle Übersetzer verfeinern Einschränkungen und Nuancen.' },
                delivery: { title: 'Lieferung', desc: 'Erhalten Sie ausgefeilte, formatierte Dateien, bereit für den globalen Start.' }
            }
        },
        ai: {
            badge: 'Angetrieben von',
            title_highlight: 'KI der nächsten Generation',
            desc: 'Unser KI Nexus ist nicht nur ein Chatbot. Es ist ein Deep-Learning-Kern, der Kontext, Ton und Nuancen versteht und die Produktivität der Übersetzer effektiv verdoppelt.',
            features: {
                multimodel: { title: 'Multi-Modell-Kern', desc: 'Wechselt nahtlos zwischen GPT-4, Gemini Pro und Claude basierend auf der Komplexität und dem Bereich des Textes für optimale Ergebnisse.' },
                context: { title: 'Kontextbewusstsein', desc: 'Die KI merkt sich Projekteinschränkungen, Glossare und Tonrichtlinien und gewährleistet Konsistenz über Tausende von Segmenten hinweg.' },
                assistant: { title: 'Echtzeit-Assistent', desc: 'Übersetzer können mit dem Dokument chatten. "Wie drücke ich das freundlicher aus?" oder "Fassen Sie diesen Absatz zusammen" direkt im Editor.' }
            }
        },
        roadmap: {
            weekly_updates: 'WÖCHENTLICHE UPDATE',
            title_prefix: 'Bau des',
            title_highlight: 'Ultimativen Ökosystems',
            desc: 'LinguaFlow ist nicht statisch. Wir pushen jede Woche Code. Wir entwickeln uns von einem Übersetzungstool zu einer',
            desc_highlight: ' umfassenden Agentur-Management-Suite',
            desc_suffix: '.',
            items: {
                hr: { title: 'Personal & Talent', desc: 'Automatisierte Gehaltsabrechnung, Leistungsverfolgung und Rekrutierungspipelines für Ihre Linguisten.', status: 'Demnächst' },
                erp: { title: 'Agentur-ERP', desc: 'Vollständige Ressourcenplanung, Anlagenverwaltung und Finanzprognosen direkt in Ihren Workflow integriert.', status: 'In Entwicklung' },
                crm: { title: 'Erweitertes CRM', desc: 'Tiefe Kundeneinblicke, Vertriebspipelines und automatisierte Angebote zum Ausbau Ihrer B2B-Beziehungen.', status: 'Geplant' }
            }
        },
        vision: {
            title: 'Unsere Vision: Das Agentur-Betriebssystem',
            desc: 'Stellen Sie sich eine Welt vor, in der Ihr PMS, HR, CRM und CAT-Tool ein einziger, intelligenter Organismus sind. Dort gehen wir hin.',
            join_us: 'Begleiten Sie uns auf der Reise.'
        },
        cto: {
            meet: 'Treffen Sie den',
            architect: 'Architekten',
            role: 'CTO & leitender Ingenieur',
            quote: '"Wir haben LinguaFlow gebaut, um die Lücke zwischen menschlicher Kreativität und künstlicher Intelligenz zu schließen. Unsere Mission ist es, Entwicklern und Übersetzern Werkzeuge an die Hand zu geben, die sich wie Superkräfte anfühlen."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'E-Mail', call: 'Anrufen' }
        },
        faq: {
            title: 'Häufige',
            title_highlight: 'Fragen',
            questions: {
                ai_help: { q: 'Wie hilft der KI-Assistent Übersetzern?', a: 'Unser KI Nexus analysiert den Quelltext, um Echtzeit-Vorschläge, Grammatikprüfungen und Terminologiekonsistenz bereitzustellen, und fungiert effektiv als Co-Pilot, der den Prozess um bis zu 50% beschleunigt.' },
                multiple_projects: { q: 'Kann ich mehrere Projekte gleichzeitig verwalten?', a: 'Absolut. Das Admin-Dashboard ist auf Skalierung ausgelegt und ermöglicht es Ihnen, unbegrenzte Projekte zu verfolgen, Ressourcen zuzuweisen und Fristen aus einer einzigen Vogelperspektive zu überwachen.' },
                security: { q: 'Sind meine Daten sicher?', a: 'Sicherheit steht an oberster Stelle. Wir verwenden Verschlüsselung auf Unternehmensebene für alle Daten während der Übertragung und im Ruhezustand, wobei rollenbasierte Zugriffskontrolle sicherstellt, dass nur autorisiertes Personal sensible Dokumente einsehen kann.' },
                clients: { q: 'Wie lade ich Kunden ein?', a: 'Administratoren können Kundenkonten erstellen und sie bestimmten Projekten zuweisen. Kunden erhalten eine eingeschränkte, transparente Ansicht, in der sie Ergebnisse genehmigen und mit dem Team chatten können.' }
            }
        },
        engineering: {
            badge: 'INGENIEURSKUNST',
            title: 'Auf soliden',
            title_highlight: 'Grundprinzipien gebaut',
            desc: 'Wir haben nicht nur ein Übersetzungstool gebaut; wir haben ein robustes verteiltes System entwickelt, das für 99,99% Zuverlässigkeit und nahtlose Skalierbarkeit ausgelegt ist.',
            principles: {
                microservices: { title: 'Microservices-Architektur', desc: 'Entkoppelte Dienste stellen sicher, dass ein Fehler in einem Modul niemals das gesamte System zum Absturz bringt.' },
                performance: { title: 'Hohe Leistung', desc: 'Optimiert durch Redis-Caching und Datenbankindizierung für Antwortzeiten im Sub-Millisekundenbereich.' },
                security: { title: 'Unternehmenssicherheit', desc: 'RBAC, AES-256-Verschlüsselung und bereinigte Eingaben schützen Ihre Daten auf jeder Ebene.' },
                scalability: { title: 'Unendliche Skalierbarkeit', desc: 'Aufgebaut auf einem zustandslosen Backend, das horizontal skaliert, um Millionen von Anfragen zu verarbeiten.' }
            }
        },
        roles: {
            title_prefix: 'Gebaut für',
            title_highlight: 'Jede Rolle',
            desc: 'Eine einheitliche Plattform, die sich Ihren Bedürfnissen anpasst, egal ob Sie das System verwalten, Inhalte übersetzen oder Arbeit anfordern.',
            types: {
                admin: {
                    label: 'Für Administratoren',
                    title: 'Totales Befehlszentrum',
                    desc: 'Verwalten Sie Benutzer, Projekte und den Systemzustand von einem einzigen, leistungsstarken Dashboard aus.',
                    features_list: ['Gesamtübersicht', 'Benutzerverwaltung', 'Systemkonfig', 'Detaillierte Analysen']
                },
                translator: {
                    label: 'Für Übersetzer',
                    title: 'Ablenkungsfreie Arbeitsbank',
                    desc: 'Ein dedizierter Arbeitsbereich mit integriertem Glossar, KI-Tools und Fortschrittsverfolgung.',
                    features_list: ['Intelligenter Editor', 'Glossar-Highlights', 'KI-Assistent', 'Echtzeit-Diff']
                },
                client: {
                    label: 'Für Kunden',
                    title: 'Transparenter Fortschritt',
                    desc: 'Verfolgen Sie Ihre Projekte in Echtzeit, kommunizieren Sie mit dem Team und verwalten Sie Ergebnisse.',
                    features_list: ['Projekt-Assistent', 'Live-Status', 'Direkt-Chat', 'Kostenschätzung']
                }
            },
            explore: 'Erkunden'
        },
        tooltips: {
            whatsapp: 'Kontakt über WhatsApp',
            linkedin: 'Verbinden über LinkedIn',
            email: 'Email uns',
            call: 'Ruf uns an'
        },
        cta: {
            title: 'Bereit, Ihren Workflow zu transformieren?',
            desc: 'Schließen Sie sich Tausenden von Übersetzern und Agenturen an, die auf das moderne Betriebssystem für die Lokalisierung umgestiegen sind.',
            button: 'Plattform aufrufen'
        },
        footer: {
            rights: 'Alle Rechte vorbehalten.',
            developed_by: 'Entwickelt von',
            description: 'Das fortschrittliche Übersetzungsmanagementsystem für das KI-Zeitalter. Sicher, schnell und intelligent.',
            product: {
                title: 'Produkt',
                features: 'Funktionen',
                integrations: 'Integrationen',
                enterprise: 'Unternehmen',
                security: 'Sicherheit'
            },
            company: {
                title: 'Unternehmen',
                about: 'Über uns',
                careers: 'Karriere',
                blog: 'Blog',
                legal: 'Rechtliches'
            }
        },
        back_to_top: {
            basement_title: 'Sie haben den Keller erreicht! 🏗️',
            basement_desc: 'Scheint, als hätten Sie das Scrollen genossen, aber das ist der tiefste Punkt 😅.',
            basement_prompt: 'Wollen Sie den Aufzug nach oben nehmen oder bevorzugen Sie die Treppe?',
            elevator: 'Aufzug (Schnell)',
            stairs: 'Treppe (Langsam)'
        }
    },
    es: {
        dir: 'ltr',
        flag: '🇪🇸',
        name: 'Español',
        nav: {
            features: 'Características',
            technology: 'Tecnología',
            roadmap: 'Hoja de ruta',
            contact: 'Contacto',
            access: 'Acceder a la plataforma'
        },
        hero: {
            system_online: 'Sistema en línea v2.4 (Habilitado para IA)',
            title_prefix: 'El sistema operativo para',
            title_gradient: 'Agencias de Traducción Modernas',
            description: 'Creado específicamente para LSPs para gestionar proyectos, traductores y clientes en una plataforma unificada. Deje de hacer malabares con las herramientas y comience a escalar su agencia.',
            launch_demo: 'Lanzar demostración',
            explore_features: 'Explorar características',
            stats: {
                enterprise: 'Listo para empresas',
                multi_lang: 'Multilingüe',
                ai_powered: 'Impulsado por IA'
            },
            badge: {
                label: 'Aumento de eficiencia',
                value: '+450%'
            }
        },
        features: {
            label: 'Poder y Precisión',
            title_prefix: 'Todo lo que necesitas para',
            title_gradient: 'Entregar más rápido',
            items: {
                ai_nexus: { title: 'AI Nexus', desc: 'Integración avanzada de IA que asiste con la traducción, genera glosarios y sugiere mejoras en tiempo real.' },
                chat_hub: { title: 'Chat Hub', desc: 'Canales de comunicación en tiempo real para equipos. Comparta archivos, discuta el contexto y mantenga a todos alineados.' },
                smart_glossary: { title: 'Glosario Inteligente', desc: 'Resaltado de glosario consciente del contexto en el editor. Nunca más se pierda un término definido.' },
                smart_deadlines: { title: 'Plazos Inteligentes', desc: 'Cuentas regresivas inteligentes que adaptan sus visuales de urgencia según el tiempo restante.' },
                multi_lingual: { title: 'Multilingüe', desc: 'Soporte para pares de idiomas ilimitados con validación instantánea y configuración de proyectos.' },
                instant_qa: { title: 'QA Instantáneo', desc: 'Verificaciones de calidad automatizadas y seguimiento de estado fácil de Borrador a Confirmado.' }
            }
        },
        stats: {
            words_processed: 'Palabras Procesadas',
            active_projects: 'Proyectos Activos',
            languages: 'Idiomas',
            uptime: 'Tiempo de actividad'
        },
        workflow: {
            title: 'Del archivo a',
            title_highlight: 'Global',
            steps: {
                upload: { title: 'Subir Proyecto', desc: 'Arrastrar y soltar documentos. Soportamos PDF, DOCX y más.' },
                ai: { title: 'Análisis de IA', desc: 'Nuestro motor pretraduce e identifica glosarios al instante.' },
                review: { title: 'Revisión de Expertos', desc: 'Los traductores profesionales refinan las restricciones y los matices.' },
                delivery: { title: 'Entrega', desc: 'Reciba archivos pulidos y formateados listos para el lanzamiento global.' }
            }
        },
        ai: {
            badge: 'Impulsado por',
            title_highlight: 'IA de Próxima Generación',
            desc: 'Nuestro AI Nexus no es solo un chatbot. Es un núcleo de aprendizaje profundo que entiende el contexto, el tono y los matices, duplicando efectivamente la productividad del traductor.',
            features: {
                multimodel: { title: 'Núcleo Multimodelo', desc: 'Cambia sin problemas entre GPT-4, Gemini Pro y Claude según la complejidad y el dominio del texto para obtener resultados óptimos.' },
                context: { title: 'Consciente del Contexto', desc: 'La IA recuerda las restricciones del proyecto, los glosarios y las pautas de tono, asegurando la consistencia en miles de segmentos.' },
                assistant: { title: 'Asistente en Tiempo Real', desc: 'Los traductores pueden chatear con el documento. "¿Cómo fraseo esto más amigable?" o "Resume este párrafo" directamente en el editor.' }
            }
        },
        roadmap: {
            weekly_updates: 'ACTUALIZACIONES SEMANALES',
            title_prefix: 'Construyendo el',
            title_highlight: 'Ecosistema Definitivo',
            desc: 'LinguaFlow no es estático. Empujamos código cada semana. Estamos evolucionando de una herramienta de traducción a una',
            desc_highlight: ' suite completa de gestión de agencias',
            desc_suffix: '.',
            items: {
                hr: { title: 'RRHH y Talento', desc: 'Nómina automatizada, seguimiento del rendimiento y canalizaciones de reclutamiento para sus lingüistas.', status: 'Próximamente' },
                erp: { title: 'ERP de Agencia', desc: 'Planificación completa de recursos, gestión de activos y previsión financiera integrada directamente en su flujo de trabajo.', status: 'En Desarrollo' },
                crm: { title: 'CRM Avanzado', desc: 'Información profunda del cliente, canalizaciones de ventas y cotizaciones automatizadas para hacer crecer sus relaciones B2B.', status: 'Planificado' }
            }
        },
        vision: {
            title: 'Nuestra Visión: El SO de la Agencia',
            desc: 'Imagine un mundo donde su PMS, RRHH, CRM y herramienta CAT son un solo organismo inteligente. Ahí es donde vamos.',
            join_us: 'Únase a nosotros en el viaje.'
        },
        cto: {
            meet: 'Conoce al',
            architect: 'Arquitecto',
            role: 'CTO e Ingeniero Principal',
            quote: '"Construimos LinguaFlow para cerrar la brecha entre la creatividad humana y la inteligencia artificial. Nuestra misión es empoderar a los desarrolladores y traductores con herramientas que se sientan como superpoderes."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'Correo', call: 'Llamar' }
        },
        faq: {
            title: 'Preguntas',
            title_highlight: 'Frecuentes',
            questions: {
                ai_help: { q: '¿Cómo ayuda el asistente de IA a los traductores?', a: 'Nuestro AI Nexus analiza el texto fuente para proporcionar sugerencias en tiempo real, correcciones gramaticales y consistencia terminológica, actuando efectivamente como un copiloto que acelera el proceso hasta en un 50%.' },
                multiple_projects: { q: '¿Puedo gestionar múltiples proyectos simultáneamente?', a: 'Absolutamente. El Panel de Administración está diseñado para escalar, permitiéndole rastrear proyectos ilimitados, asignar recursos y monitorear plazos desde una sola vista panorámica.' },
                security: { q: '¿Están seguros mis datos?', a: 'La seguridad es primordial. Utilizamos cifrado de grado empresarial para todos los datos en tránsito y en reposo, con control de acceso basado en roles que garantiza que solo el personal autorizado pueda ver documentos confidenciales.' },
                clients: { q: '¿Cómo invito a clientes?', a: 'Los administradores pueden crear cuentas de clientes y asignarlos a proyectos específicos. Los clientes obtienen una vista restringida y transparente donde pueden aprobar entregables y chatear con el equipo.' }
            }
        },
        engineering: {
            badge: 'EXCELENCIA EN INGENIERÍA',
            title: 'Construido sobre',
            title_highlight: 'Principios Sólidos',
            desc: 'No solo construimos una herramienta de traducción; diseñamos un sistema distribuido robusto diseñado para una confiabilidad del 99.99% y una escalabilidad perfecta.',
            principles: {
                microservices: { title: 'Arquitectura de Microservicios', desc: 'Los servicios desacoplados aseguran que una falla en un módulo nunca derribe todo el sistema.' },
                performance: { title: 'Alto Rendimiento', desc: 'Optimizado a través de almacenamiento en caché de Redis e indexación de bases de datos para tiempos de respuesta de submilisegundos.' },
                security: { title: 'Seguridad Empresarial', desc: 'RBAC, cifrado AES-256 y entradas saneadas protegen sus datos en cada capa.' },
                scalability: { title: 'Escalabilidad Infinita', desc: 'Construido sobre un backend sin estado que escala horizontalmente para manejar millones de solicitudes.' }
            }
        },
        roles: {
            title_prefix: 'Construido para',
            title_highlight: 'Cada Rol',
            desc: 'Una plataforma unificada que se adapta a sus necesidades, ya sea que esté gestionando el sistema, traduciendo contenido o solicitando trabajo.',
            types: {
                admin: {
                    label: 'Para Administradores',
                    title: 'Centro de Comando Total',
                    desc: 'Gestione usuarios, proyectos y la salud del sistema desde un solo panel potente.',
                    features_list: ['Visión Global', 'Gestión de Usuarios', 'Configuración del Sistema', 'Análisis Detallado']
                },
                translator: {
                    label: 'Para Traductores',
                    title: 'Banco de Trabajo Sin Distracciones',
                    desc: 'Un espacio de trabajo dedicado con glosario integrado, herramientas de IA y seguimiento de progreso.',
                    features_list: ['Editor Inteligente', 'Resaltados de Glosario', 'Asistente de IA', 'Diff en Tiempo Real']
                },
                client: {
                    label: 'Para Clientes',
                    title: 'Progreso Transparente',
                    desc: 'Rastree sus proyectos en tiempo real, comuníquese con el equipo y gestione entregables.',
                    features_list: ['Asistente de Proyectos', 'Estado en Vivo', 'Chat Directo', 'Est. de Costos']
                }
            },
            explore: 'Explorar'
        },
        tooltips: {
            whatsapp: 'Contactar en WhatsApp',
            linkedin: 'Conectar en LinkedIn',
            email: 'Envíenos un correo',
            call: 'Llámenos'
        },
        cta: {
            title: '¿Listo para transformar su flujo de trabajo?',
            desc: 'Únase a miles de traductores y agencias que se han cambiado al sistema operativo moderno para la localización.',
            button: 'Acceder a la plataforma'
        },
        footer: {
            rights: 'Todos los derechos reservados.',
            developed_by: 'Desarrollado por',
            description: 'El sistema avanzado de gestión de traducciones creado para la era de la IA. Seguro, rápido e inteligente.',
            product: {
                title: 'Producto',
                features: 'Características',
                integrations: 'Integraciones',
                enterprise: 'Empresa',
                security: 'Seguridad'
            },
            company: {
                title: 'Empresa',
                about: 'Sobre nosotros',
                careers: 'Carreras',
                blog: 'Blog',
                legal: 'Legal'
            }
        },
        back_to_top: {
            basement_title: '¡Has llegado al sótano! 🏗️',
            basement_desc: 'Parece que disfrutaste el desplazamiento, pero este es el fondo 😅.',
            basement_prompt: '¿Quieres tomar el ascensor de vuelta arriba, o prefieres las escaleras?',
            elevator: 'Ascensor (Rápido)',
            stairs: 'Escaleras (Lento)'
        }
    },
    pt: {
        dir: 'ltr',
        flag: '🇵🇹',
        name: 'Português',
        nav: {
            features: 'Funcionalidades',
            technology: 'Tecnologia',
            roadmap: 'Roteiro',
            contact: 'Contato',
            access: 'Acessar Plataforma'
        },
        hero: {
            system_online: 'Sistema Online v2.4 (IA Ativada)',
            title_prefix: 'O SO para',
            title_gradient: 'Agências de Tradução Modernas',
            description: 'Construído especificamente para LSPs gerenciarem projetos, tradutores e clientes em uma plataforma unificada. Pare de fazer malabarismos com ferramentas e comece a escalar sua agência.',
            launch_demo: 'Iniciar Demo',
            explore_features: 'Explorar Funcionalidades',
            stats: {
                enterprise: 'Pronto para Empresas',
                multi_lang: 'Multi-Idioma',
                ai_powered: 'Impulsionado por IA'
            },
            badge: {
                label: 'Aumento de Eficiência',
                value: '+450%'
            }
        },
        features: {
            label: 'Poder e Precisão',
            title_prefix: 'Tudo o que você precisa para',
            title_gradient: 'Entregar Mais Rápido',
            items: {
                ai_nexus: { title: 'AI Nexus', desc: 'Integração avançada de IA que auxilia na tradução, gera glossários e sugere melhorias em tempo real.' },
                chat_hub: { title: 'Chat Hub', desc: 'Canais de comunicação em tempo real para equipes. Compartilhe arquivos, discuta o contexto e mantenha todos alinhados.' },
                smart_glossary: { title: 'Glossário Inteligente', desc: 'Destaque de glossário sensível ao contexto no editor. Nunca mais perca um termo definido.' },
                smart_deadlines: { title: 'Prazos Inteligentes', desc: 'Contagens regressivas inteligentes que adaptam seus visuais de urgência com base no tempo restante.' },
                multi_lingual: { title: 'Multilíngue', desc: 'Suporte para pares de idiomas ilimitados com validação instantânea e configuração de projeto.' },
                instant_qa: { title: 'QA Instantâneo', desc: 'Verificações de qualidade automatizadas e rastreamento de status fácil de Rascunho a Confirmado.' }
            }
        },
        stats: {
            words_processed: 'Palavras Processadas',
            active_projects: 'Projetos Ativos',
            languages: 'Idiomas',
            uptime: 'Tempo de Atividade'
        },
        workflow: {
            title: 'Do Arquivo para o',
            title_highlight: 'Global',
            steps: {
                upload: { title: 'Enviar Projeto', desc: 'Arraste e solte documentos. Suportamos PDF, DOCX e mais.' },
                ai: { title: 'Análise de IA', desc: 'Nosso motor pré-traduz e identifica glossários instantaneamente.' },
                review: { title: 'Revisão de Especialistas', desc: 'Tradutores profissionais refinam restrições e nuances.' },
                delivery: { title: 'Entrega', desc: 'Receba arquivos polidos e formatados prontos para o lançamento global.' }
            }
        },
        ai: {
            badge: 'Impulsionado por',
            title_highlight: 'IA de Próxima Geração',
            desc: 'Nosso AI Nexus não é apenas um chatbot. É um núcleo de aprendizado profundo que entende contexto, tom e nuance, duplicando efetivamente a produtividade do tradutor.',
            features: {
                multimodel: { title: 'Núcleo Multimodelo', desc: 'Alterna perfeitamente entre GPT-4, Gemini Pro e Claude com base na complexidade e domínio do texto para resultados ideais.' },
                context: { title: 'Consciente do Contexto', desc: 'A IA lembra restrições do projeto, glossários e diretrizes de tom, garantindo consistência em milhares de segmentos.' },
                assistant: { title: 'Assistente em Tempo Real', desc: 'Tradutores podem conversar com o documento. "Como fraseio isso de forma mais amigável?" ou "Resuma este parágrafo" diretamente no editor.' }
            }
        },
        roadmap: {
            weekly_updates: 'ATUALIZAÇÕES SEMANAIS',
            title_prefix: 'Construindo o',
            title_highlight: 'Ecossistema Definitivo',
            desc: 'LinguaFlow não é estático. Enviamos código toda semana. Estamos evoluindo de uma ferramenta de tradução para uma',
            desc_highlight: ' suíte completa de gestão de agências',
            desc_suffix: '.',
            items: {
                hr: { title: 'RH e Talento', desc: 'Folha de pagamento automatizada, rastreamento de desempenho e pipelines de recrutamento para seus linguistas.', status: 'Em Breve' },
                erp: { title: 'ERP de Agência', desc: 'Planejamento completo de recursos, gestão de ativos e previsão financeira integrada diretamente ao seu fluxo de trabalho.', status: 'Em Desenvolvimento' },
                crm: { title: 'CRM Avançado', desc: 'Insights profundos de clientes, pipelines de vendas e orçamentos automatizados para crescer seus relacionamentos B2B.', status: 'Planejado' }
            }
        },
        vision: {
            title: 'Nossa Visão: O SO da Agência',
            desc: 'Imagine um mundo onde seu PMS, RH, CRM e ferramenta CAT são um único organismo inteligente. É para lá que estamos indo.',
            join_us: 'Junte-se a nós na jornada.'
        },
        cto: {
            meet: 'Conheça o',
            architect: 'Arquiteto',
            role: 'CTO e Engenheiro Principal',
            quote: '"Construímos o LinguaFlow para preencher a lacuna entre a criatividade humana e a inteligência artificial. Nossa missão é capacitar desenvolvedores e tradutores com ferramentas que pareçam superpoderes."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'Email', call: 'Ligar' }
        },
        faq: {
            title: 'Perguntas',
            title_highlight: 'Frequentes',
            questions: {
                ai_help: { q: 'Como o assistente de IA ajuda os tradutores?', a: 'Nosso AI Nexus analisa o texto fonte para fornecer sugestões em tempo real, verificações gramaticais e consistência terminológica, atuando efetivamente como um copiloto que acelera o processo em até 50%.' },
                multiple_projects: { q: 'Posso gerenciar vários projetos simultaneamente?', a: 'Absolutamente. O Painel de Administração foi projetado para escala, permitindo rastrear projetos ilimitados, alocar recursos e monitorar prazos a partir de uma visão geral única.' },
                security: { q: 'Meus dados estão seguros?', a: 'A segurança é primordial. Usamos criptografia de nível empresarial para todos os dados em trânsito e em repouso, com controle de acesso baseado em função garantindo que apenas pessoal autorizado possa visualizar documentos confidenciais.' },
                clients: { q: 'Como convido clientes?', a: 'Administradores podem criar contas de clientes e atribuí-los a projetos específicos. Os clientes obtêm uma visão restrita e transparente onde podem aprovar entregas e conversar com a equipe.' }
            }
        },
        engineering: {
            badge: 'EXCELÊNCIA EM ENGENHARIA',
            title: 'Construído sobre',
            title_highlight: 'Princípios Sólidos',
            desc: 'Não construímos apenas uma ferramenta de tradução; projetamos um sistema distribuído robusto projetado para 99,99% de confiabilidade e escalabilidade perfeita.',
            principles: {
                microservices: { title: 'Arquitetura de Microsserviços', desc: 'Serviços desacoplados garantem que uma falha em um módulo nunca derrube todo o sistema.' },
                performance: { title: 'Alta Performance', desc: 'Otimizado via cache Redis e indexação de banco de dados para tempos de resposta submilissegundos.' },
                security: { title: 'Segurança Empresarial', desc: 'RBAC, criptografia AES-256 e entradas higienizadas protegem seus dados em todas as camadas.' },
                scalability: { title: 'Escalabilidade Infinita', desc: 'Construído sobre um backend sem estado que escala horizontalmente para lidar com milhões de solicitações.' }
            }
        },
        roles: {
            title_prefix: 'Construído para',
            title_highlight: 'Cada Papel',
            desc: 'Uma plataforma unificada que se adapta às suas necessidades, seja você gerenciando o sistema, traduzindo conteúdo ou solicitando trabalho.',
            types: {
                admin: {
                    label: 'Para Administradores',
                    title: 'Centro de Comando Total',
                    desc: 'Gerencie usuários, projetos e a saúde do sistema a partir de um único painel poderoso.',
                    features_list: ['Visão Global', 'Gestão de Usuários', 'Config do Sistema', 'Análises Detalhadas']
                },
                translator: {
                    label: 'Para Tradutores',
                    title: 'Bancada de Trabalho Sem Distrações',
                    desc: 'Um espaço de trabalho dedicado com glossário integrado, ferramentas de IA e rastreamento de progresso.',
                    features_list: ['Editor Inteligente', 'Destaques do Glossário', 'Assistente de IA', 'Diff em Tempo Real']
                },
                client: {
                    label: 'Para Clientes',
                    title: 'Progresso Transparente',
                    desc: 'Acompanhe seus projetos em tempo real, comunique-se com a equipe e gerencie entregas.',
                    features_list: ['Assistente de Projeto', 'Status ao Vivo', 'Chat Direto', 'Est. de Custo']
                }
            },
            explore: 'Explorar'
        },
        tooltips: {
            whatsapp: 'Contato no WhatsApp',
            linkedin: 'Conectar no LinkedIn',
            email: 'Envie-nos um email',
            call: 'Ligue para nós'
        },
        cta: {
            title: 'Pronto para transformar seu fluxo de trabalho?',
            desc: 'Junte-se a milhares de tradutores e agências que migraram para o SO moderno para localização.',
            button: 'Acessar Plataforma'
        },
        footer: {
            rights: 'Todos os direitos reservados.',
            developed_by: 'Desenvolvido por',
            description: 'O sistema avançado de gestão de tradução construído para a era da IA. Seguro, rápido e inteligente.',
            product: {
                title: 'Produto',
                features: 'Funcionalidades',
                integrations: 'Integrações',
                enterprise: 'Empresa',
                security: 'Segurança'
            },
            company: {
                title: 'Empresa',
                about: 'Sobre nós',
                careers: 'Carreiras',
                blog: 'Blog',
                legal: 'Legal'
            }
        },
        back_to_top: {
            basement_title: 'Você chegou ao porão! 🏗️',
            basement_desc: 'Parece que você gostou de rolar, mas este é o fundo do poço 😅.',
            basement_prompt: 'Quer pegar o elevador de volta para cima ou prefere as escadas?',
            elevator: 'Elevador (Rápido)',
            stairs: 'Escadas (Lento)'
        }
    },
    zh: {
        dir: 'ltr',
        flag: '🇨🇳',
        name: '中文',
        nav: {
            features: '特点',
            technology: '技术',
            roadmap: '路线图',
            contact: '联系我们',
            access: '访问平台'
        },
        hero: {
            system_online: '系统在线 v2.4 (启用 AI)',
            title_prefix: '操作系统，专为',
            title_gradient: '现代翻译机构',
            description: '专为 LSP 打造，在一个统一的平台上管理项目、翻译人员和客户。停止在工具之间周旋，开始扩展您的代理机构。',
            launch_demo: '启动演示',
            explore_features: '探索功能',
            stats: {
                enterprise: '企业就绪',
                multi_lang: '多语言',
                ai_powered: 'AI 驱动'
            },
            badge: {
                label: '效率提升',
                value: '+450%'
            }
        },
        features: {
            label: '力量与精确',
            title_prefix: '你所需要的一切，为了',
            title_gradient: '更快交付',
            items: {
                ai_nexus: { title: 'AI Nexus', desc: '先进的 AI 集成，协助翻译，生成术语表并实时建议改进。' },
                chat_hub: { title: '聊天中心', desc: '团队的即时通讯渠道。共享文件，讨论语境，并保持所有人步调一致。' },
                smart_glossary: { title: '智能术语表', desc: '编辑器中上下文感知的术语表高亮显示。再也不会错过已定义的术语。' },
                smart_deadlines: { title: '智能截止日期', desc: '智能倒计时，根据剩余时间调整其紧迫感视觉效果。' },
                multi_lingual: { title: '多语言', desc: '支持无限语言对，即时验证和项目设置。' },
                instant_qa: { title: '即时 QA', desc: '自动化质量检查和从草稿到确认的轻松状态跟踪。' }
            }
        },
        stats: {
            words_processed: '已处理单词',
            active_projects: '活跃项目',
            languages: '语言',
            uptime: '运行时间'
        },
        workflow: {
            title: '从文件到',
            title_highlight: '全球',
            steps: {
                upload: { title: '上传项目', desc: '拖放文档。我们支持 PDF, DOCX 等。' },
                ai: { title: 'AI 分析', desc: '我们的引擎预翻译并即时识别术语表。' },
                review: { title: '专家评审', desc: '专业翻译人员完善约束和细微差别。' },
                delivery: { title: '交付', desc: '接收已打磨、格式化的文件，准备好进行全球发布。' }
            }
        },
        ai: {
            badge: '技术支持',
            title_highlight: '下一代 AI',
            desc: '我们的 AI Nexus 不仅仅是一个聊天机器人。它是一个深度学习核心，理解语境、语气和细微差别，有效地使翻译人员的生产力翻倍。',
            features: {
                multimodel: { title: '多模型核心', desc: '根据文本的复杂性和领域无缝切换 GPT-4, Gemini Pro 和 Claude，以获得最佳结果。' },
                context: { title: '语境感知', desc: 'AI 记住项目约束、术语表和语气指南，确保数千个分段的一致性。' },
                assistant: { title: '实时助手', desc: '翻译人员可以与文档聊天。“我该如何更友好地表达这个？”或“总结这一段”，直接在编辑器中进行。' }
            }
        },
        roadmap: {
            weekly_updates: '每周更新',
            title_prefix: '构建',
            title_highlight: '终极生态系统',
            desc: 'LinguaFlow 不是静态的。我们每周都在推送代码。我们正在从翻译工具演变为',
            desc_highlight: ' 全套代理管理套件',
            desc_suffix: '。',
            items: {
                hr: { title: '人力资源与人才', desc: '自动化的薪资、绩效跟踪和语言专家的招聘流程。', status: '即将推出' },
                erp: { title: '代理 ERP', desc: '完整的资源规划、资产管理和财务预测直接集成到您的工作流中。', status: '开发中' },
                crm: { title: '高级 CRM', desc: '深入的客户洞察、销售渠道和自动报价，以发展您的 B2B 关系。', status: '已计划' }
            }
        },
        vision: {
            title: '我们的愿景：代理操作系统',
            desc: '想象一个世界，您的 PMS、HR、CRM 和 CAT 工具是一个单一的智能有机体。这就是我们要去的地方。',
            join_us: '加入我们的旅程。'
        },
        cto: {
            meet: '遇见',
            architect: '架构师',
            role: 'CTO & 首席工程师',
            quote: '“我们构建 LinguaFlow 是为了弥合人类创造力与人工智能之间的鸿沟。我们的使命是用感觉像超能力一样的工具赋能开发者和翻译人员。”',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: '电子邮件', call: '致电' }
        },
        faq: {
            title: '常见',
            title_highlight: '问题',
            questions: {
                ai_help: { q: 'AI 助手如何帮助翻译人员？', a: '我们的 AI Nexus 分析源文本以提供实时建议、语法检查和术语一致性，有效地充当副驾驶，将流程加快高达 50%。' },
                multiple_projects: { q: '我可以同时管理多个项目吗？', a: '当然。管理仪表板专为规模化设计，允许您从单一的鸟瞰图中跟踪无限的项目、分配资源并监控截止日期。' },
                security: { q: '我的数据安全吗？', a: '安全性至关重要。我们对传输中和静止的所有数据使用企业级加密，基于角色的访问控制确保只有授权人员可以查看敏感文档。' },
                clients: { q: '我如何邀请客户？', a: '管理员可以创建客户帐户并将其分配给特定项目。客户获得受限的、透明的视图，在那里他们可以批准交付物并与团队聊天。' }
            }
        },
        engineering: {
            badge: '工程卓越',
            title: '建立在',
            title_highlight: '坚实原则之上',
            desc: '我们不仅仅构建了一个翻译工具；我们设计了一个强大的分布式系统，旨在实现 99.99% 的可靠性和无缝扩展性。',
            principles: {
                microservices: { title: '微服务架构', desc: '解耦的服务确保一个模块的故障永远不会导致整个系统崩溃。' },
                performance: { title: '高性能', desc: '通过 Redis 缓存和数据库索引进行优化，实现亚毫秒级的响应时间。' },
                security: { title: '企业安全', desc: 'RBAC, AES-256 加密和经过净化的输入在每一层保护您的数据。' },
                scalability: { title: '无限扩展性', desc: '建立在无状态后端之上，可水平扩展以处理数百万个请求。' }
            }
        },
        roles: {
            title_prefix: '专为',
            title_highlight: '每个角色打造',
            desc: '一个统一的平台，适应您的需求，无论您是管理系统、翻译内容还是请求工作。',
            types: {
                admin: {
                    label: '对于管理员',
                    title: '总指挥中心',
                    desc: '从一个单一的、强大的仪表板管理用户、项目和系统健康状况。',
                    features_list: ['全球概览', '用户管理', '系统配置', '详细分析']
                },
                translator: {
                    label: '对于翻译人员',
                    title: '无干扰工作台',
                    desc: '一个专用的工作区，带有集成的术语表、AI 工具和进度跟踪。',
                    features_list: ['智能编辑器', '术语表高亮', 'AI 助手', '实时差异']
                },
                client: {
                    label: '对于客户',
                    title: '透明的进度',
                    desc: '实时跟踪您的项目，与团队沟通并管理交付物。',
                    features_list: ['项目向导', '实时状态', '直接聊天', '成本估算']
                }
            },
            explore: '探索'
        },
        tooltips: {
            whatsapp: '在 WhatsApp 上联系',
            linkedin: '在 LinkedIn 上连接',
            email: '给我们发邮件',
            call: '致电我们'
        },
        cta: {
            title: '准备好改变您的工作流程了吗？',
            desc: '加入成千上万已经转向现代本地化操作系统的翻译人员和代理机构。',
            button: '访问平台'
        },
        footer: {
            rights: '版权所有。',
            developed_by: '开发由',
            description: '专为 AI 时代打造的先进翻译管理系统。安全、快速且智能。',
            product: {
                title: '产品',
                features: '功能',
                integrations: '集成',
                enterprise: '企业',
                security: '安全'
            },
            company: {
                title: '公司',
                about: '关于我们',
                careers: '职业',
                blog: '博客',
                legal: '法律'
            }
        },
        back_to_top: {
            basement_title: '你已经到了地下室！🏗️',
            basement_desc: '看起来你很享受滚动，但这已经是底端了 😅。',
            basement_prompt: '你是想坐电梯回去，还是更喜欢走楼梯？',
            elevator: '电梯（快速）',
            stairs: '楼梯（慢速）'
        }
    },
    ja: {
        dir: 'ltr',
        flag: '🇯🇵',
        name: '日本語',
        nav: {
            features: '機能',
            technology: 'テクノロジー',
            roadmap: 'ロードマップ',
            contact: 'お問い合わせ',
            access: 'プラットフォームにアクセス'
        },
        hero: {
            system_online: 'システムオンライン v2.4 (AI有効)',
            title_prefix: 'のためのOS',
            title_gradient: '現代の翻訳代理店',
            description: 'LSP向けに特別に構築されており、プロジェクト、翻訳者、クライアントを単一の統合プラットフォームで管理します。ツールを使い分けるのをやめ、代理店の規模を拡大しましょう。',
            launch_demo: 'デモを起動',
            explore_features: '機能を見る',
            stats: {
                enterprise: 'エンタープライズ対応',
                multi_lang: '多言語対応',
                ai_powered: 'AI搭載'
            },
            badge: {
                label: '効率向上',
                value: '+450%'
            }
        },
        features: {
            label: 'パワーと精度',
            title_prefix: '必要なすべて',
            title_gradient: 'より速く提供する',
            items: {
                ai_nexus: { title: 'AIネクサス', desc: '翻訳を支援し、用語集を生成し、リアルタイムで改善を提案する高度なAI統合。' },
                chat_hub: { title: 'チャットハブ', desc: 'チーム向けのリアルタイム通信チャネル。ファイルを共有し、コンテキストを議論し、全員の認識を合わせます。' },
                smart_glossary: { title: 'スマート用語集', desc: 'エディタ内でのコンテキスト認識型の用語集ハイライト。定義された用語を見逃すことはもうありません。' },
                smart_deadlines: { title: 'スマート締切', desc: '残り時間に基づいて緊急度の表示を適応させるインテリジェントなカウントダウン。' },
                multi_lingual: { title: '多言語', desc: '無制限の言語ペアのサポート、即時検証、プロジェクト設定。' },
                instant_qa: { title: 'インスタントQA', desc: '自動品質チェックと、下書きから確認済みまでの簡単なステータス追跡。' }
            }
        },
        stats: {
            words_processed: '処理された単語数',
            active_projects: 'アクティブなプロジェクト',
            languages: '言語',
            uptime: '稼働時間'
        },
        workflow: {
            title: 'ファイルから',
            title_highlight: 'グローバルへ',
            steps: {
                upload: { title: 'プロジェクトをアップロード', desc: 'ドキュメントをドラッグ＆ドロップ。PDF、DOCXなどをサポート。' },
                ai: { title: 'AI分析', desc: '当社のエンジンが事前翻訳し、用語集を即座に特定します。' },
                review: { title: '専門家によるレビュー', desc: 'プロの翻訳者が制約とニュアンスを洗練させます。' },
                delivery: { title: '納品', desc: 'グローバルリリースの準備が整った、洗練されフォーマットされたファイルを受け取ります。' }
            }
        },
        ai: {
            badge: 'Powered by',
            title_highlight: '次世代AI',
            desc: '当社のAIネクサスは単なるチャットボットではありません。コンテキスト、トーン、ニュアンスを理解するディープラーニングコアであり、翻訳者の生産性を効果的に倍増させます。',
            features: {
                multimodel: { title: 'マルチモデルコア', desc: '最適な結果を得るために、テキストの複雑さとドメインに基づいて、GPT-4、Gemini Pro、Claudeをシームレスに切り替えます。' },
                context: { title: 'コンテキスト認識', desc: 'AIはプロジェクトの制約、用語集、トーンのガイドラインを記憶し、何千ものセグメントにわたって一貫性を保証します。' },
                assistant: { title: 'リアルタイムアシスタント', desc: '翻訳者はドキュメントとチャットできます。「これをもっとフレンドリーに表現するには？」「この段落を要約して」とエディタ内で直接質問できます。' }
            }
        },
        roadmap: {
            weekly_updates: '毎週の更新',
            title_prefix: '構築中',
            title_highlight: '究極のエコシステム',
            desc: 'LinguaFlowは静的ではありません。私たちは毎週コードをプッシュしています。翻訳ツールから',
            desc_highlight: ' フルスイートの代理店管理システム',
            desc_suffix: 'へと進化しています。',
            items: {
                hr: { title: 'HRと人材', desc: '言語学者のための自動給与計算、パフォーマンス追跡、採用パイプライン。', status: '近日公開' },
                erp: { title: '代理店ERP', desc: 'ワークフローに直接統合された完全なリソース計画、資産管理、財務予測。', status: '開発中' },
                crm: { title: '高度なCRM', desc: 'B2B関係を成長させるための深い顧客インサイト、販売パイプライン、自動見積もり。', status: '計画中' }
            }
        },
        vision: {
            title: '私たちのビジョン：代理店OS',
            desc: 'PMS、HR、CRM、CATツールが単一のインテリジェントな生物である世界を想像してください。それが私たちが目指している場所です。',
            join_us: '旅に参加しましょう。'
        },
        cto: {
            meet: '会う',
            architect: 'アーキテクト',
            role: 'CTO & リードエンジニア',
            quote: '「私たちは、人間の創造性と人工知能のギャップを埋めるためにLinguaFlowを構築しました。私たちの使命は、スーパーパワーのように感じるツールで開発者と翻訳者に力を与えることです。」',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'メール', call: '電話' }
        },
        faq: {
            title: 'よくある',
            title_highlight: '質問',
            questions: {
                ai_help: { q: 'AIアシスタントは翻訳者をどのように助けますか？', a: '当社のAIネクサスはソーステキストを分析して、リアルタイムの提案、文法チェック、用語の一貫性を提供し、プロセスを最大50％高速化する副操縦士として効果的に機能します。' },
                multiple_projects: { q: '複数のプロジェクトを同時に管理できますか？', a: '絶対に。管理ダッシュボードは規模に合わせて設計されており、単一の俯瞰図から無制限のプロジェクトを追跡し、リソースを割り当て、期限を監視できます。' },
                security: { q: 'データは安全ですか？', a: 'セキュリティは最優先事項です。転送中および保存中のすべてのデータにエンタープライズグレードの暗号化を使用し、ロールベースのアクセス制御により、許可された担当者のみが機密文書を表示できるようにします。' },
                clients: { q: 'クライアントを招待するにはどうすればよいですか？', a: '管理者はクライアントアカウントを作成し、特定のプロジェクトに割り当てることができます。クライアントは、成果物を承認し、チームとチャットできる制限された透明なビューを取得します。' }
            }
        },
        engineering: {
            badge: 'エンジニアリングの卓越性',
            title: '強固な',
            title_highlight: '第一原理に基づいて構築',
            desc: '単なる翻訳ツールを構築したのではなく、99.99％の信頼性とシームレスなスケーラビリティのために設計された堅牢な分散システムを設計しました。',
            principles: {
                microservices: { title: 'マイクロサービスアーキテクチャ', desc: '分離されたサービスにより、1つのモジュールの障害がシステム全体をダウンさせることはありません。' },
                performance: { title: '高パフォーマンス', desc: 'Redisキャッシュとデータベースインデックス作成により最適化され、サブミリ秒の応答時間を実現します。' },
                security: { title: 'エンタープライズセキュリティ', desc: 'RBAC、AES-256暗号化、サニタイズされた入力により、すべてのレイヤーでデータを保護します。' },
                scalability: { title: '無限のスケーラビリティ', desc: '数百万の要求を処理するために水平方向にスケーリングするステートレスバックエンド上に構築されています。' }
            }
        },
        roles: {
            title_prefix: '設計された',
            title_highlight: 'すべての役割のために',
            desc: 'システムの管理、コンテンツの翻訳、仕事の依頼など、ニーズに適応する統一プラットフォーム。',
            types: {
                admin: {
                    label: '管理者向け',
                    title: '総合指令センター',
                    desc: '単一の強力なダッシュボードからユーザー、プロジェクト、システムの健全性を管理します。',
                    features_list: ['グローバル概要', 'ユーザー管理', 'システム設定', '詳細な分析']
                },
                translator: {
                    label: '翻訳者向け',
                    title: '集中できるワークベンチ',
                    desc: '統合された用語集、AIツール、進捗追跡を備えた専用ワークスペース。',
                    features_list: ['スマートエディタ', '用語集ハイライト', 'AIアシスタント', 'リアルタイム差分']
                },
                client: {
                    label: 'クライアント向け',
                    title: '透明な進捗',
                    desc: 'プロジェクトをリアルタイムで追跡し、チームと通信し、成果物を管理します。',
                    features_list: ['プロジェクトウィザード', 'ライブステータス', 'ダイレクトチャット', 'コスト見積もり']
                }
            },
            explore: '探索'
        },
        tooltips: {
            whatsapp: 'WhatsAppで連絡',
            linkedin: 'LinkedInでつながる',
            email: 'メールを送る',
            call: '電話する'
        },
        cta: {
            title: 'ワークフローを変革する準備はできましたか？',
            desc: 'ローカリゼーションのための最新のOSに切り替えた何千もの翻訳者や代理店に加わりましょう。',
            button: 'プラットフォームにアクセス'
        },
        footer: {
            rights: '全著作権所有。',
            developed_by: '開発者',
            description: 'AI時代のために構築された高度な翻訳管理システム。安全、高速、インテリジェント。',
            product: {
                title: '製品',
                features: '機能',
                integrations: '統合',
                enterprise: 'エンタープライズ',
                security: 'セキュリティ'
            },
            company: {
                title: '会社',
                about: '私たちについて',
                careers: '採用情報',
                blog: 'ブログ',
                legal: '法的'
            }
        },
        back_to_top: {
            basement_title: '地下室に到着しました！🏗️',
            basement_desc: 'スクロールを楽しんでいただけたようですが、ここが底です 😅。',
            basement_prompt: 'エレベーターで上に戻りますか、それとも階段を使いますか？',
            elevator: 'エレベーター（速い）',
            stairs: '階段（遅い）'
        }
    },
    tr: {
        dir: 'ltr',
        flag: '🇹🇷',
        name: 'Türkçe',
        nav: {
            features: 'Özellikler',
            technology: 'Teknoloji',
            roadmap: 'Yol Haritası',
            contact: 'İletişim',
            access: 'Platforma Eriş'
        },
        hero: {
            system_online: 'Sistem Çevrimiçi v2.4 (Yapay Zeka Etkin)',
            title_prefix: 'Şunun için İşletim Sistemi',
            title_gradient: 'Modern Çeviri Ajansları',
            description: 'LSP\'lerin projeleri, çevirmenleri ve müşterileri tek bir birleşik platformda yönetmesi için özel olarak oluşturulmuştur. Araçlarla boğuşmayı bırakın ve ajansınızı ölçeklendirmeye başlayın.',
            launch_demo: 'Demoyu Başlat',
            explore_features: 'Özellikleri Keşfet',
            stats: {
                enterprise: 'Kurumsal Hazır',
                multi_lang: 'Çok Dilli',
                ai_powered: 'Yapay Zeka Destekli'
            },
            badge: {
                label: 'Verimlilik Artışı',
                value: '+%450'
            }
        },
        features: {
            label: 'Güç ve Hassasiyet',
            title_prefix: 'İhtiyacınız olan her şey',
            title_gradient: 'Daha Hızlı Teslimat İçin',
            items: {
                ai_nexus: { title: 'Yapay Zeka Nexus', desc: 'Çeviriye yardımcı olan, terim sözlükleri oluşturan ve gerçek zamanlı iyileştirmeler öneren gelişmiş yapay zeka entegrasyonu.' },
                chat_hub: { title: 'Sohbet Merkezi', desc: 'Ekipler için gerçek zamanlı iletişim kanalları. Dosyaları paylaşın, bağlamı tartışın ve herkesi aynı hizada tutun.' },
                smart_glossary: { title: 'Akıllı Terimçe', desc: 'Editörde bağlama duyarlı terimçe vurgulama. Tanımlanmış bir terimi bir daha asla kaçırmayın.' },
                smart_deadlines: { title: 'Akıllı Teslim Tarihleri', desc: 'Kalan süreye göre aciliyet görsellerini uyarlayan akıllı geri sayımlar.' },
                multi_lingual: { title: 'Çok Dilli', desc: 'Anında doğrulama ve proje kurulumu ile sınırsız dil çifti desteği.' },
                instant_qa: { title: 'Anında KK', desc: 'Otomatik kalite kontrolleri ve Taslaktan Onaylanmışa kadar kolay durum takibi.' }
            }
        },
        stats: {
            words_processed: 'İşlenen Kelimeler',
            active_projects: 'Aktif Projeler',
            languages: 'Diller',
            uptime: 'Çalışma Süresi'
        },
        workflow: {
            title: 'Dosyadan',
            title_highlight: 'Küresele',
            steps: {
                upload: { title: 'Proje Yükle', desc: 'Belgeleri sürükleyip bırakın. PDF, DOCX ve daha fazlasını destekliyoruz.' },
                ai: { title: 'Yapay Zeka Analizi', desc: 'Motorumuz ön çeviri yapar ve terimçeleri anında tanımlar.' },
                review: { title: 'Uzman İncelemesi', desc: 'Profesyonel çevirmenler kısıtlamaları ve nüansları iyileştirir.' },
                delivery: { title: 'Teslimat', desc: 'Küresel lansman için hazır, cilalı, biçimlendirilmiş dosyalar alın.' }
            }
        },
        ai: {
            badge: 'Tarafından desteklenmektedir',
            title_highlight: 'Yeni Nesil Yapay Zeka',
            desc: 'Yapay Zeka Nexus\'umuz sadece bir sohbet robotu değildir. Bağlamı, tonu ve nüansı anlayan, çevirmen verimliliğini etkili bir şekilde ikiye katlayan derin öğrenme çekirdeğidir.',
            features: {
                multimodel: { title: 'Çok Modelli Çekirdek', desc: 'En iyi sonuçlar için metnin karmaşıklığına ve alanına göre GPT-4, Gemini Pro ve Claude arasında sorunsuz geçiş yapar.' },
                context: { title: 'Bağlam Farkındalığı', desc: 'Yapay zeka proje kısıtlamalarını, terimçeleri ve ton yönergelerini hatırlar, binlerce segmentte tutarlılığı sağlar.' },
                assistant: { title: 'Gerçek Zamanlı Asistan', desc: 'Çevirmenler belgeyle sohbet edebilir. "Bunu daha samimi nasıl ifade ederim?" veya "Bu paragrafı özetle" doğrudan editörde.' }
            }
        },
        roadmap: {
            weekly_updates: 'HAFTALIK GÜNCELLEMELER',
            title_prefix: 'İnşa ediliyor',
            title_highlight: 'Nihai Ekosistem',
            desc: 'LinguaFlow statik değildir. Her hafta kod gönderiyoruz. Bir çeviri aracından',
            desc_highlight: ' tam kapsamlı bir Ajans Yönetim Paketi',
            desc_suffix: 'ne evriliyoruz.',
            items: {
                hr: { title: 'İK ve Yetenek', desc: 'Dilbilimcileriniz için otomatik bordro, performans takibi ve işe alım hatları.', status: 'Yakında' },
                erp: { title: 'Ajans ERP', desc: 'Tam kaynak planlaması, varlık yönetimi ve doğrudan iş akışınıza entegre edilmiş finansal tahmin.', status: 'Geliştirme Aşamasında' },
                crm: { title: 'Gelişmiş MRY', desc: 'B2B ilişkilerinizi büyütmek için derin müşteri içgörüleri, satış hatları ve otomatik teklif verme.', status: 'Planlandı' }
            }
        },
        vision: {
            title: 'Vizyonumuz: Ajans İşletim Sistemi',
            desc: 'PMS, İK, MRY ve BDÇ aracınızın tek, akıllı bir organizma olduğu bir dünya hayal edin. Gittiğimiz yer orası.',
            join_us: 'Yolculukta bize katılın.'
        },
        cto: {
            meet: 'Tanışın:',
            architect: 'Mimar',
            role: 'CTO & Baş Mühendis',
            quote: '"LinguaFlow\'u insan yaratıcılığı ile yapay zeka arasındaki boşluğu doldurmak için kurduk. Misyonumuz, geliştiricileri ve çevirmenleri süper güçler gibi hissettiren araçlarla güçlendirmektir."',
            social: { linkedin: 'LinkedIn', whatsapp: 'WhatsApp', email: 'E-posta', call: 'Ara' }
        },
        faq: {
            title: 'Sıkça Sorulan',
            title_highlight: 'Sorular',
            questions: {
                ai_help: { q: 'Yapay zeka asistanı çevirmenlere nasıl yardımcı olur?', a: 'Yapay Zeka Nexus\'umuz, gerçek zamanlı öneriler, dilbilgisi kontrolleri ve terminoloji tutarlılığı sağlamak için kaynak metni analiz eder ve süreci %50\'ye kadar hızlandıran bir yardımcı pilot görevi görür.' },
                multiple_projects: { q: 'Aynı anda birden fazla projeyi yönetebilir miyim?', a: 'Kesinlikle. Yönetici Paneli ölçeklendirme için tasarlanmıştır, sınırsız projeyi izlemenize, kaynak atamanıza ve tek bir kuşbakışı görünümden son tarihleri izlemenize olanak tanır.' },
                security: { q: 'Verilerim güvende mi?', a: 'Güvenlik her şeyden önemlidir. Aktarım halindeki ve durağan tüm veriler için kurumsal düzeyde şifreleme kullanıyoruz ve rol tabanlı erişim kontrolü, yalnızca yetkili personelin hassas belgeleri görüntüleyebilmesini sağlıyor.' },
                clients: { q: 'Müşterileri nasıl davet ederim?', a: 'Yöneticiler müşteri hesapları oluşturabilir ve bunları belirli projelere atayabilir. Müşteriler, teslimatları onaylayabilecekleri ve ekiple sohbet edebilecekleri kısıtlı, şeffaf bir görünüm elde ederler.' }
            }
        },
        engineering: {
            badge: 'MÜHENDİSLİK MÜKEMMELLİĞİ',
            title: 'Sağlam',
            title_highlight: 'İlkeler Üzerine İnşa Edildi',
            desc: 'Sadece bir çeviri aracı yapmadık; %99,99 güvenilirlik ve sorunsuz ölçeklenebilirlik için tasarlanmış sağlam bir dağıtık sistem tasarladık.',
            principles: {
                microservices: { title: 'Mikroservis Mimarisi', desc: 'Ayrıştırılmış hizmetler, bir modüldeki arızanın asla tüm sistemi çökertmemesini sağlar.' },
                performance: { title: 'Yüksek Performans', desc: 'Milisaniye altı yanıt süreleri için Redis önbelleğe alma ve veritabanı indeksleme yoluyla optimize edilmiştir.' },
                security: { title: 'Kurumsal Güvenlik', desc: 'RBAC, AES-256 şifreleme ve sterilize edilmiş girişler verilerinizi her katmanda korur.' },
                scalability: { title: 'Sonsuz Ölçeklenebilirlik', desc: 'Milyonlarca isteği işlemek için yatay olarak ölçeklenen durumsuz bir arka uç üzerine inşa edilmiştir.' }
            }
        },
        roles: {
            title_prefix: 'Her Rol İçin',
            title_highlight: 'İnşa Edildi',
            desc: 'Sistemi yönetiyor, içeriği çeviriyor veya iş talep ediyor olun, ihtiyaçlarınıza uyum sağlayan birleşik bir platform.',
            types: {
                admin: {
                    label: 'Yöneticiler İçin',
                    title: 'Tam Komuta Merkezi',
                    desc: 'Kullanıcıları, projeleri ve sistem durumunu tek, güçlü bir panodan yönetin.',
                    features_list: ['Küresel Genel Bakış', 'Kullanıcı Yönetimi', 'Sistem Yapılandırması', 'Detaylı Analitik']
                },
                translator: {
                    label: 'Çevirmenler İçin',
                    title: 'Dikkat Dağıtmayan Çalışma Tezgahı',
                    desc: 'Entegre terimçe, yapay zeka araçları ve ilerleme takibi ile özel bir çalışma alanı.',
                    features_list: ['Akıllı Editör', 'Terimçe Vurguları', 'Yapay Zeka Asistanı', 'Gerçek Zamanlı Fark']
                },
                client: {
                    label: 'Müşteriler İçin',
                    title: 'Şeffaf İlerleme',
                    desc: 'Projelerinizi gerçek zamanlı takip edin, ekiple iletişim kurun ve teslimatları yönetin.',
                    features_list: ['Proje Sihirbazı', 'Canlı Durum', 'Doğrudan Sohbet', 'Maliyet Tahmini']
                }
            },
            explore: 'Keşfet'
        },
        tooltips: {
            whatsapp: 'WhatsApp\'ta İletişime Geçin',
            linkedin: 'LinkedIn\'de Bağlanın',
            email: 'Bize E-posta Gönderin',
            call: 'Bizi Arayın'
        },
        cta: {
            title: 'İş akışınızı dönüştürmeye hazır mısınız?',
            desc: 'Yerelleştirme için modern işletim sistemine geçen binlerce çevirmen ve ajansa katılın.',
            button: 'Platforma Eriş'
        },
        footer: {
            rights: 'Tüm hakları saklıdır.',
            developed_by: 'Geliştiren',
            description: 'Yapay zeka çağı için tasarlanmış gelişmiş çeviri yönetim sistemi. Güvenli, hızlı ve akıllı.',
            product: {
                title: 'Ürün',
                features: 'Özellikler',
                integrations: 'Entegrasyonlar',
                enterprise: 'Kurumsal',
                security: 'Güvenlik'
            },
            company: {
                title: 'Şirket',
                about: 'Hakkımızda',
                careers: 'Kariyer',
                blog: 'Blog',
                legal: 'Yasal'
            }
        },
        back_to_top: {
            basement_title: 'Bodruma ulaştınız! 🏗️',
            basement_desc: 'Kaydırmayı sevmiş gibisiniz, ama burası dip nokta 😅.',
            basement_prompt: 'Asansörle yukarı çıkmak mı istersiniz, yoksa merdivenleri mi tercih edersiniz?',
            elevator: 'Asansör (Hızlı)',
            stairs: 'Merdivenler (Yavaş)'
        }
    },
};

export type Language = keyof typeof translations;
export type TranslationKey = string; // Simplified for now, can implement deep recursive keys if needed
