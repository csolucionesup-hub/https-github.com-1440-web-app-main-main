import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMottoStore } from '../../store/useMottoStore';
import { Flame } from 'lucide-react';

export const Topnav = () => {
    const { globalMotto, pageAffirmations } = useMottoStore();
    const location = useLocation();
    const [currentAffirmation, setCurrentAffirmation] = React.useState('');

    useEffect(() => {
        const affirmations = pageAffirmations[location.pathname] || [];
        if (affirmations.length > 0) {
            // Pick a random one or rotate based on time, currently picking random first
            const randomIdx = Math.floor(Math.random() * affirmations.length);
            setCurrentAffirmation(affirmations[randomIdx]);
        } else {
            setCurrentAffirmation('');
        }
    }, [location.pathname, pageAffirmations]);

    return (
        <header className="h-20 w-full flex items-center justify-between px-8 border-b border-white/5 glass sticky top-0 z-50">
            <div>
                <p className="text-sky-300 text-sm font-semibold tracking-wide uppercase mb-1">Inspiración Diaria</p>
                <div className="flex items-center gap-2">
                    <Flame className="text-orange-400 w-5 h-5 animate-pulse" />
                    <h2 className="text-lg text-white font-medium italic">
                        "{currentAffirmation || globalMotto}"
                    </h2>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {/* User profile / Settings could go here */}
                <div className="w-10 h-10 rounded-full border border-sky-500/30 flex items-center justify-center bg-sky-500/10 cursor-pointer hover:bg-sky-500/20 transition-colors">
                    <span className="text-sky-400 font-bold font-heading">JR</span>
                </div>
            </div>
        </header>
    );
};
