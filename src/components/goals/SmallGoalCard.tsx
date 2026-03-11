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
    const { updateGoal, deleteGoal } = useAppStore();
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
        in_progress: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        completed_early: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        pending: 'bg-slate-700/50 text-slate-300 border-slate-600/50'
    };

    // Convert status to readable text
    const statusLabels = {
        in_progress: 'Activa',
        paused: 'Pausada',
        completed: 'Terminada',
        completed_early: 'Terminada Anticipada',
        archived: 'Archivada',
        pending: 'Futura'
    };

    const isCompleted = goal.status === 'completed' || goal.status === 'completed_early';

    return (
        <div
            onClick={() => onEdit?.()}
            className={`glass rounded-xl p-4 transition-all duration-300 relative group overflow-hidden cursor-pointer hover:bg-white/5 ${isCompleted ? 'opacity-50' : ''}`}
            style={{ borderLeft: `4px solid ${goal.color}` }}
        >

            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-base font-bold font-heading line-clamp-1 ${isCompleted ? 'line-through-dim' : 'text-white'}`}>
                    {goal.title}
                </h3>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-2xl overflow-hidden z-[60] animate-fade-in">
                            {goal.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
                                >
                                    Activar Meta
                                </button>
                            )}
                            {goal.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                                >
                                    Pausar Meta
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                            {goal.status !== 'completed' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                                >
                                    Marcar como Terminada
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border-t border-white/5"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border ${statusColors[goal.status as keyof typeof statusColors] || statusColors.paused}`}>
                    {statusLabels[goal.status as keyof typeof statusLabels] || 'Futura'}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{goal.period === 'annual' ? 'Anual' : 'Trimestral'}</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteGoal(goal.id)}
                title="Eliminar Meta"
                description={`¿Estás seguro de que deseas eliminar la meta "${goal.title}" de forma permanente?`}
            />
        </div>
    );
};
