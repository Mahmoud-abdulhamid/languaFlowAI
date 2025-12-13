import React, { Suspense } from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { ScrollAnimation } from '../components/landing/ScrollAnimation';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Linkedin, Loader2, Mail, Moon, Sun, Phone, MessageCircle } from 'lucide-react';
import { CopyrightFooter } from '../components/CopyrightFooter';

// Lazy Load Sections
const FeatureShowcase = React.lazy(() => import('../components/landing/FeatureShowcase').then(module => ({ default: module.FeatureShowcase })));
const RoleSwitcher = React.lazy(() => import('../components/landing/RoleSwitcher').then(module => ({ default: module.RoleSwitcher })));
const LandingStats = React.lazy(() => import('../components/landing/LandingStats').then(module => ({ default: module.LandingStats })));
const LandingWorkflow = React.lazy(() => import('../components/landing/LandingWorkflow').then(module => ({ default: module.LandingWorkflow })));
const LandingFAQ = React.lazy(() => import('../components/landing/LandingFAQ').then(module => ({ default: module.LandingFAQ })));
const LandingEngineering = React.lazy(() => import('../components/landing/LandingEngineering').then(module => ({ default: module.LandingEngineering })));
const LandingAI = React.lazy(() => import('../components/landing/LandingAI').then(module => ({ default: module.LandingAI })));
const LandingCTO = React.lazy(() => import('../components/landing/LandingCTO').then(module => ({ default: module.LandingCTO })));
const LandingRoadmap = React.lazy(() => import('../components/landing/LandingRoadmap').then(module => ({ default: module.LandingRoadmap })));
const LandingVision = React.lazy(() => import('../components/landing/LandingVision').then(module => ({ default: module.LandingVision })));
import { BackToTop } from '../components/landing/BackToTop';

// import { useScrollStepper } from '../hooks/useScrollStepper';
import { useLandingTheme } from '../hooks/useLandingTheme';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const SectionLoader = () => (
    <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
);

// import { ScrollMouse } from '../components/landing/ScrollMouse';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

import { Menu } from 'lucide-react';
import { MobileNav } from '../components/landing/MobileNav';

