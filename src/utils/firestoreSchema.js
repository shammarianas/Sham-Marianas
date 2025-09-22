// Central Firestore schema used by seeding utilities
// This file enumerates the collections and example minimal documents aligned with the UI

export const firestoreSchema = {
  Assets: [
    {
      title: "Sample 3D Model",
      thumbnail: "https://example.com/thumbnail.jpg",
      description: "Demo asset seeded for setup",
      is3d: true,
      price: 0,
      discount: 0,
      category: "Characters",
      type: "models",
      tags: ["demo", "sample"],
      date: new Date(),
      userId: "seed",
      vertices: 0,
      textures: true,
      materials: true,
      uvMapping: true,
      rigged: false,
      animated: false,
      vrArLowPoly: false,
      resolution: "",
      physicalSize: "",
      lods: 0,
    },
  ],
  blogs: [
    {
      title: "Welcome to the Blog",
      content: "This is a sample blog post.",
      createdAt: new Date(),
      updatedAt: new Date(),
      author: "seed",
      status: "published",
      coverImageUrl: "",
      featuredImageUrl: "",
    },
  ],
  projects: [
    {
      title: "Sample Project",
      category: "design",
      client: "Demo Client",
      startDate: new Date().toISOString().substring(0, 10),
      designer: "seed",
      challengeTitle: "The Challenge",
      challengeDescription: "",
      description: "Seeded project for layout",
      descriptionImgUrls: [],
      coverImgUrl: "",
      featureImgUrl: "",
      createdAt: new Date(),
      status: "published",
      featured: false,
    },
  ],
  Groups: [
    {
      name: "General",
      description: "Default group",
      createdAt: new Date(),
      users: [],
    },
  ],
  Profiles: [
    {
      // Note: when seeding, the document id should be the authenticated user's uid
      displayName: "Seed Admin",
      email: "admin@example.com",
      uid: "seed",
      role: "admin",
      status: "active",
      createdAt: new Date(),
      purchases: [],
      library: [],
    },
  ],
  // Subcollections are created implicitly when adding documents
  // Profiles/{uid}/favorites, downloads, purchases, Support, and nested Replies
};

export const subcollections = {
  favorites: () => ({ added_at: new Date() }),
  downloads: () => ({ downloaded_at: new Date() }),
  purchases: () => ({ purchasedAt: new Date(), status: "completed" }),
  Support: () => ({ subject: "Hello", description: "Seed ticket", createdAt: new Date(), status: "open" }),
  Replies: () => ({ sender: "admin", message: "Thanks for contacting us", createdAt: new Date() }),
};

export default firestoreSchema;
