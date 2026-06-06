import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LogOut,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Photo } from "../types";

export default function AdminDashboard() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Upload Form State
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchPhotos();
  }, [navigate]);

  const fetchPhotos = async () => {
    try {
      // Fetch a large limit for the admin dashboard to see all photos easily
      const res = await fetch("/api/photos?limit=1000");
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

const getOptimizedUrl = (url: string, width: number = 800) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/')) {
    // Prevent double replacing if already optimized
    if (url.includes('f_auto')) return url;
    return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
  }
  return url;
};

  const handleUpload = async () => {
    console.log("Upload button clicked. Selected file:", selectedFile);
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("caption", newCaption);
    formData.append("category", newCategory || "Uncategorized");

    try {
      console.log("Sending POST request to /api/photos...");
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setNewCaption("");
        setNewCategory("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPhotos();
        alert("Photo uploaded successfully!");
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      } else {
        const errData = await res.json().catch(() => null);
        alert(`Upload failed: ${errData?.error || res.statusText}. Please check Server logs or Cloudinary config.`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("An error occurred during upload. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deletingPhotoId) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/photos/${deletingPhotoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== deletingPhotoId));
        setDeletingPhotoId(null);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/photos/${editingPhoto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption: editingPhoto.caption,
          category: editingPhoto.category,
        }),
      });

      if (res.ok) {
        setPhotos(
          photos.map((p) => (p.id === editingPhoto.id ? editingPhoto : p)),
        );
        setEditingPhoto(null);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-neutral-900 font-sans">
      <Helmet>
        <title>Admin Dashboard | Lens & Light</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Topbar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h1 className="font-semibold tracking-tight">Studio Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-neutral-500 hover:text-black transition-colors"
            >
              View Live Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Upload */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-neutral-400" />
              Upload New Photo
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Portraits, Landscapes"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Caption
                </label>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Tell the story behind this shot..."
                  rows={3}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                />
              </div>

              <div
                className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-700">
                  {selectedFile ? selectedFile.name : "Click to select file"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  JPG, PNG up to 10MB
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.heic,.heif"
                className="hidden"
              />

              {selectedFile && newCaption.trim() && newCategory.trim() && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Photo Grid */}
        <div className="flex-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 min-h-[600px]">
            <h2 className="text-lg font-semibold mb-6">
              Manage Collection ({photos.length})
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-24 text-neutral-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layoutId={`photo-${photo.id}`}
                    className="group relative bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200"
                  >
                    <div className="aspect-square overflow-hidden bg-neutral-200">
                      <img
                        src={getOptimizedUrl(photo.url, 400)}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-block px-2 py-1 bg-neutral-200 text-neutral-700 text-xs font-medium rounded-md">
                          {photo.category}
                        </span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingPhoto(photo)}
                            className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingPhotoId(photo.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {photo.caption || (
                          <span className="italic text-neutral-400">
                            No caption
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-semibold">Edit Photo Details</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 mb-4">
                <img
                  src={editingPhoto.url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingPhoto.category}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Caption
                </label>
                <textarea
                  value={editingPhoto.caption}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      caption: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end space-x-3">
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPhotoId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Photo</h3>
              <p className="text-sm text-neutral-500 mb-6">
                Are you sure you want to delete this photo? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingPhotoId(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
