import React, { useState, useRef, useEffect } from 'react';
import { Goal } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Flag, Clock, CalendarDays, MoreVertical, Edit2 } from 'lucide-react';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';

interface SmallGoalCardProps {
    goal: Goal;
    onEdit?: () => void;
}

export const SmallGoalCard = ({ goal, onEdit }: SmallGoalCardProps) => {
    const { updateGoal, removeGoal } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus: Goal['status']) => {
        updateGoal(goal.id, { status: newStatus });
    };

    const statusColors = {
        pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        in_progress: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        completed_early: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        overdue: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        archived: 'bg-slate-800/50 text-slate-500 border-slate-700',
    };

    const statusLabels = {
        pending: 'Pendiente',
        active: 'Activo',
        in_progress: 'En Progreso',
        completed: 'Completado',
        completed_early: 'Adelantado',
        paused: 'Pausado',
        overdue: 'Atrasado',
        archived: 'Archivado'
    };

    const isCompleted = goal.status === 'completed' || goal.status === 'completed_early';

    return (
        <div
            onClick={() => onEdit?.()}
            className={`glass-card premium-border p-4 transition-all duration-300 relative group overflow-hidden cursor-pointer hover:border-white/20 ${isCompleted ? 'opacity-60' : ''}`}
            style={{ borderRadius: 16, borderLeft: `4px solid ${goal.color}` }}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className={`text-base font-bold font-heading line-clamp-1 ${isCompleted ? 'line-through opacity-50' : 'text-white'}`}>
                    {goal.title}
                </h3>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 glass-card premium-border shadow-2xl overflow-hidden z-[60] animate-fade-in" style={{ borderRadius: 12 }}>
                            {goal.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
                                >
                                    Activar Meta
                                </button>
                            )}
                            {goal.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                                >
                                    Pausar Meta
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded-lg border ${statusColors[goal.status as keyof typeof statusColors] || statusColors.pending}`}>
                    {statusLabels[goal.status] || 'Pendiente'}
                </span>

                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-500/80" />
                    <span>{goal.period === 'annual' ? 'Anual' : 'Trimestral'}</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => removeGoal(goal.id)}
                title="Eliminar Meta"
                description={`¿Estás seguro de que deseas eliminar la meta "${goal.title}" de forma permanente?`}
            />
        </div>
    );
};
