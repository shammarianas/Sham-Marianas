rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== Helper Functions =====
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && (
        // Bootstrap Admin
        request.auth.token.email.toLowerCase() == "admin@shammarianas.com" ||
        // Dynamic admin check using adminUsers collection
        exists(/databases/$(database)/documents/adminUsers/$(request.auth.token.email.toLowerCase()))
      );
    }
    
    function isOwnerOrAdmin(userId) {
      return isAuthenticated() && (
        request.auth.uid == userId ||
        isAdmin()
      );
    }
    
    // ===== Assets Collection =====
    match /Assets/{assetId} {
      allow get, list: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (
        // Owner can modify their own assets
        resource.data.userId == request.auth.uid ||
        // Admin can modify any asset
        isAdmin()
      );
    }
    
    // ===== Profiles Collection and Subcollections =====
    match /Profiles/{profileId} {
      allow get, list: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (
        // User updating their own profile
        resource.data.uid == request.auth.uid ||
        // Admin can update any profile
        isAdmin()
      );
      
      // Subcollections under profiles
      match /{subCollection}/{docId} {
        allow create, read, update, delete: if isOwnerOrAdmin(profileId);
      }
    }
    
    // ===== Projects Collection (Public Access) =====
    match /projects/{projectId} {
      allow read, write: if true;
    }
    
    // ===== Blogs Collection (Public Access) =====
    match /blogs/{blogId} {
      allow read, write: if true;
    }
    
    // ===== AdminUsers Collection =====
    match /adminUsers/{email} {
      allow get, list: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // ===== Catch-all Admin Override (Optional - Use with caution) =====
    // Uncomment the following rule if you want admins to have unrestricted access to ALL collections
    // This provides a safety net but should be used carefully in production
    /*
    match /{document=**} {
      allow read, write: if isAdmin();
    }
    */
  }
}