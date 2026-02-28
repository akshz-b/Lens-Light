import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Instagram, Twitter, Mail, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "../types";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, photos.length]);

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1);
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const url =
        activeCategory === "All"
          ? "/api/photos"
          : `/api/photos?category=${activeCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setPhotos(data);

      if (activeCategory === "All") {
        const uniqueCategories = Array.from(
          new Set(data.map((p: Photo) => p.category)),
        ) as string[];
        setCategories(["All", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      {/* Header */}
      <header className="py-12 px-6 md:px-12 lg:px-24 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Camera className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter uppercase font-serif italic opacity-90">
            Lens & Light
          </h1>
          <p className="mt-4 text-sm md:text-base text-neutral-400 max-w-xl mx-auto font-mono tracking-wide">
            A curated collection of moments, captured in time.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 border ${
                activeCategory === cat
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </header>

      {/* Gallery Grid */}
      <main className="px-4 md:px-8 lg:px-12 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-neutral-500 py-24 font-mono text-sm">
            No photos found in this category.
          </div>
        ) : (
          <motion.div
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="relative group break-inside-avoid overflow-hidden rounded-sm bg-neutral-900 cursor-pointer"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Photography"}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  {photo.caption && (
                    <p className="text-white font-serif italic text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      "{photo.caption}"
                    </p>
                  )}
                  <p className="text-white/60 text-xs font-mono uppercase tracking-widest mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {photo.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 flex flex-col items-center justify-center space-y-6">
        <div className="flex space-x-6">
          <a
            href="#"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>
        <p className="text-neutral-600 text-xs font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Lens & Light. All rights reserved.
        </p>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-50"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-50 p-4"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-50 p-4"
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image Container */}
            <div 
              className="relative max-w-7xl max-h-[90vh] w-full px-16 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedPhotoIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].caption || "Photography"}
                className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl"
              />
              
              {/* Caption */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center"
              >
                {photos[selectedPhotoIndex].caption && (
                  <p className="text-white font-serif italic text-xl mb-2">
                    "{photos[selectedPhotoIndex].caption}"
                  </p>
                )}
                <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
                  {photos[selectedPhotoIndex].category} &bull; {selectedPhotoIndex + 1} of {photos.length}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
