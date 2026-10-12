import React, { useState, useEffect } from 'react';
import { Project } from '../../types/editor';
import { SAMPLE_PHOTOS, SamplePhoto } from '../../constants/samplePhotos';
import {
  getAllProjectsFromDb,
  deleteProjectFromDb,
  saveProjectToDb,
} from '../../storage/projectDb';
import {
  Upload,
  FolderHeart,
  Sparkles,
  Clock,
  Trash2,
  Copy,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

interface Props {
  onLoadProject: (project: Project) => void;
  onLoadSample: (sample: SamplePhoto) => void;
  onImportFile: (file: File) => void;
}

export const LibraryWorkspace: React.FC<Props> = ({
  onLoadProject,
  onLoadSample,
  onImportFile,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'samples'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load offline projects from IndexedDB
  const refreshProjects = async () => {
    try {
      const list = await getAllProjectsFromDb();
      setProjects(list);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this project?')) {
      await deleteProjectFromDb(id);
      await refreshProjects();
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const clone: Project = {
      ...project,
      id: `proj_${Date.now()}`,
      title: `${project.title} (Copy)`,
      updatedAt: Date.now(),
    };
    await saveProjectToDb(clone);
    await refreshProjects();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar: Tabs & Import Button */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl liquid-panel">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'projects'
                ? 'liquid-button-accent shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            My Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'samples'
                ? 'liquid-button-accent shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample Photos
          </button>
        </div>

        {/* Device Photo Upload */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-button text-xs font-semibold text-sky-300 hover:text-white cursor-pointer transition-all">
          <Upload className="w-3.5 h-3.5" />
          Import Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'projects' ? (
          <div>
            {projects.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl liquid-panel border-dashed border-white/15">
                <FolderHeart className="w-10 h-10 text-sky-400/60 mb-2" />
                <h3 className="text-sm font-semibold text-white">No Saved Projects Yet</h3>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Import a photo from your device or open a sample image to start editing. Your adjustments auto-save locally in IndexedDB!
                </p>
                <button
                  onClick={() => setActiveTab('samples')}
                  className="mt-4 px-4 py-2 rounded-xl liquid-button-accent text-xs font-semibold"
                >
                  Browse Curated Samples
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onLoadProject(proj)}
                    className="group relative rounded-2xl overflow-hidden liquid-panel hover:border-sky-400 transition-all cursor-pointer flex flex-col shadow-lg"
                  >
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <img
                        src={proj.thumbnailUrl || proj.originalImageBlobUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicate(e, proj)}
                          title="Duplicate Project"
                          className="p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white backdrop-blur-md"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, proj.id)}
                          title="Delete Project"
                          className="p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-rose-400 backdrop-blur-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white truncate">{proj.title}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(proj.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SAMPLE_PHOTOS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => onLoadSample(sample)}
                className="group relative rounded-2xl overflow-hidden liquid-panel hover:border-sky-400 transition-all cursor-pointer flex flex-col shadow-lg"
              >
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={sample.url}
                    alt={sample.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-sky-300 backdrop-blur-md uppercase tracking-wider">
                    {sample.category}
                  </span>
                </div>

                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-white truncate">{sample.title}</h4>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    Photo by {sample.author}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                    <span>{sample.exif.model}</span>
                    <span>•</span>
                    <span>{sample.exif.lens}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
