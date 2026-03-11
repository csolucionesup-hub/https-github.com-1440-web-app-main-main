import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
}

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, description }: Props) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass w-full max-w-sm rounded-2xl p-6 border border-red-500/20 shadow-2xl relative text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-xl font-bold font-heading mb-2 text-white">{title}</h2>

                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {description || '¿Estás seguro de que deseas eliminar este elemento? Esta acción es irreversible y no se podrá deshacer.'}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                    >
                        Confirmar Borrado
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 rounded-xl font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
