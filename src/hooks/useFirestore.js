// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, deleteDoc, doc, where, getDocs, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// ── Real-time listener for any collection ──────────────────────────────────
export function useCollection(collectionName, constraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = collection(db, collectionName);
    const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return unsub;
  }, [collectionName]);

  return { data, loading, error };
}

// ── Reports (field data entries) ────────────────────────────────────────────
export function useReports() {
  return useCollection('reports');
}

// ── Problems (structured from reports) ──────────────────────────────────────
export function useProblems() {
  return useCollection('problems');
}

// ── Tasks ────────────────────────────────────────────────────────────────────
export function useTasks() {
  return useCollection('tasks');
}

// ── Volunteers (users with field_worker role) ────────────────────────────────
export function useVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'field_worker'));
    const unsub = onSnapshot(q, (snap) => {
      setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { volunteers, loading };
}

// ── CRUD helpers ─────────────────────────────────────────────────────────────
export async function addReport(data) {
  return addDoc(collection(db, 'reports'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
}

export async function addProblem(data) {
  return addDoc(collection(db, 'problems'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'open'
  });
}

export async function createTask(data) {
  return addDoc(collection(db, 'tasks'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'assigned'
  });
}

export async function updateTask(id, data) {
  return updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() });
}

export async function updateProblem(id, data) {
  return updateDoc(doc(db, 'problems', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteReport(id) {
  return deleteDoc(doc(db, 'reports', id));
}

// ── Bulk CSV import ──────────────────────────────────────────────────────────
export async function bulkImportReports(rows) {
  const batch = writeBatch(db);
  rows.forEach(row => {
    const ref = doc(collection(db, 'reports'));
    batch.set(ref, { ...row, createdAt: serverTimestamp(), status: 'pending' });
  });
  return batch.commit();
}

// ── Analytics aggregation ────────────────────────────────────────────────────
export async function getAnalytics() {
  const [reportsSnap, problemsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'reports')),
    getDocs(collection(db, 'problems')),
    getDocs(collection(db, 'tasks'))
  ]);

  const reports = reportsSnap.docs.map(d => d.data());
  const problems = problemsSnap.docs.map(d => d.data());
  const tasks = tasksSnap.docs.map(d => d.data());

  // Area → count
  const areaMap = {};
  reports.forEach(r => {
    areaMap[r.location] = (areaMap[r.location] || 0) + 1;
  });

  // Problem type distribution
  const typeMap = {};
  reports.forEach(r => {
    typeMap[r.problem] = (typeMap[r.problem] || 0) + 1;
  });

  // Urgency breakdown
  const urgencyMap = { High: 0, Medium: 0, Low: 0 };
  reports.forEach(r => { urgencyMap[r.urgency] = (urgencyMap[r.urgency] || 0) + 1; });

  return {
    totalReports: reports.length,
    totalProblems: problems.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    areaData: Object.entries(areaMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    typeData: Object.entries(typeMap).map(([name, value]) => ({ name, value })),
    urgencyData: Object.entries(urgencyMap).map(([name, value]) => ({ name, value }))
  };
}
