import React from 'react';
import { Linkedin, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const CopyrightFooter = () => {
    const { t } = useLanguage();
    return (
        <footer className="w-full py-6 mt-auto border-t border-gray-200 dark:border-white/5 bg-transparent">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="text-center md:text-left">
                    &copy; {new Date().getFullYear()} {t('footer.rights')}
                    <span className="hidden sm:inline"> | </span>
                    <br className="sm:hidden" />
                    {t('footer.developed_by')} <a href="https://www.linkedin.com/in/mahmoud-abdelhameid-dev/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 dark:text-gray-200 hover:text-blue-500 transition-colors">Mahmoud Abdelhameid</a>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        href="https://wa.me/201122022201"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-green-500 transition-colors group"
                        title={t('tooltips.whatsapp')}
                    >
                        <Phone size={16} className="group-hover:scale-110 transition-transform" />
                        <span>WhatsApp</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mahmoud-abdelhameid-dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
                        title={t('tooltips.linkedin')}
                    >
                        <Linkedin size={16} className="group-hover:scale-110 transition-transform" />
                        <span>LinkedIn</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};
