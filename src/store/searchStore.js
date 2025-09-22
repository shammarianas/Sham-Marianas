import { create } from "zustand";

const useSearchStore = create((set) => ({
  searchTerm: "", // The search query
  overlay: false, // Whether to show the overlay

  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }), // Update the search term
  setOverlay: (overlay) => set({ overlay }), // Toggle the overlay
}));

export default useSearchStore;