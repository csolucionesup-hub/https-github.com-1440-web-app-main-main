import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EntityStatus, Activity } from '../../types';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    activityToEdit?: Activity;
}

export const CreateActivityModal = ({ isOpen, onClose, taskId, activityToEdit }: Props) => {
    const { addActivity, updateActivity } = useAppStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'bimonthly' | 'weekly' | 'daily'>('weekly');
    const [status, setStatus] = useState<EntityStatus>('in_progress');
    const [plannedMinutesPerSession, setPlannedMinutesPerSession] = useState<number>(60);
    const [priority, setPriority] = useState<Activity['priority']>('medium');
    const [plannedDaysOfWeek, setPlannedDaysOfWeek] = useState<number[]>([]);

    React.useEffect(() => {
        if (activityToEdit && isOpen) {
            setTitle(activityToEdit.title);
            setDescription(activityToEdit.description || '');
            setPeriod(activityToEdit.period);
            setStatus(activityToEdit.status);
            setPlannedMinutesPerSession(activityToEdit.plannedMinutesPerSession || 60);
            setPriority(activityToEdit.priority || 'medium');
            setPlannedDaysOfWeek(activityToEdit.plannedDaysOfWeek || []);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPeriod('weekly');
            setStatus('in_progress');
            setPlannedMinutesPerSession(60);
            setPriority('medium');
            setPlannedDaysOfWeek([]);
        }
    }, [activityToEdit, isOpen]);

    if (!isOpen || !taskId) return null;

    const toggleDay = (dayIndex: number) => {
        setPlannedDaysOfWeek(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort()
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (activityToEdit) {
            updateActivity(activityToEdit.id, {
                title: title.trim(),
                description: description.trim(),
                period,
                status,
                plannedMinutesPerSession,
                priority,
                plannedDaysOfWeek
            });
        } else {
            addActivity({
                taskId,
                title: title.trim(),
                description: description.trim(),
                period,
                plannedMinutesPerSession,
                priority,
                plannedDaysOfWeek
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass w-full max-w-lg rounded-2xl p-5 border border-purple-500/20 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold font-heading mb-6">
                    {activityToEdit ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título de la Actividad</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                            placeholder="Ej: Análisis de métricas mensuales"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none h-20"
                            placeholder="Detalles sobre esta actividad..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Periodo</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="daily" className="bg-slate-900 text-white">Diaria</option>
                                <option value="weekly" className="bg-slate-900 text-white">Semanal</option>
                                <option value="bimonthly" className="bg-slate-900 text-white">Bimestral</option>
                                <option value="monthly" className="bg-slate-900 text-white">Mensual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Prioridad</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="low" className="bg-slate-900 text-white">Baja</option>
                                <option value="medium" className="bg-slate-900 text-white">Media</option>
                                <option value="high" className="bg-slate-900 text-white">Alta</option>
                                <option value="critical" className="bg-slate-900 text-white">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado Inicial</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="in_progress" className="bg-slate-900 text-white">Activa (En Progreso)</option>
                                <option value="pending" className="bg-slate-900 text-white">Pendiente</option>
                                <option value="paused" className="bg-slate-900 text-white">Pausada</option>
                                {activityToEdit && <option value="completed" className="bg-emerald-900 text-emerald-100">Completada</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Minutos Reales por Sesión</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="1440"
                                value={plannedMinutesPerSession}
                                onChange={(e) => setPlannedMinutesPerSession(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                placeholder="Ej: 60"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Días Planificados (Opcional)</label>
                        <div className="flex justify-between gap-1">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(idx)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${plannedDaysOfWeek.includes(idx)
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-5 py-2.5 text-sm rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                            {activityToEdit ? 'Guardar Cambios' : 'Crear Actividad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
