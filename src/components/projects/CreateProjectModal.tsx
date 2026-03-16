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
    const { addProject, updateProject, projects, objectives, goals } = useAppStore();
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [selectedObjectiveId, setSelectedObjectiveId] = useState(objectiveId || '');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'semester' | 'quarterly' | 'monthly'>('monthly');

    // Limits logic (6 total, 3 active)
    const filteredObjectives = objectives.filter(o => o.goalId === selectedGoalId);
    const relatedProjects = projects.filter(p => p.objectiveId === selectedObjectiveId);
    const relatedActiveCount = relatedProjects.filter(p => (p.status === 'active' || p.status === 'in_progress') && p.id !== projectToEdit?.id).length;
    const isLimitReached = relatedActiveCount >= 3;
    const isTotalLimitReached = relatedProjects.length >= 6;

    const [status, setStatus] = useState<EntityStatus>(isLimitReached ? 'pending' : 'active');

    React.useEffect(() => {
        if (projectToEdit && isOpen) {
            setTitle(projectToEdit.title);
            setDescription(projectToEdit.description || '');
            setPeriod(projectToEdit.period);
            setStatus(projectToEdit.status);
            
            const obj = objectives.find(o => o.id === projectToEdit.objectiveId);
            if (obj) {
                setSelectedGoalId(obj.goalId);
            }
            setSelectedObjectiveId(projectToEdit.objectiveId);
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPeriod('monthly');
            setStatus(isLimitReached ? 'pending' : 'active');
            
            if (objectiveId) {
                const obj = objectives.find(o => o.id === objectiveId);
                if (obj) {
                    setSelectedGoalId(obj.goalId);
                }
            } else if (goals.length > 0 && !selectedGoalId) {
                setSelectedGoalId(goals[0].id);
            }
            setSelectedObjectiveId(objectiveId || '');
        }
    }, [projectToEdit, isOpen, objectiveId, isLimitReached, objectives, goals]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalObjectiveId = selectedObjectiveId || objectiveId;
        if (!title.trim() || !finalObjectiveId) return;

        if (!projectToEdit && isTotalLimitReached) {
            alert("Has alcanzado el límite de 6 proyectos para este objetivo.");
            return;
        }

        if (projectToEdit) {
                updateProject(projectToEdit.id, {
                    title: title.trim(),
                    description: description.trim(),
                    period,
                    status,
                    objectiveId: finalObjectiveId as any // Cast because of Partial type issues if any
                });
            } else {
                const result = await addProject({
                    objectiveId: finalObjectiveId,
                    title: title.trim(),
                    description: description.trim(),
                    period,
                });
                if (result && !result.success) {
                    alert(result.message);
                    return;
                }
            onClose();
        }
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
                    {projectToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Meta Fundamental</label>
                        <select
                            value={selectedGoalId}
                            onChange={(e) => {
                                setSelectedGoalId(e.target.value);
                                setSelectedObjectiveId('');
                            }}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                            <option value="">Selecciona una meta</option>
                            {goals.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Objetivo Estratégico</label>
                        <select
                            value={selectedObjectiveId}
                            onChange={(e) => setSelectedObjectiveId(e.target.value)}
                            disabled={!selectedGoalId}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Selecciona un objetivo</option>
                            {filteredObjectives.map(o => (
                                <option key={o.id} value={o.id}>{o.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título del Proyecto</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                            placeholder="Ej: Lanzamiento Campaña Q2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none h-20"
                            placeholder="Detalles sobre este proyecto..."
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
                                <option value="monthly">Mensual</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="semester">Semestral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option 
                                    value="active"
                                    disabled={isLimitReached && (!projectToEdit || projectToEdit.status !== 'active')}
                                >
                                    Activo {isLimitReached && (!projectToEdit || projectToEdit.status !== 'active') && ' - Límite de 3 alcanzado'}
                                </option>
                                <option value="pending">Pendiente</option>
                                <option value="paused">Pausado</option>
                                {projectToEdit && <option value="completed">Completado</option>}
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
                            disabled={isTotalLimitReached && !projectToEdit}
                            className={`bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2.5 text-sm rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] ${(isTotalLimitReached && !projectToEdit) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            {projectToEdit ? 'Guardar Cambios' : (isTotalLimitReached ? 'Límite de 6 alcanzado' : 'Crear Proyecto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
