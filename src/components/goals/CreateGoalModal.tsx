import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Goal, EntityStatus } from '../../types';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: Goal;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const CreateGoalModal = ({ isOpen, onClose, goalToEdit }: Props) => {
    const { addGoal, updateGoal, goals } = useAppStore();

    const activeGoalsCount = goals.filter(g => g.status === 'in_progress').length;
    const isLimitReached = activeGoalsCount >= 3;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [motto, setMotto] = useState('');
    const [period, setPeriod] = useState<'annual' | 'quarterly'>('annual');
    const [status, setStatus] = useState<EntityStatus>('in_progress');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title);
            setDescription(goalToEdit.description || '');
            setMotto(goalToEdit.motto || '');
            setPeriod(goalToEdit.period);
            setStatus(goalToEdit.status);
            setColor(goalToEdit.color);
        } else {
            setTitle('');
            setDescription('');
            setMotto('');
            setPeriod('annual');
            setStatus(isLimitReached ? 'pending' : 'in_progress');
            setColor(COLORS[0]);
        }
    }, [goalToEdit, isOpen, isLimitReached]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (goalToEdit) {
            updateGoal(goalToEdit.id, {
                title,
                description,
                status,
                period,
                priority: 'high',
                color,
                motto
            });
        } else {
            addGoal({
                title,
                description,
                category: 'Negocio', // Default category
                period,
                priority: 'high',
                color,
                motto
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass w-full max-w-lg rounded-2xl p-5 border border-sky-500/20 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold font-heading mb-4">{goalToEdit ? 'Editar Meta' : 'Crear Nueva Meta'}</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título de la Meta</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                            placeholder="Ej: Lanzar mi nuevo negocio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none h-20"
                            placeholder="Detalla el porqué y el contexto de esta meta..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Periodo</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="annual" className="bg-slate-900 text-white">Anual</option>
                                <option value="quarterly" className="bg-slate-900 text-white">Trimestral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado Inicial</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option
                                    value="in_progress"
                                    className="bg-slate-900 text-white"
                                    disabled={isLimitReached && (!goalToEdit || goalToEdit.status !== 'in_progress')}
                                >
                                    Activa (En progreso) {isLimitReached && (!goalToEdit || goalToEdit.status !== 'in_progress') && ' - Límite de 3 alcanzado'}
                                </option>
                                <option value="paused" className="bg-slate-900 text-white">Pausada</option>
                                <option value="completed" className="bg-slate-900 text-white">Terminada</option>
                                <option value="pending" className="bg-slate-900 text-white">Futura</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3 block">Color Distintivo</label>
                        <div className="flex gap-3">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 border-2 border-white' : 'scale-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Lema o Afirmación (Opcional)</label>
                        <input
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm italic"
                            placeholder="Ej: Soy imparable ante la adversidad."
                        />
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t border-white/5 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2 text-sm rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                        >
                            {goalToEdit ? 'Actualizar Meta' : 'Guardar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
