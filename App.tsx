
import React, { useState, useEffect, useMemo } from 'react';
import { FamilyData, FamilyMember } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import MemberCard from './components/MemberCard';
import MemberForm from './components/MemberForm';
import TimelineView from './components/TimelineView';

const App: React.FC = () => {
  const [data, setData] = useState<FamilyData>({ members: [] });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'males' | 'females'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStory, setAiStory] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    setData(storageService.getData());
  }, []);

  const handleAddMember = (newMember: FamilyMember) => {
    storageService.addMember(newMember);
    setData(storageService.getData());
    setIsFormOpen(false);
  };

  const handleUpdateMember = (updatedMember: FamilyMember) => {
    storageService.updateMember(updatedMember);
    setData(storageService.getData());
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to delete this member and their relationships?')) {
      storageService.deleteMember(id);
      setData(storageService.getData());
      setIsFormOpen(false);
      setEditingMember(null);
    }
  };

  const handleMemberClick = (member: FamilyMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleAiProcess = async () => {
    if (!aiStory.trim()) return;
    setIsProcessingAI(true);
    try {
      const result = await geminiService.parseFamilyStory(aiStory);
      if (result && result.members) {
        result.members.forEach((m: any) => {
          const newMember: FamilyMember = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            firstName: m.firstName,
            lastName: m.lastName,
            gender: m.gender || 'unknown',
            birthDate: m.birthDate || '',
            bio: m.bio || '',
            memories: (m.memories || []).map((mem: any) => ({
              id: crypto.randomUUID(),
              ...mem
            })),
            marriageDate: m.marriageDate || '',
            ...m
          };
          storageService.addMember(newMember);
        });
        setData(storageService.getData());
        setShowAiModal(false);
        setAiStory('');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to parse the story. Please try again.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return data.members.filter(m => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (m.maidenName && m.maidenName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'males' && m.gender === 'male') ||
                        (activeTab === 'females' && m.gender === 'female');
      return matchesSearch && matchesTab;
    });
  }, [data.members, searchTerm, activeTab]);

  const sortedMembersByDate = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      const dateA = a.birthDate || '0000-00-00';
      const dateB = b.birthDate || '0000-00-00';
      return dateA.localeCompare(dateB);
    });
  }, [filteredMembers]);

  const membersByCreatedAt = useMemo(() => {
    return [...filteredMembers].sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredMembers]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 leading-tight">KinKeep</h1>
              <p className="text-xs text-slate-500 font-medium">Your Private Family Legacy</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Import with AI
            </button>
            <button 
              onClick={() => { setEditingMember(null); setIsFormOpen(true); }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Toolbar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:max-w-2xl">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm shadow-sm"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                title="Timeline View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('males')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'males' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Males
            </button>
            <button 
              onClick={() => setActiveTab('females')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'females' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Females
            </button>
          </div>
        </div>

        {/* View Selection */}
        {filteredMembers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {membersByCreatedAt.map(member => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onClick={handleMemberClick}
                />
              ))}
            </div>
          ) : (
            <TimelineView 
              members={sortedMembersByDate} 
              onMemberClick={handleMemberClick} 
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">No members found</h3>
            <p className="text-slate-500 max-w-xs text-center">Start your family tree by adding your first member or using the AI story importer.</p>
            <button 
              onClick={() => { setEditingMember(null); setIsFormOpen(true); }}
              className="mt-6 px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              Get Started
            </button>
          </div>
        )}
      </main>

      {/* AI Import Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-800">Family Story Importer</h2>
                <p className="text-xs text-indigo-600">Powered by Gemini AI</p>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Paste a description of your family, and we'll automatically create member profiles for you.
              </p>
              <textarea
                value={aiStory}
                onChange={(e) => setAiStory(e.target.value)}
                rows={6}
                placeholder="e.g. My father John Doe married Jane Smith in 1980. They had two children: me, Robert, and my sister Emily..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
              />
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isProcessingAI || !aiStory.trim()}
                  onClick={handleAiProcess}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessingAI ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : 'Process Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Form Modal */}
      {isFormOpen && (
        <MemberForm
          initialMember={editingMember}
          otherMembers={data.members}
          onSubmit={editingMember ? handleUpdateMember : handleAddMember}
          onCancel={() => { setIsFormOpen(false); setEditingMember(null); }}
          onDelete={handleDeleteMember}
        />
      )}

      {/* Bottom Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Private Local Storage
          </div>
          <div className="text-xs font-semibold text-slate-700">
            {data.members.length} {data.members.length === 1 ? 'Family Member' : 'Family Members'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
