import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MottoState {
    globalMotto: string;
    pageAffirmations: Record<string, string[]>;

    setGlobalMotto: (motto: string) => void;
    addAffirmation: (page: string, affirmation: string) => void;
    removeAffirmation: (page: string, affirmation: string) => void;
}

export const useMottoStore = create<MottoState>()(
    persist(
        (set) => ({
            globalMotto: "Mira que te mando que te esfuerces y seas valiente — Josué 1:9",
            pageAffirmations: {
                '/': [
                    'Tengo 1440 minutos hoy. Mi tiempo es mi vida.',
                    'Cada bloque de tiempo cuenta.'
                ],
                '/goals': [
                    'Visión clara, acciones precisas.',
                    'Solo 3 metas activas garantizan mi éxito integral.'
                ]
            },
            setGlobalMotto: (motto) => set({ globalMotto: motto }),
            addAffirmation: (page, affirmation) => set((state) => ({
                pageAffirmations: {
                    ...state.pageAffirmations,
                    [page]: [...(state.pageAffirmations[page] || []), affirmation]
                }
            })),
            removeAffirmation: (page, affirmation) => set((state) => ({
                pageAffirmations: {
                    ...state.pageAffirmations,
                    [page]: (state.pageAffirmations[page] || []).filter(a => a !== affirmation)
                }
            }))
        }),
        { name: '1440-mottos' }
    )
);
