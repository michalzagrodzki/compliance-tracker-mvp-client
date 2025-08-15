/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { auditSessionService } from '../services/auditSessionService';
import { useAuditSessionStore } from '../store/auditSessionStore';
import type {
  AuditSession,
  AuditSessionCreate,
  AuditSessionSearchRequest,
  DocumentWithRelationship,
} from '../types';

export const useAuditSession = () => {
  const {
    sessions,
    currentSession,
    sessionDocuments,
    isLoading,
    isAddingDocument,
    isRemovingDocument,
    error,
    setLoading,
    setAddingDocument,
    setRemovingDocument,
    clearError,
    setSessions,
    setCurrentSession,
    setSessionDocuments,
    setError,
  } = useAuditSessionStore();

  const fetchAllSessions = useCallback(
    async (skip: number = 0, limit: number = 10) => {
      setLoading(true);
      clearError();
      
      try {
        const fetchedSessions = await auditSessionService.getAllSessions(skip, limit);
        setSessions(fetchedSessions);
      } catch (error) {
        setError(error.message || 'Failed to fetch audit sessions');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUserSessions = useCallback(
    async (userId: string, skip: number = 0, limit: number = 10) => {
      setLoading(true);
      clearError();
      
      try {
        const fetchedSessions = await auditSessionService.getUserSessions(userId, skip, limit);
        setSessions(fetchedSessions);
      } catch (error) {
        setError(error.message || 'Failed to fetch user sessions');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSessionById = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      clearError();
      
      try {
        const session = await auditSessionService.getSessionById(sessionId);
        setCurrentSession(session);
        return session;
      } catch (error) {
        setError(error.message || 'Failed to fetch audit session');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSessionsByStatus = useCallback(
    async (isActive: boolean, skip: number = 0, limit: number = 10) => {
      setLoading(true);
      clearError();
      
      try {
        const fetchedSessions = await auditSessionService.getSessionsByStatus(isActive, skip, limit);
        setSessions(fetchedSessions);
      } catch (error) {
        setError(error.message || 'Failed to fetch sessions by status');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSessionsByDomain = useCallback(
    async (domain: string, skip: number = 0, limit: number = 10) => {
      setLoading(true);
      clearError();
      
      try {
        const fetchedSessions = await auditSessionService.getSessionsByDomain(domain, skip, limit);
        setSessions(fetchedSessions);
      } catch (error) {
        setError(error.message || 'Failed to fetch sessions by domain');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchSessions = useCallback(
    async (searchData: AuditSessionSearchRequest) => {
      setLoading(true);
      clearError();
      
      try {
        const fetchedSessions = await auditSessionService.searchSessions(searchData);
        setSessions(fetchedSessions);
      } catch (error) {
        setError(error.message || 'Failed to search sessions');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createSession = useCallback(
    async (sessionData: AuditSessionCreate): Promise<AuditSession> => {
      setLoading(true);
      clearError();
      
      try {
        const newSession = await auditSessionService.createSession(sessionData);
        setSessions([newSession, ...sessions]);
        setCurrentSession(newSession);
        return newSession;
      } catch (error) {
        setError(error.message || 'Failed to create session');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessions]
  );

  const fetchSessionDocuments = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      clearError();
      
      try {
        const documents = await auditSessionService.getSessionDocuments(sessionId);
        setSessionDocuments(documents);
        return documents;
      } catch (error) {
        setError(error.message || 'Failed to fetch session documents');
        setSessionDocuments([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Silent variant: does not touch global loading/error state
  const fetchSessionDocumentsSilent = useCallback(
    async (sessionId: string) => {
      const documents = await auditSessionService.getSessionDocuments(sessionId);
      // Update data in store but avoid global loading/error states
      setSessionDocuments(documents);
      return documents;
    },
    []
  );

  const addDocumentToSession = useCallback(
    async (sessionId: string, documentId: string, notes?: string) => {
      setAddingDocument(true);
      clearError();
      
      try {
        await auditSessionService.addDocumentToSession(sessionId, documentId, notes);
        const updatedDocuments = await auditSessionService.getSessionDocuments(sessionId);
        setSessionDocuments(updatedDocuments);
        return updatedDocuments;
      } catch (error) {
        setError(error.message || 'Failed to add document to session');
        throw error;
      } finally {
        setAddingDocument(false);
      }
    },
    []
  );

  const removeDocumentFromSession = useCallback(
    async (sessionId: string, documentId: string) => {
      setRemovingDocument(documentId);
      clearError();
      
      try {
        await auditSessionService.removeDocumentFromSession(sessionId, documentId);
        const updatedDocuments = sessionDocuments.filter(
          (doc: DocumentWithRelationship) => doc.id !== documentId
        );
        setSessionDocuments(updatedDocuments);
        return updatedDocuments;
      } catch (error) {
        setError(error.message || 'Failed to remove document from session');
        throw error;
      } finally {
        setRemovingDocument(null);
      }
    },
    [sessionDocuments]
  );

  // Silent variant: does not touch global removing/error states
  const removeDocumentFromSessionSilent = useCallback(
    async (sessionId: string, documentId: string) => {
      await auditSessionService.removeDocumentFromSession(sessionId, documentId);
      const updatedDocuments = sessionDocuments.filter(
        (doc: DocumentWithRelationship) => doc.id !== documentId
      );
      setSessionDocuments(updatedDocuments);
      return updatedDocuments;
    },
    [sessionDocuments]
  );

  const getAuditSessionHistory = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      clearError();
      
      try {
        const history = await auditSessionService.getAuditSessionHistory(sessionId);
        return history;
      } catch (error) {
        setError(error.message || 'Failed to fetch session history');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Silent variant: does not touch global loading/error state
  const getAuditSessionHistorySilent = useCallback(
    async (sessionId: string) => {
      try {
        const history = await auditSessionService.getAuditSessionHistory(sessionId);
        return history;
      } catch (error) {
        // Do not set global error; propagate for local handling
        throw error;
      }
    },
    []
  );

  const closeSession = useCallback(
    async (sessionId: string, sessionSummary?: string) => {
      setLoading(true);
      clearError();
      
      try {
        const updatedSession = await auditSessionService.closeAuditSession(sessionId, sessionSummary);
        setCurrentSession(updatedSession);
        // Update in sessions list if present
        setSessions(sessions.map(s => s.id === sessionId ? updatedSession : s));
        return updatedSession;
      } catch (error) {
        setError(error.message || 'Failed to close session');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessions]
  );

  const reactivateSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      clearError();
      
      try {
        const updatedSession = await auditSessionService.activateAuditSession(sessionId);
        setCurrentSession(updatedSession);
        // Update in sessions list if present
        setSessions(sessions.map(s => s.id === sessionId ? updatedSession : s));
        return updatedSession;
      } catch (error) {
        setError(error.message || 'Failed to reactivate session');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessions]
  );

  const clearSessionDocuments = useCallback(() => {
    setSessionDocuments([]);
  }, []);

  return {
    // State
    sessions,
    currentSession,
    sessionDocuments,
    isLoading,
    isAddingDocument,
    isRemovingDocument,
    error,
    
    // Actions
    fetchAllSessions,
    fetchUserSessions,
    fetchSessionById,
    fetchSessionsByStatus,
    fetchSessionsByDomain,
    searchSessions,
    createSession,
    fetchSessionDocuments,
    fetchSessionDocumentsSilent,
    addDocumentToSession,
    removeDocumentFromSession,
    removeDocumentFromSessionSilent,
    getAuditSessionHistory,
    getAuditSessionHistorySilent,
    closeSession,
    reactivateSession,
    clearSessionDocuments,
    clearError,
  };
};
