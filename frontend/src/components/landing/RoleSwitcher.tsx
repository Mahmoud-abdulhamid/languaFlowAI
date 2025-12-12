import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, User, Check, ChevronRight } from 'lucide-react';

// Import screenshots dynamically or use direct paths if valid
// Assuming screenshots are in public or src/assets
// Using direct paths assuming we migrated them.

import { useLanguage } from '../../contexts/LanguageContext';

export const RoleSwitcher = ({ isDark = true }: { isDark?: boolean }) => {
    const { t } = useLanguage();

    const ROLES = [
        {
            id: 'ADMIN',
            label: t('roles.types.admin.label'),
            icon: Shield,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            image: '/screenshots/dashboard_admin.png',
            title: t('roles.types.admin.title'),
            desc: t('roles.types.admin.desc'),
            features: t('roles.types.admin.features_list') as unknown as string[] || []
        },
        {
            id: 'TRANSLATOR',
            label: t('roles.types.translator.label'),
            icon: Globe,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            image: '/screenshots/editor_main.png',
            title: t('roles.types.translator.title'),
            desc: t('roles.types.translator.desc'),
            features: t('roles.types.translator.features_list') as unknown as string[] || []
        },
        {
            id: 'CLIENT',
            label: t('roles.types.client.label'),
            icon: User,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            image: '/screenshots/dashboard_client.png',
            title: t('roles.types.client.title'),
            desc: t('roles.types.client.desc'),
            features: t('roles.types.client.features_list') as unknown as string[] || []
        }
    ];
    const [activeRoleId, setActiveRoleId] = useState('ADMIN');
    const activeRole = ROLES.find(r => r.id === activeRoleId) || ROLES[0];

    return (
        <div className={`min-h-screen flex flex-col justify-center py-20 relative snap-start ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'
            }`}>
            {/* Background Glow */}
            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[80%] h-[80%] bg-blue-900/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full">
                <div className="text-center mb-8 shrink-0">
                    <h2 className={`text-3xl md:text-5xl font-bold font-outfit mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {t('roles.title_prefix')} <span className="text-blue-500">{t('roles.title_highlight')}</span>
                    </h2>
                    <p className={`max-w-2xl mx-auto text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('roles.desc')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 shrink-0">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRoleId(role.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 ${activeRole.id === role.id
                                ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                : `bg-transparent ${isDark ? 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'}`
                                }`}
                        >
                            <role.icon size={18} className={activeRole.id === role.id ? role.color : ''} />
                            <span className="font-medium">{role.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Display */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Text Side */}
                    <motion.div
                        key={`text-${activeRole.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={`inline-block p-3 rounded-xl mb-6 ${activeRole.bgColor}`}>
                            <activeRole.icon size={32} className={activeRole.color} />
                        </div>
                        <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{activeRole.title}</h3>
                        <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activeRole.desc}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {activeRole.features.map((feature, idx) => (
                                <div key={idx} className={`flex items-center gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-200 border-gray-300'
                                        }`}>
                                        <Check size={12} className="text-blue-400" />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <button className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium group transition-colors">
                                {t('roles.explore')} {activeRole.label}
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div
                        key={`img-${activeRole.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                        <div className={`relative rounded-xl overflow-hidden border shadow-2xl ${isDark ? 'border-white/10 bg-[#13131f]' : 'border-gray-200 bg-white'}`}>
                            {/* Browser Header Mockup */}
                            <div className={`h-8 flex items-center gap-2 px-3 border-b ${isDark ? 'bg-[#0f0f16] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                </div>
                                <div className={`ml-4 h-4 w-32 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                            </div>
                            <img
                                src={activeRole.image}
                                alt={activeRole.title}
                                loading="lazy"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};
