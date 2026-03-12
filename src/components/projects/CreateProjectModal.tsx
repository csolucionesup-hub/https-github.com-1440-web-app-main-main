import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EntityStatus, Project } from '../../types';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    objectiveId: string;
    projectToEdit?: Project;
}

export const CreateProjectModal = ({ isOpen, onClose, objectiveId, projectToEdit }: Props) => {
    const { addProject, updateProject, projects } = useAppStore();

    const relatedActiveCount = projects.filter(p => p.objectiveId === objectiveId && p.status === 'in_progress' && p.id !== projectToEdit?.id).length;
    const isLimitReached = relatedActiveCount >= 6;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'semester' | 'quarterly' | 'monthly'>('monthly');

    const [status, setStatus] = useState<EntityStatus>('pending');

    React.useEffect(() => {
        if (projectToEdit && isOpen) {
            setTitle(projectToEdit.title);
            setDescription(projectToEdit.description || '');
            setPeriod(projectToEdit.period);
            setStatus(projectToEdit.status);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPeriod('monthly');
            setStatus(isLimitReached ? 'pending' : 'in_progress');
        }
    }, [projectToEdit, isOpen, isLimitReached]);

    if (!isOpen || !objectiveId) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            if (projectToEdit) {
                updateProject(projectToEdit.id, {
                    title: title.trim(),
                    description: description.trim(),
                    period,
                    status,
                });
            } else {
                addProject({
                    objectiveId,
                    title: title.trim(),
                    description: description.trim(),
                    period,
                });
            }
            onClose();
        }
        // Reset
        setTitle('');
        setDescription('');
        setPeriod('monthly');
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

                <h2 className="text-xl font-bold font-heading mb-4">
                    {projectToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                </h2>

                {isLimitReached && (!projectToEdit || projectToEdit.status !== 'in_progress') && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-sm text-amber-400">
                        <span className="shrink-0 mt-0.5">⚠️</span>
                        <p>
                            Esta meta ya tiene <strong>6 proyectos activos</strong>. Todo proyecto adicional será enviado al <strong>Banco de Proyectos</strong> (Estado Pendiente o Futuro).
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título del Proyecto</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                            placeholder="Ej: Aumentar ventas un 20%"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none h-20"
                            placeholder="Detalles sobre cómo medir o alcanzar este proyecto..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Periodo</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="monthly" className="bg-slate-900 text-white">Mensual</option>
                                <option value="quarterly" className="bg-slate-900 text-white">Trimestral</option>
                                <option value="semester" className="bg-slate-900 text-white">Semestral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLimitReached && status !== 'in_progress'}
                                title={isLimitReached && status !== 'in_progress' ? "Límite de 6 activos alcanzado" : ""}
                            >
                                <option value="in_progress" className="bg-slate-900 text-white" disabled={isLimitReached && status !== 'in_progress'}>Activo (En Progreso)</option>
                                <option value="pending" className="bg-slate-900 text-white">Pendiente / Futuro</option>
                                <option value="paused" className="bg-slate-900 text-white">Pausado</option>
                                {projectToEdit && <option value="completed" className="bg-emerald-900 text-emerald-100">Completado</option>}
                            </select>
                        </div>
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
                            {projectToEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
