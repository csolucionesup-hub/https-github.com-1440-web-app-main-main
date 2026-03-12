import React, { useState, useRef, useEffect } from 'react';
import { Objective } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { CalendarDays, MoreVertical, LayoutDashboard, Clock } from 'lucide-react';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';
import { getObjectiveStats } from '../../utils/progressAnalytics';

interface Props {
    objective: Objective;
    onEdit?: () => void;
}

export const ObjectiveCard = ({ objective, onEdit }: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { updateObjective, removeObjective, projects, actionPlans, activities, workSessions } = useAppStore();
    const menuRef = useRef<HTMLDivElement>(null);

    const relatedProjects = projects.filter(p => p.objectiveId === objective.id);
    const relatedActivities = activities.filter(a => a.objectiveId === objective.id);
    const stats = getObjectiveStats(objective.id, projects, actionPlans, activities, workSessions);
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

    const handleStatusChange = (newStatus: Objective['status']) => {
        updateObjective(objective.id, { status: newStatus });
        setIsMenuOpen(false);
    };

    const statusColors = {
        pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        active: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
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

    const periodLabels = {
        quarterly: 'Trimestral',
        bimonthly: 'Bimestral',
        monthly: 'Mensual'
    };

    const isCompleted = objective.status === 'completed' || objective.status === 'completed_early';

    return (
        <div
            onClick={() => onEdit?.()}
            className={`glass-card premium-border p-6 transition-all duration-300 relative cursor-pointer hover:border-indigo-500/50 ${isCompleted ? 'opacity-60' : ''}`}
            style={{ borderRadius: 24 }}
        >
            <div className="flex justify-between items-start mb-6">
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${statusColors[objective.status as keyof typeof statusColors] || statusColors.pending}`}>
                    {statusLabels[objective.status] || 'Pendiente'}
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
                            {objective.status !== 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
                                >
                                    Poner en Progreso
                                </button>
                            )}
                            {objective.status === 'in_progress' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange('paused'); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors border-b border-white/5"
                                >
                                    Pausar Objetivo
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
                                Eliminar Objetivo
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className={`text-xl font-bold mb-3 ${isCompleted ? 'line-through opacity-50' : 'text-white'}`}>
                {objective.title}
            </h3>

            {objective.description && (
                <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {objective.description}
                </p>
            )}

            <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium font-heading">Progreso</span>
                    <span className="text-indigo-400 font-bold">{autoProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${autoProgress}%`, boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6 mt-auto border-t border-white/5 pt-5">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <CalendarDays className="w-4 h-4 text-purple-500/80" />
                    <span>{periodLabels[objective.period]}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <LayoutDashboard className="w-4 h-4 text-emerald-500/80" />
                    <span>{relatedProjects.length} Proyectos</span>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => removeObjective(objective.id)}
                title="Eliminar Objetivo"
                description={`¿Estás seguro de que deseas eliminar el objetivo "${objective.title}" y todas sus actividades de forma permanente?`}
            />
        </div>
    );
};
