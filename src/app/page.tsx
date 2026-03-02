'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Alumni, AlumniInsert } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import AlumniForm from '@/components/AlumniForm';

export default function Home() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching alumni:', error);
    } else {
      setAlumni(data || []);
    }
    setLoading(false);
  };

  const handleAddAlumni = async (data: AlumniInsert) => {
    const { error } = await supabase.from('alumni').insert([data]);
    if (error) {
      console.error('Error adding alumni:', error);
      alert('Failed to add alumni');
    } else {
      setShowForm(false);
      fetchAlumni();
    }
  };

  const handleUpdateAlumni = async (data: AlumniInsert) => {
    if (!editingAlumni) return;

    const { error } = await supabase
      .from('alumni')
      .update(data)
      .eq('id', editingAlumni.id);

    if (error) {
      console.error('Error updating alumni:', error);
      alert('Failed to update alumni');
    } else {
      setEditingAlumni(null);
      fetchAlumni();
    }
  };

  const handleDeleteAlumni = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alumni?')) return;

    const { error } = await supabase.from('alumni').delete().eq('id', id);
    if (error) {
      console.error('Error deleting alumni:', error);
      alert('Failed to delete alumni');
    } else {
      fetchAlumni();
    }
  };

  const filteredAlumni = alumni.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-handwritten text-4xl font-bold text-amber-800">
          Hammarskjold Alumni
        </h1>
        <div className="flex gap-4">
          <Link
            href="/wall"
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Wall
          </Link>
          <Link
            href="/yearbook"
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Yearbook
          </Link>
          <Link
            href="/globe"
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Map
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name..."
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Add Alumni
        </button>
      </div>

      {(showForm || editingAlumni) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingAlumni ? 'Edit Alumni' : 'Add New Alumni'}
            </h2>
            <AlumniForm
              alumni={editingAlumni ?? undefined}
              onSubmit={editingAlumni ? handleUpdateAlumni : handleAddAlumni}
              onCancel={() => {
                setShowForm(false);
                setEditingAlumni(null);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No alumni found matching your search.' : 'No alumni yet. Add one to get started!'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlumni.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-lg">{a.name}</h3>
                <p className="text-gray-600 text-sm">
                  {a.year_start === a.year_end
                    ? a.year_start
                    : `${a.year_start} - ${a.year_end}`}
                </p>
                <p className="text-gray-500 text-sm">{a.email}</p>
                {a.location && (
                  <p className="text-gray-500 text-sm">{a.location}</p>
                )}
                {a.linkedin_url && (
                  <a
                    href={a.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAlumni(a)}
                  className="text-gray-500 hover:text-amber-600 p-1"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteAlumni(a.id)}
                  className="text-gray-500 hover:text-red-600 p-1"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
