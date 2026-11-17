import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

let publishedProjectsCache = null;
let publishedProjectsRequest = null;

export function getPublishedProjects() {
  if (publishedProjectsCache) return Promise.resolve(publishedProjectsCache);

  if (!publishedProjectsRequest) {
    const projectsQuery = query(
      collection(db, "projects"),
      where("status", "==", "published")
    );

    publishedProjectsRequest = getDocs(projectsQuery)
      .then((querySnapshot) => {
        publishedProjectsCache = querySnapshot.docs.map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }));
        return publishedProjectsCache;
      })
      .catch((error) => {
        publishedProjectsRequest = null;
        throw error;
      });
  }

  return publishedProjectsRequest;
}

export async function getPublishedProject(identifier) {
  const projectSnapshot = await getDoc(doc(db, "projects", identifier));

  if (projectSnapshot.exists()) {
    const project = { id: projectSnapshot.id, ...projectSnapshot.data() };
    return project.status === "published" ? project : null;
  }

  const slugQuery = query(
    collection(db, "projects"),
    where("slug", "==", identifier)
  );
  const slugSnapshot = await getDocs(slugQuery);
  const matchingProject = slugSnapshot.docs.find(
    (projectDoc) => projectDoc.data().status === "published"
  );

  return matchingProject
    ? { id: matchingProject.id, ...matchingProject.data() }
    : null;
}
