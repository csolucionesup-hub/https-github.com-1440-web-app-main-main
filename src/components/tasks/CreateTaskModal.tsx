import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EntityStatus, Task } from '../../types';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    activityId: string;
    taskToEdit?: Task;
}

export const CreateTaskModal = ({ isOpen, onClose, activityId, taskToEdit }: Props) => {
    const { addTask, updateTask } = useAppStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'daily'>('daily');
    const [status, setStatus] = useState<EntityStatus>('in_progress');

    React.useEffect(() => {
        if (taskToEdit && isOpen) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setPeriod(taskToEdit.period);
            setStatus(taskToEdit.status);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPeriod('daily');
            setStatus('in_progress');
        }
    }, [taskToEdit, isOpen]);

    if (!isOpen || !activityId) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (taskToEdit) {
            updateTask(taskToEdit.id, {
                title,
                description,
                period,
                status
            });
        } else {
            addTask({
                activityId,
                title,
                description,
                period,
                status,
                order: 0,
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

                <h2 className="text-xl font-bold font-heading mb-6">
                    {taskToEdit ? 'Editar Tarea' : 'Crear Nueva Tarea'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título de la Tarea</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                            placeholder="Ej: Revisar Excel de ventas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none h-20"
                            placeholder="Detalles sobre esta tarea..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Frecuencia / Periodo</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="daily" className="bg-slate-900 text-white">Diaria</option>
                                <option value="weekly" className="bg-slate-900 text-white">Semanal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="in_progress" className="bg-slate-900 text-white">Activa (En Progreso)</option>
                                <option value="pending" className="bg-slate-900 text-white">Pendiente</option>
                                <option value="paused" className="bg-slate-900 text-white">Pausada</option>
                                {taskToEdit && <option value="completed" className="bg-emerald-900 text-emerald-100">Completada</option>}
                            </select>
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
                            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2.5 text-sm rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                        >
                            {taskToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
