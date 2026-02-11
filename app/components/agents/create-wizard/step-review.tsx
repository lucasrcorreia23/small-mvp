'use client';

import { useState, useEffect } from 'react';
import { CaseSetupGenerateResponse } from '@/app/lib/types/sta';

interface StepReviewProps {
  generatedData: CaseSetupGenerateResponse;
  onComplete: (data: CaseSetupGenerateResponse) => void;
  onBack: () => void;
  setFooterContent?: (node: React.ReactNode) => void;
}

export function StepReview({ generatedData, onComplete, onBack, setFooterContent }: StepReviewProps) {
  const [trainingName, setTrainingName] = useState(generatedData.training_name);
  const [trainingDescription, setTrainingDescription] = useState(generatedData.training_description);

  // Persona
  const [personaName, setPersonaName] = useState(generatedData.persona_profile.name);
  const [personaCompany, setPersonaCompany] = useState(generatedData.company_profile.name);
  const [personaStyle, setPersonaStyle] = useState(generatedData.persona_profile.communication_style_slug);
  const [personaAvatar, setPersonaAvatar] = useState<string | null>(null);

  // Criteria
  const [criteria, setCriteria] = useState<string[]>(generatedData.salesperson_success_criteria || []);
  const [newCriterion, setNewCriterion] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>(generatedData.training_targeted_sales_skills || []);
  const [newSkill, setNewSkill] = useState('');

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleUpdateCriterion = (index: number, value: string) => {
    setCriteria(criteria.map((c, i) => (i === index ? value : c)));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const updated: CaseSetupGenerateResponse = {
      ...generatedData,
      training_name: trainingName,
      training_description: trainingDescription,
      persona_profile: {
        ...generatedData.persona_profile,
        name: personaName,
        communication_style_slug: personaStyle,
      },
      company_profile: {
        ...generatedData.company_profile,
        name: personaCompany,
      },
      salesperson_success_criteria: criteria,
      training_targeted_sales_skills: skills,
    };
    onComplete(updated);
  };

  useEffect(() => {
    if (!setFooterContent) return;
    setFooterContent(
      <>
        <button
          onClick={onBack}
          className="btn-secondary w-fit h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200"
        >
          Voltar
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary w-fit h-12 px-6 text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Criar Treinamento
        </button>
      </>
    );
    return () => setFooterContent(null);
  }, [setFooterContent, onBack, trainingName, trainingDescription, personaName, personaCompany, personaStyle, criteria, skills]);

  return (
    <div className="w-full max-w-[700px] mx-auto space-y-6">
      {/* Training Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Nome do Treinamento</h3>
        <input
          type="text"
          value={trainingName}
          onChange={(e) => setTrainingName(e.target.value)}
          className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Descricao</h3>
        <textarea
          value={trainingDescription}
          onChange={(e) => setTrainingDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
        />
      </div>

      {/* Persona */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Persona do Comprador</h3>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Comprador</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              id="review-persona-avatar"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPersonaAvatar(reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            <label
              htmlFor="review-persona-avatar"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer overflow-hidden bg-[#2E63CD] hover:ring-2 hover:ring-[#2E63CD]/50 shrink-0"
              title="Clique para adicionar imagem"
            >
              {personaAvatar ? (
                <img src={personaAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                personaName.charAt(0).toUpperCase()
              )}
            </label>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="Nome da persona"
                className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={personaCompany}
              onChange={(e) => setPersonaCompany(e.target.value)}
              placeholder="Empresa"
              className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
            <input
              type="text"
              value={personaStyle}
              onChange={(e) => setPersonaStyle(e.target.value)}
              placeholder="Estilo de comunicacao"
              className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Criterios de Avaliacao</h3>
        <div className="space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <input
                type="text"
                value={c}
                onChange={(e) => handleUpdateCriterion(i, e.target.value)}
                className="flex-1 px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
              <button
                type="button"
                onClick={() => handleRemoveCriterion(i)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm shrink-0"
                aria-label="Remover criterio"
              >
                &#x2715;
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCriterion()}
              placeholder="Adicionar criterio..."
              className="flex-1 px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
            <button
              type="button"
              onClick={handleAddCriterion}
              disabled={!newCriterion.trim()}
              className="btn-secondary px-3 py-2 text-sm text-[#2E63CD] hover:bg-slate-50 disabled:text-slate-400"
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Habilidades Avaliadas</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs bg-[#2E63CD]/10 text-[#2E63CD] border border-[#2E63CD]/20 rounded-sm flex items-center gap-2 group"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(i)}
                className="text-[#2E63CD]/50 hover:text-red-500 transition-colors"
              >
                &#x2715;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            placeholder="Adicionar habilidade..."
            className="flex-1 px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="btn-secondary px-3 py-2 text-sm text-[#2E63CD] hover:bg-slate-50 disabled:text-slate-400"
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
