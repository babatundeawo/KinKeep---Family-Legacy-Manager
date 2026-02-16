
import React from 'react';
import { FamilyMember } from '../types';

interface TimelineViewProps {
  members: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ members, onMemberClick }) => {
  if (members.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-24 space-y-12 pb-8">
        {members.map((member, index) => {
          const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : 'Unknown';
          const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present';
          
          return (
            <div key={member.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-2 top-2 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 group-hover:scale-125 transition-transform"></div>
              
              {/* Year label (side) */}
              <div className="absolute -left-20 md:-left-28 top-1 text-sm font-bold text-slate-400 w-16 md:w-24 text-right pr-6 md:pr-10">
                {birthYear}
              </div>

              {/* Content Card */}
              <div 
                onClick={() => onMemberClick(member)}
                className="ml-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                {/* Photo Mini */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50">
                  {member.photo ? (
                    <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900">{member.firstName} {member.lastName}</h3>
                    {member.maidenName && (
                      <span className="text-sm text-slate-500 font-medium italic">née {member.maidenName}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                      member.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {member.gender}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                      {member.birthDate || 'Unknown Birth'}
                    </span>
                    {member.deathDate && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                        {member.deathDate}
                      </span>
                    )}
                  </div>

                  {member.bio && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2 italic">
                      "{member.bio}"
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors hidden sm:block">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
