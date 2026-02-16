
import { FamilyData, FamilyMember } from '../types';
import { STORAGE_KEY } from '../constants';

export const storageService = {
  saveData: (data: FamilyData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getData: (): FamilyData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { members: [] };
  },

  addMember: (member: FamilyMember): void => {
    const data = storageService.getData();
    data.members.push(member);
    storageService.saveData(data);
  },

  updateMember: (updatedMember: FamilyMember): void => {
    const data = storageService.getData();
    data.members = data.members.map(m => m.id === updatedMember.id ? updatedMember : m);
    storageService.saveData(data);
  },

  deleteMember: (id: string): void => {
    const data = storageService.getData();
    // Also clean up relationships
    data.members = data.members
      .filter(m => m.id !== id)
      .map(m => ({
        ...m,
        fatherId: m.fatherId === id ? undefined : m.fatherId,
        motherId: m.motherId === id ? undefined : m.motherId,
        spouseId: m.spouseId === id ? undefined : m.spouseId,
      }));
    storageService.saveData(data);
  }
};
