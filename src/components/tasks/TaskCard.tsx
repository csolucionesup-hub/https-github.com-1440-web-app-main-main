import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { CalendarDays, MoreVertical, ListTodo } from 'lucide-react';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';

interface Props {
    task: Task;
    onEdit?: () => void;
}

export const TaskCard = ({ task, onEdit }: Props) => {
    const { updateActionPlan, removeActionPlan, activities } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const parentActivity = activities.find(a => a.id === task.activityId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus: Task['status']) => {
        updateActionPlan(task.id, { status: newStatus });
        setIsMenuOpen(false);
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        in_progress: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        completed_early: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        overdue: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        archived: 'bg-slate-800/50 text-slate-500 border-slate-700',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Pendiente',
        active: 'Activa',
        in_progress: 'En Progreso',
        completed: 'Completado',
        completed_early: 'Adelantado',
        paused: 'Pausado',
        overdue: 'Atrasado',
        archived: 'Archivado'
    };

    const periodLabels = {
        weekly: 'Semanal',
        daily: 'Diario'
    };

    const isCompleted = task.status === 'completed' || task.status === 'completed_early';

    return (
        <div
            onClick={() => onEdit?.()}
            className={`glass-card premium-border p-5 transition-all duration-300 relative border border-white/5 cursor-pointer hover:border-sky-500/50 ${isCompleted ? 'opacity-60' : ''}`}
            style={{ borderRadius: 20 }}
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${statusColors[task.status as keyof typeof statusColors] || statusColors.pending}`}>
                    {statusLabels[task.status as keyof typeof statusLabels] || 'Pendiente'}
                </span>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 glass-card premium-border shadow-2xl overflow-hidden z-20 animate-fade-in" style={{ borderRadius: 14 }}>
                            {task.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-sky-500/10 hover:text-sky-300 transition-colors"
                                >
                                    Poner en Progreso
                                </button>
                            )}
                            {task.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors border-b border-white/5"
                                >
                                    Pausar Tarea
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
                                onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }}
                                className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                            >
                                Marcar Completada
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5"
                            >
                                Eliminar Tarea
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {parentActivity && (
                <div className="flex items-center gap-2 mb-2 text-sky-400 font-medium text-[10px] uppercase tracking-wider">
                    <CalendarDays className="w-3 h-3" />
                    <span>Actividad: {parentActivity.title}</span>
                </div>
            )}

            <h3 className={`text-lg font-bold mb-2 leading-snug ${isCompleted ? 'line-through opacity-50' : 'text-white'}`}>
                {task.title}
            </h3>

            {task.description && (
                <p className="text-slate-400 text-xs mb-5 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <CalendarDays className="w-4 h-4 text-sky-500/80" />
                    <span>{periodLabels[task.period as keyof typeof periodLabels] || task.period}</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => removeActionPlan(task.id)}
                title="Eliminar Tarea"
                description={`¿Estás seguro de que deseas eliminar la tarea "${task.title}" de forma permanente?`}
            />
        </div>
    );
};