const LandingPageContent = () => {
    const sectionIds = ['hero', 'stats', 'technology', 'roles', 'ai', 'process', 'features', 'roadmap', 'vision', 'contact', 'faq', 'cta', 'footer'];
    // useScrollStepper(sectionIds);
    const { theme, toggleTheme, isDark } = useLandingTheme();
    const { t, language } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className={`min-h-screen selection:bg-blue-500/30 font-inter transition-colors duration-300 ${isDark
            ? 'bg-[#0a0a0f] text-white'
            : 'bg-white text-gray-900'
            } ${language === 'ar' ? 'font-cairo' : ''}`}>

            {/* <ScrollMouse isDark={isDark} /> */}
            <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} isDark={isDark} />

            {/* Navigation Overlay */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isDark
                ? 'border-b border-white/5 bg-[#0a0a0f]/80'
                : 'border-b border-gray-200 bg-white/80'
                } backdrop-blur-md`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-xl font-outfit tracking-tight">LinguaFlow AI</span>
                    </div>

                    <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {['Features', 'Technology', 'Roadmap', 'Contact'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className={`relative py-1 transition-colors hover:text-blue-500 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 after:transition-all hover:after:w-full ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                                {t(`nav.${item.toLowerCase()}`)}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />

                        <div className="hidden lg:flex items-center gap-4 border-r pr-6 rtl:border-l rtl:border-r-0 rtl:pl-6 rtl:pr-0" style={{
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }}>
                            <a href="https://www.linkedin.com/in/mahmoud-abdelhameid-dev/" target="_blank" rel="noopener noreferrer" className={`transition-colors hover:scale-110 ${isDark ? 'text-gray-400 hover:text-[#0077b5]' : 'text-gray-600 hover:text-[#0077b5]'}`}><Linkedin size={18} /></a>
                            <a href="https://wa.me/201122022201" target="_blank" rel="noopener noreferrer" className={`transition-colors hover:scale-110 ${isDark ? 'text-gray-400 hover:text-green-500' : 'text-gray-600 hover:text-green-500'}`}><MessageCircle size={18} /></a>
                            <a href="mailto:develper.net@gmail.com" className={`transition-colors hover:scale-110 ${isDark ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-red-500'}`}><Mail size={18} /></a>
                            <a href="tel:+201122022201" className={`transition-colors hover:scale-110 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-400'}`}><Phone size={18} /></a>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all active:scale-95 ${isDark
                                ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <Link
                            to="/login"
                            className={`hidden sm:flex px-5 py-2 text-sm font-bold rounded-lg transition-all items-center gap-2 group shadow-lg hover:shadow-blue-500/25 ${isDark
                                ? 'bg-white text-black hover:bg-gray-100'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                        >
                            {t('nav.access')}
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Mobile Menu Toggle - Visible only on mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${isDark
                                ? 'text-white hover:bg-white/10'
                                : 'text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                <div id="hero">
                    <LandingHero isDark={isDark} />
                </div>

                <Suspense fallback={<SectionLoader />}>
                    <div id="stats">
                        <ScrollAnimation>
                            <LandingStats isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="technology">
                        <ScrollAnimation>
                            <LandingEngineering isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="roles">
                        <ScrollAnimation>
                            <RoleSwitcher isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="ai">
                        <ScrollAnimation>
                            <LandingAI isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="process">
                        <ScrollAnimation>
                            <LandingWorkflow isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="features">
                        <ScrollAnimation>
                            <FeatureShowcase isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="roadmap">
                        <ScrollAnimation>
                            <LandingRoadmap isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="vision">
                        <ScrollAnimation>
                            <LandingVision isDark={isDark} />
                        </ScrollAnimation>
                    </div>



                    <div id="contact">
                        <ScrollAnimation>
                            <LandingCTO isDark={isDark} />
                        </ScrollAnimation>
                    </div>

                    <div id="faq">
                        <ScrollAnimation>
                            <LandingFAQ isDark={isDark} />
                        </ScrollAnimation>
                    </div>
                </Suspense>

                {/* CTA Area */}
                <div id="cta">
                    <ScrollAnimation>
                        <div className={`py-24 border-t relative overflow-hidden ${isDark ? 'border-white/5' : 'border-gray-200'
                            }`}>
                            <div className={`absolute inset-0 ${isDark ? 'bg-blue-600/5' : 'bg-blue-50'}`} />
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent ${isDark ? 'via-blue-500/50' : 'via-blue-400/50'
                                } to-transparent`} />

                            <div className="container mx-auto px-4 relative z-10 text-center">
                                <h2 className={`text-4xl md:text-5xl font-bold font-outfit mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('cta.title')}</h2>
                                <p className={`mb-8 max-w-xl mx-auto text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t('cta.desc')}
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 group"
                                >
                                    {t('cta.button')}
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>
            </main>

            <footer id="footer" className="border-t border-white/10 bg-[#050508] pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <span className="font-bold text-xl font-outfit tracking-tight">LinguaFlow AI</span>
                            </div>
                            <p className={`max-w-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                {t('footer.description')}
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a
                                    href="https://www.linkedin.com/in/mahmoud-abdelhameid-dev/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={t('tooltips.linkedin')}
                                    className={`p-2 rounded-full transition-colors ${isDark
                                        ? 'bg-white/5 text-gray-400 hover:bg-blue-600 hover:text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white'
                                        }`}
                                >
                                    <Linkedin size={20} />
                                </a>
                                <a
                                    href="https://wa.me/201122022201"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={t('tooltips.whatsapp')}
                                    className={`p-2 rounded-full transition-colors ${isDark
                                        ? 'bg-white/5 text-gray-400 hover:bg-green-500 hover:text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white'
                                        }`}
                                >
                                    <MessageCircle size={20} />
                                </a>
                                <a
                                    href="mailto:develper.net@gmail.com"
                                    title={t('tooltips.email')}
                                    className={`p-2 rounded-full transition-colors ${isDark
                                        ? 'bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'
                                        }`}
                                >
                                    <Mail size={20} />
                                </a>
                                <a
                                    href="tel:+201122022201"
                                    title={t('tooltips.call')}
                                    className={`p-2 rounded-full transition-colors ${isDark
                                        ? 'bg-white/5 text-gray-400 hover:bg-blue-400 hover:text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-blue-400 hover:text-white'
                                        }`}
                                >
                                    <Phone size={20} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className={`font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('footer.product.title')}</h4>
                            <ul className={`space-y-3 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.product.features')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.product.integrations')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.product.enterprise')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.product.security')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className={`font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('footer.company.title')}</h4>
                            <ul className={`space-y-3 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.company.about')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.company.careers')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.company.blog')}</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">{t('footer.company.legal')}</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`pt-8 text-center text-sm ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-200 text-gray-500'
                        }`}>
                        <CopyrightFooter />
                    </div>
                </div>
            </footer>

            <BackToTop />
        </div>
    );
};

export const LandingPage = () => (
    <LanguageProvider>
        <LandingPageContent />
    </LanguageProvider>
);
