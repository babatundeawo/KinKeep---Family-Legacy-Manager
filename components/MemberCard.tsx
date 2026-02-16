
import React from 'react';
import { FamilyMember } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onClick: (member: FamilyMember) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onClick }) => {
  return (
    <div 
      onClick={() => onClick(member)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="h-48 bg-slate-100 overflow-hidden relative">
        {member.photo ? (
          <img 
            src={member.photo} 
            alt={`${member.firstName} ${member.lastName}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            member.gender === 'male' ? 'bg-blue-100 text-blue-700' :
            member.gender === 'female' ? 'bg-pink-100 text-pink-700' :
            'bg-slate-200 text-slate-700'
          }`}>
            {member.gender}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 truncate">
          {member.firstName} {member.lastName}
        </h3>
        {member.maidenName && (
          <p className="text-xs text-slate-500 italic mb-1">née {member.maidenName}</p>
        )}
        <div className="flex items-center text-xs text-slate-500 mt-2">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{member.birthDate || 'Unknown Date'}</span>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
