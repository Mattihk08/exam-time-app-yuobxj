
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exam, CreateExamInput, UpdateExamInput } from '@/types/exam';

const EXAMS_STORAGE_KEY = '@exams';

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exams from AsyncStorage
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(EXAMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExams(parsed);
      }
    } catch (err) {
      console.error('[useExams] Error loading exams:', err);
      setError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save exams to AsyncStorage
  const saveExams = useCallback(async (updatedExams: Exam[]) => {
    try {
      await AsyncStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(updatedExams));
      setExams(updatedExams);
    } catch (err) {
      console.error('[useExams] Error saving exams:', err);
      throw new Error('Failed to save exams');
    }
  }, []);

  // Create exam
  const createExam = useCallback(async (input: CreateExamInput): Promise<Exam> => {
    const newExam: Exam = {
      id: Date.now().toString(),
      ...input,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedExams = [...exams, newExam];
    await saveExams(updatedExams);
    
    // TODO: Backend Integration - Call POST /api/exams endpoint here
    console.log('[useExams] TODO: Call backend API to create exam');
    
    return newExam;
  }, [exams, saveExams]);

  // Update exam
  const updateExam = useCallback(async (id: string, input: UpdateExamInput): Promise<Exam> => {
    const examIndex = exams.findIndex(e => e.id === id);
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }

    const updatedExam: Exam = {
      ...exams[examIndex],
      ...input,
      updated_at: new Date().toISOString(),
    };

    const updatedExams = [...exams];
    updatedExams[examIndex] = updatedExam;
    await saveExams(updatedExams);
    
    // TODO: Backend Integration - Call PUT /api/exams/:id endpoint here
    console.log('[useExams] TODO: Call backend API to update exam');
    
    return updatedExam;
  }, [exams, saveExams]);

  // Delete exam
  const deleteExam = useCallback(async (id: string): Promise<void> => {
    const updatedExams = exams.filter(e => e.id !== id);
    await saveExams(updatedExams);
    
    // TODO: Backend Integration - Call DELETE /api/exams/:id endpoint here
    console.log('[useExams] TODO: Call backend API to delete exam');
  }, [exams, saveExams]);

  // Archive exam
  const archiveExam = useCallback(async (id: string): Promise<void> => {
    await updateExam(id, { archived: true });
    
    // TODO: Backend Integration - Call PATCH /api/exams/:id/archive endpoint here
    console.log('[useExams] TODO: Call backend API to archive exam');
  }, [updateExam]);

  // Unarchive exam
  const unarchiveExam = useCallback(async (id: string): Promise<void> => {
    await updateExam(id, { archived: false });
    
    // TODO: Backend Integration - Call PATCH /api/exams/:id/archive endpoint here
    console.log('[useExams] TODO: Call backend API to unarchive exam');
  }, [updateExam]);

  // Get exam by ID
  const getExam = useCallback((id: string): Exam | undefined => {
    return exams.find(e => e.id === id);
  }, [exams]);

  // Get active exams (not archived, sorted by date)
  const getActiveExams = useCallback((): Exam[] => {
    return exams
      .filter(e => !e.archived)
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
  }, [exams]);

  // Get archived exams
  const getArchivedExams = useCallback((): Exam[] => {
    return exams
      .filter(e => e.archived)
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
  }, [exams]);

  // Refresh (reload from storage)
  const refresh = useCallback(async () => {
    await loadExams();
    
    // TODO: Backend Integration - Call GET /api/exams endpoint here
    console.log('[useExams] TODO: Call backend API to fetch exams');
  }, [loadExams]);

  // Load exams on mount
  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return {
    exams,
    loading,
    error,
    createExam,
    updateExam,
    deleteExam,
    archiveExam,
    unarchiveExam,
    getExam,
    getActiveExams,
    getArchivedExams,
    refresh,
  };
}
