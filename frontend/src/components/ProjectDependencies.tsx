import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Package, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface CustomLibrary {
  _id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

interface ProjectDependenciesProps {
  projectId: string;
  language: string;
  dependencies?: Record<string, string>;
  onDependenciesChange?: (deps: Record<string, string>) => void;
}

const ProjectDependencies: React.FC<ProjectDependenciesProps> = ({
  projectId,
  language,
  dependencies = {},
  onDependenciesChange
}) => {
  const [libraries, setLibraries] = useState<CustomLibrary[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newDep, setNewDep] = useState({ name: '', version: '' });

  useEffect(() => {
    loadLibraries();
  }, [projectId]);

  const loadLibraries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}/libraries`);
      setLibraries(response.data.libraries || []);
    } catch (err: any) {
      console.error('Failed to load libraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.jar', '.whl', '.so', '.dll', '.dylib', '.a', '.lib', '.tar.gz', '.zip'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.some(allowed => file.name.toLowerCase().endsWith(allowed))) {
      setError(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('library', file);

      const response = await axios.post(
        `/api/projects/${projectId}/libraries`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(`Successfully uploaded ${file.name}`);
      await loadLibraries();
      event.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload library');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLibrary = async (libraryId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      setError(null);
      await axios.delete(`/api/projects/${projectId}/libraries/${libraryId}`);
      setSuccess(`Successfully deleted ${name}`);
      await loadLibraries();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete library');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('This will force reinstallation of all dependencies on next run. Continue?')) return;

    try {
      setError(null);
      await axios.post(`/api/projects/${projectId}/dependencies/clear-cache`);
      setSuccess('Dependency cache cleared successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear cache');
    }
  };

  const handleAddDependency = () => {
    if (!newDep.name.trim()) return;

    const updated = {
      ...dependencies,
      [newDep.name.trim()]: newDep.version.trim() || '*'
    };

    onDependenciesChange?.(updated);
    setNewDep({ name: '', version: '' });
  };

  const handleRemoveDependency = (name: string) => {
    const updated = { ...dependencies };
    delete updated[name];
    onDependenciesChange?.(updated);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPackageManagerName = () => {
    switch (language) {
      case 'python': return 'pip';
      case 'javascript': return 'npm';
      case 'java': return 'Maven';
      case 'cpp': return 'Conan';
      default: return 'Package Manager';
    }
  };

  const getLibraryTypeHelp = () => {
    switch (language) {
      case 'python': return '.whl (wheel files)';
      case 'javascript': return '.tar.gz (npm packages)';
      case 'java': return '.jar (Java archives)';
      case 'cpp': return '.so, .a (shared/static libraries)';
      default: return 'library files';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Package Dependencies</h3>
          </div>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear dependency cache and force reinstall"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Manage {getPackageManagerName()} dependencies for your project. Dependencies are cached after first installation.
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Package name"
              value={newDep.name}
              onChange={(e) => setNewDep({ ...newDep, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddDependency()}
            />
            <input
              type="text"
              placeholder="Version (optional)"
              value={newDep.version}
              onChange={(e) => setNewDep({ ...newDep, version: e.target.value })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddDependency()}
            />
            <button
              onClick={handleAddDependency}
              disabled={!newDep.name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>

          {Object.keys(dependencies).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(dependencies).map(([name, version]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="text-sm text-gray-500">{version}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDependency(name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove dependency"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No dependencies added yet
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Custom Libraries</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload custom library files ({getLibraryTypeHelp()}) that aren't available in package managers.
        </p>

        <div className="mb-4">
          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                JAR, WHL, SO, DLL, or other library files (max 50MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".jar,.whl,.so,.dll,.dylib,.a,.lib,.tar.gz,.zip"
            />
          </label>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading libraries...</p>
          </div>
        ) : libraries.length > 0 ? (
          <div className="space-y-2">
            {libraries.map((lib) => (
              <div
                key={lib._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600 uppercase">
                      {lib.fileType}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{lib.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(lib.size)} • Uploaded {new Date(lib.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLibrary(lib._id, lib.originalName)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Delete library"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No custom libraries uploaded yet</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Dependencies are installed once and cached for future runs</li>
              <li>Custom libraries are automatically included in your project's classpath/path</li>
              <li>Clear cache if you need to force reinstallation</li>
              <li>Changes to dependencies will trigger automatic reinstallation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDependencies;
