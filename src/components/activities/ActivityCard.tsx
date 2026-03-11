import React, { useState, useRef, useEffect } from 'react';
import { Activity } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { CalendarDays, MoreVertical, ListTodo } from 'lucide-react';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';
import { getActivityStats } from '../../utils/progressAnalytics';

interface Props {
    activity: Activity;
    onEdit?: () => void;
}

export const ActivityCard = ({ activity, onEdit }: Props) => {
    const { updateActivity, deleteActivity, tasks, workSessions } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const relatedTasks = tasks.filter(t => t.activityId === activity.id);
    const stats = getActivityStats(activity.id, workSessions);
    const autoProgress = stats.progress;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus: Activity['status']) => {
        updateActivity(activity.id, { status: newStatus });
        setIsMenuOpen(false);
    };

    const statusColors = {
        pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
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
        monthly: 'Mensual',
        bimonthly: 'Bimestral',
        weekly: 'Semanal',
        daily: 'Diaria'
    };

    const isCompleted = activity.status === 'completed' || activity.status === 'completed_early';

    return (
        <div
            onClick={() => onEdit?.()}
            className={`glass rounded-2xl p-6 transition-all duration-300 relative border border-white/5 cursor-pointer hover:bg-slate-800/50 hover:border-purple-500/30 ${isCompleted ? 'opacity-60' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusColors[activity.status] || statusColors.pending}`}>
                    {statusLabels[activity.status] || 'Pendiente'}
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
                            {activity.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                                >
                                    Poner en Progreso
                                </button>
                            )}
                            {activity.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors border-b border-white/5"
                                >
                                    Pausar Actividad
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
                                Marcar Completado
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border-t border-white/5"
                            >
                                Eliminar Actividad
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isCompleted ? 'line-through-dim' : 'text-white'}`}>
                {activity.title}
            </h3>

            {activity.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {activity.description}
                </p>
            )}

            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Progreso en Tiempo</span>
                    <span className="text-purple-400 font-bold">{autoProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                        style={{ width: `${autoProgress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="w-4 h-4 text-pink-400" />
                    <span>{periodLabels[activity.period]}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                    <span>{relatedTasks.length} Plan de Acción (Tareas)</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteActivity(activity.id)}
                title="Eliminar Actividad"
                description={`¿Estás seguro de que deseas eliminar la actividad "${activity.title}" y todas sus tareas de forma permanente?`}
            />
        </div>
    );
};
