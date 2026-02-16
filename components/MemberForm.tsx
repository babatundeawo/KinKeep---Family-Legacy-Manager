
import React, { useState, useEffect, useRef } from 'react';
import { FamilyMember, Gender, Memory, RelationshipType } from '../types';
import { GENDER_OPTIONS, RELATIONSHIP_TYPES } from '../constants';

interface MemberFormProps {
  initialMember?: FamilyMember | null;
  onSubmit: (member: FamilyMember) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  otherMembers: FamilyMember[];
}

const MemberForm: React.FC<MemberFormProps> = ({ 
  initialMember, 
  onSubmit, 
  onCancel, 
  onDelete,
  otherMembers 
}) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    firstName: '',
    lastName: '',
    maidenName: '',
    birthDate: '',
    deathDate: '',
    gender: 'unknown',
    bio: '',
    photo: '',
    fatherId: '',
    fatherType: 'biological',
    motherId: '',
    motherType: 'biological',
    spouseId: '',
    marriageDate: '',
    memories: [],
  });

  const [activeMemoryTab, setActiveMemoryTab] = useState<'text' | 'media'>('text');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMember) {
      setFormData({
        ...initialMember,
        memories: initialMember.memories || [],
        fatherType: initialMember.fatherType || 'biological',
        motherType: initialMember.motherType || 'biological',
      });
    }
  }, [initialMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTextMemory = () => {
    if (!newMemoryContent.trim()) return;
    const memory: Memory = {
      id: crypto.randomUUID(),
      type: 'text',
      content: newMemoryContent,
      title: newMemoryTitle,
      date: new Date().toISOString().split('T')[0],
    };
    setFormData(prev => ({
      ...prev,
      memories: [...(prev.memories || []), memory]
    }));
    setNewMemoryContent('');
    setNewMemoryTitle('');
  };

  const handleAddMediaMemory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fixed: Cast Array.from(files) to File[] to resolve 'unknown' property errors (type, name, Blob assignment)
    (Array.from(files) as File[]).forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        const memory: Memory = {
          id: crypto.randomUUID(),
          type: isVideo ? 'video' : 'image',
          content: reader.result as string,
          title: file.name,
          date: new Date().toISOString().split('T')[0],
        };
        setFormData(prev => ({
          ...prev,
          memories: [...(prev.memories || []), memory]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMemory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      memories: prev.memories?.filter(m => m.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member: FamilyMember = {
      id: formData.id || crypto.randomUUID(),
      createdAt: formData.createdAt || Date.now(),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      gender: (formData.gender as Gender) || 'unknown',
      memories: formData.memories || [],
      ...formData,
    } as FamilyMember;
    onSubmit(member);
  };

  const possibleFathers = otherMembers.filter(m => m.id !== formData.id && (m.gender === 'male' || m.gender === 'unknown'));
  const possibleMothers = otherMembers.filter(m => m.id !== formData.id && (m.gender === 'female' || m.gender === 'unknown'));
  const possibleSpouses = otherMembers.filter(m => m.id !== formData.id);

  const getMemberById = (id?: string) => otherMembers.find(m => m.id === id);
  const children = otherMembers.filter(m => m.fatherId === formData.id || m.motherId === formData.id);

  const MemberAvatar = ({ id, label }: { id?: string, label: string }) => {
    const member = getMemberById(id);
    if (!member) return <div className="text-[10px] text-slate-400 font-bold uppercase">{label} (None)</div>;
    return (
      <div className="flex items-center space-x-2 bg-white border border-slate-100 p-1.5 pr-3 rounded-full shadow-sm max-w-[200px]">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
          {member.photo ? (
            <img src={member.photo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
          )}
        </div>
        <div className="truncate">
          <p className="text-[10px] text-slate-400 font-bold uppercase -mb-0.5">{label}</p>
          <p className="text-xs font-semibold text-slate-700 truncate">{member.firstName} {member.lastName}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <div className="flex items-center space-x-4">
            <div className={`w-1.5 h-12 rounded-full ${formData.gender === 'male' ? 'bg-blue-500' : formData.gender === 'female' ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-800 leading-none">
                {initialMember ? 'Update Legacy' : 'New Legacy Entry'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Preserving history for future generations</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-12">
          {/* Section 1: Core Details */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center">
              <span className="mr-3">Identity & Vital Records</span>
              <div className="flex-grow h-px bg-indigo-50"></div>
            </h3>
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-shrink-0 space-y-4">
                <div className="relative group w-44 h-44 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-300 hover:bg-indigo-50/30">
                  {formData.photo ? (
                    <>
                      <img src={formData.photo} alt="Portrait" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold uppercase tracking-wider">Update Photo</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Upload Portrait</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. Eleanor" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. Roosevelt" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Maiden Name</label>
                  <input name="maidenName" value={formData.maidenName} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Family name at birth" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat">
                    {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-green-600">Birth Date</label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-green-100 bg-green-50/20 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-slate-600">Rest Date</label>
                  <input type="date" name="deathDate" value={formData.deathDate} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/20 focus:ring-2 focus:ring-slate-500 outline-none transition-all shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Family Architecture */}
          <section className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 flex items-center">
              <span className="mr-3">Family Tree Connections</span>
              <div className="flex-grow h-px bg-indigo-100/50"></div>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Parents / Lineage */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Lineage (Ancestors)</span>
                  <div className="flex space-x-2">
                    <MemberAvatar id={formData.fatherId} label="F" />
                    <MemberAvatar id={formData.motherId} label="M" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Father</label>
                      <select name="fatherId" value={formData.fatherId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Unknown / Select...</option>
                        {possibleFathers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
                      <select name="fatherType" value={formData.fatherType} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none text-xs">
                        {RELATIONSHIP_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Mother</label>
                      <select name="motherId" value={formData.motherId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        <option value="">Unknown / Select...</option>
                        {possibleMothers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
                      <select name="motherType" value={formData.motherType} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none text-xs">
                        {RELATIONSHIP_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner & Marriage */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Spouse & Descendants</span>
                  <MemberAvatar id={formData.spouseId} label="S" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Spouse / Partner</label>
                    <select name="spouseId" value={formData.spouseId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value="">None / Select...</option>
                      {possibleSpouses.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Marriage Date</label>
                    <input type="date" name="marriageDate" value={formData.marriageDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    Identified Children ({children.length})
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {children.length > 0 ? children.map(child => (
                      <div key={child.id} className="group flex items-center space-x-2 bg-white border border-slate-100 p-1.5 pr-4 rounded-full shadow-sm hover:shadow-md transition-all cursor-default">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                          {child.photo ? <img src={child.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{child.firstName}</span>
                      </div>
                    )) : <p className="text-xs italic text-slate-400 px-1">No children linked to this profile yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Memories & Media */}
          <section className="space-y-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 flex items-center">
              <span className="mr-3">Memories & Media Archive</span>
              <div className="flex-grow h-px bg-indigo-50"></div>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Add Memory Column */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50">
                  <h4 className="text-sm font-bold text-indigo-900 mb-4">Add New Memory</h4>
                  
                  <div className="flex bg-white/60 p-1 rounded-xl mb-4 border border-indigo-50">
                    <button type="button" onClick={() => setActiveMemoryTab('text')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMemoryTab === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}>Text</button>
                    <button type="button" onClick={() => setActiveMemoryTab('media')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMemoryTab === 'media' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}>Media</button>
                  </div>

                  {activeMemoryTab === 'text' ? (
                    <div className="space-y-3">
                      <input type="text" value={newMemoryTitle} onChange={(e) => setNewMemoryTitle(e.target.value)} placeholder="Title (Optional)" className="w-full px-4 py-2 rounded-xl text-sm border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-400" />
                      <textarea value={newMemoryContent} onChange={(e) => setNewMemoryContent(e.target.value)} placeholder="Share a story or key event..." rows={4} className="w-full px-4 py-3 rounded-xl text-sm border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                      <button type="button" onClick={handleAddTextMemory} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Add Story</button>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-indigo-200 rounded-3xl bg-white/40 cursor-pointer hover:bg-white/60 transition-all" onClick={() => mediaInputRef.current?.click()}>
                      <svg className="w-8 h-8 mx-auto text-indigo-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <p className="text-xs font-bold text-indigo-600">Click to Upload</p>
                      <p className="text-[10px] text-indigo-400 mt-1 uppercase">Images or Videos</p>
                      <input type="file" ref={mediaInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleAddMediaMemory} />
                    </div>
                  )}
                </div>
                
                <div className="p-4 rounded-3xl border border-slate-100">
                   <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Main Biography</label>
                   <textarea name="bio" value={formData.bio} onChange={handleChange} rows={6} className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm leading-relaxed" placeholder="The summarized life story..." />
                </div>
              </div>

              {/* Memory List Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-sm font-bold text-slate-700">Archived Memories ({formData.memories?.length || 0})</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.memories && formData.memories.length > 0 ? formData.memories.map(memory => (
                    <div key={memory.id} className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
                      <button type="button" onClick={() => handleRemoveMemory(memory.id)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg text-slate-400 hover:text-red-500 flex items-center justify-center border border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>

                      {memory.type === 'image' && (
                        <div className="aspect-video rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-100">
                          <img src={memory.content} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {memory.type === 'video' && (
                        <div className="aspect-video rounded-2xl overflow-hidden mb-3 bg-black">
                          <video src={memory.content} className="w-full h-full" controls />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {memory.title && <h5 className="text-xs font-bold text-slate-800 truncate">{memory.title}</h5>}
                        {memory.type === 'text' && <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{memory.content}</p>}
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase pt-1">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {memory.date}
                          <span className="mx-2">•</span>
                          {memory.type}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="sm:col-span-2 py-12 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400">No specific memories archived yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-10 border-t border-slate-100">
            {initialMember && onDelete ? (
              <button type="button" onClick={() => onDelete(initialMember.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-2xl hover:bg-red-50 transition-all">Delete Record</button>
            ) : <div />}
            <div className="flex space-x-4">
              <button type="button" onClick={onCancel} className="px-10 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-[0.15em] text-xs hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold uppercase tracking-[0.15em] text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5">Commit to History</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
