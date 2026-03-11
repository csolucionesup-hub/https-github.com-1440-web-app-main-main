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
    const { updateTask, deleteTask } = useAppStore();
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

    const handleStatusChange = (newStatus: Task['status']) => {
        updateTask(task.id, { status: newStatus });
        setIsMenuOpen(false);
    };

    const statusColors = {
        pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        in_progress: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        completed_early: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        overdue: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        archived: 'bg-slate-800/50 text-slate-500 border-slate-700',
    };

    const statusLabels = {
        pending: 'Pendiente',
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
            className={`glass rounded-2xl p-5 transition-all duration-300 relative border border-white/5 cursor-pointer hover:bg-slate-800/50 hover:border-sky-500/30 ${isCompleted ? 'opacity-60' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusColors[task.status] || statusColors.pending}`}>
                    {statusLabels[task.status] || 'Pendiente'}
                </span>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-2xl overflow-hidden z-20 animate-fade-in border border-white/10">
                            {task.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
                                >
                                    Poner en Progreso
                                </button>
                            )}
                            {task.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors border-b border-white/5"
                                >
                                    Pausar Tarea
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
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }}
                                className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                            >
                                Marcar Completada
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border-t border-white/5"
                            >
                                Eliminar Tarea
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className={`text-base font-bold mb-2 ${isCompleted ? 'line-through-dim' : 'text-white'}`}>
                {task.title}
            </h3>

            {task.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="w-4 h-4 text-sky-400" />
                    <span>{periodLabels[task.period]}</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteTask(task.id)}
                title="Eliminar Tarea"
                description={`¿Estás seguro de que deseas eliminar la tarea "${task.title}" de forma permanente?`}
            />
        </div>
    );
};
