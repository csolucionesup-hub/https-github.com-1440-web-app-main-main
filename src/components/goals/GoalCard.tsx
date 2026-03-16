import React, { useState, useRef, useEffect } from 'react';
import { Goal } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Flag, Clock, CalendarDays, MoreVertical, Edit2, TrendingUp, Briefcase, Heart, Sparkles, User } from 'lucide-react';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';
import { getGoalStats } from '../../utils/progressAnalytics';

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
}

export const GoalCard = ({ goal, onEdit }: GoalCardProps) => {
  const { updateGoal, removeGoal, projects, objectives, actionPlans, activities, workSessions } = useAppStore();
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
    active: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed_early: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  // Convert status to readable text
  const statusLabels = {
    active: 'Activa',
    in_progress: 'En Progreso',
    paused: 'Pausada',
    completed: 'Terminada',
    completed_early: 'Terminada Anticipada',
    archived: 'Archivada',
    pending: 'Futura'
  };

  const isCompleted = goal.status === 'completed' || goal.status === 'completed_early';
  const stats = getGoalStats(goal.id, projects, objectives, activities, workSessions);
  const autoProgress = stats.progress;
 
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'Negocio':
        return { icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'Salud':
        return { icon: <Heart className="w-3.5 h-3.5" />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'Espiritual':
        return { icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'Personal':
        return { icon: <User className="w-3.5 h-3.5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      default:
        return { icon: <Flag className="w-3.5 h-3.5" />, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    }
  };
 
  const categoryInfo = getCategoryInfo(goal.category || '');

  return (
    <div className={`glass-card premium-border p-6 transition-all duration-300 relative group overflow-hidden ${isCompleted ? 'opacity-70' : ''}`} style={{ borderTop: `4px solid ${goal.color}`, borderRadius: 24 }}>
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: goal.color }}
      />

      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${statusColors[goal.status as keyof typeof statusColors] || statusColors.paused}`}>
            {statusLabels[goal.status as keyof typeof statusLabels] || 'Futura'}
          </span>
          
          <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${categoryInfo.bg} ${categoryInfo.color} ${categoryInfo.border}`}>
            {categoryInfo.icon}
            {goal.category || 'Sin Categoría'}
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-card premium-border shadow-2xl overflow-hidden z-20 animate-fade-in" style={{ borderRadius: 16 }}>
              {(goal.status === 'active' || (goal.status as string) === 'in_progress') ? (
                <button
                  onClick={() => { handleStatusChange('paused'); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                >
                  Pausar Meta
                </button>
              ) : (
                <button
                  onClick={() => { handleStatusChange('active'); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-sky-500/10 hover:text-sky-300 transition-colors"
                >
                  Activar Meta
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => { onEdit(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 transition-colors"
                >
                  Editar Meta
                </button>
              )}
              <button
                onClick={() => { handleStatusChange('completed'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
              >
                Marcar como Terminada
              </button>
              <button
                onClick={() => { setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5"
              >
                Eliminar Definitivamente
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className={`text-2xl font-bold mb-3 ${isCompleted ? 'line-through opacity-50' : 'text-white'}`}>
        {goal.title}
      </h3>

      {goal.description && (
        <p className={`text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed ${isCompleted ? 'opacity-50' : ''}`}>
          {goal.description}
        </p>
      )}

      {goal.motto && (
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5 italic">
          <p className="text-xs text-slate-300 font-medium text-center">"{goal.motto}"</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium font-heading">Progreso Global</span>
          <span className="text-white font-bold">{autoProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900/50 rounded-full overflow-hidden shadow-inner border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : ''}`}
            style={{ 
              width: `${autoProgress}%`, 
              background: isCompleted ? undefined : `linear-gradient(90deg, ${goal.color}, ${goal.color}88)`,
              boxShadow: `0 0 10px ${goal.color}44`
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 mt-auto border-t border-white/5 pt-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <span>{goal.period === 'annual' ? 'ANUAL' : 'TRIMESTRAL'}</span>
        </div>
        {goal.deadline && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>{new Date(goal.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => removeGoal(goal.id)}
        title="Eliminar Meta"
        description={`¿Estás seguro de que deseas eliminar la meta "${goal.title}" y todo su contenido relacionado de forma permanente?`}
      />
    </div>
  );
};
