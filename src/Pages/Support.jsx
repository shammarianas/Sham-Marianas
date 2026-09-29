import { useState, useEffect } from "react";
import { useUser } from "../Context/UserProvider";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  query,
  setDoc,
  where,
  getDocs,
} from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import plus_icon from "../assets/Icons/upload.jpg";
import DescriptionBox from "../Components/DescriptionBox";
import SEO from "../common/SEO";
import { SEO_CONFIG } from "../utils/seoConfig";

const Support = () => {
  const { currentUser } = useUser();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isContributor, setIsContributor] = useState(false);

  // Check if user is contributor
  useEffect(() => {
    const checkContributorStatus = async () => {
      if (currentUser?.uid) {
        try {
          const contributorDoc = await getDoc(
            doc(db, "Contributors", currentUser.uid)
          );
          setIsContributor(contributorDoc.exists());
        } catch (error) {
          console.error("Error checking contributor status:", error);
        }
      }
    };
    checkContributorStatus();
  }, [currentUser]);

  // ✅ Function to generate unique complaint ID
  const generateComplaintId = async () => {
    const prefix = isContributor ? "CO" : "US";

    // Get current counter from Firestore or start from 1
    const counterRef = doc(db, "Counters", "supportComplaints");

    try {
      const counterDoc = await getDoc(counterRef);
      let currentCount = 1;

      if (counterDoc.exists()) {
        currentCount = counterDoc.data().count + 1;
        await setDoc(counterRef, { count: currentCount });
      } else {
        await setDoc(counterRef, { count: currentCount });
      }

      // Format: US/CO + timestamp + 4-digit sequential number
      const timestamp = Date.now();
      const sequentialNumber = currentCount.toString().padStart(4, '0');
      return `${prefix}-${timestamp}-${sequentialNumber}`;

    } catch (error) {
      console.error("Error generating complaint ID:", error);
      // Fallback: timestamp + random number
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      return `${prefix}-${timestamp}-${randomNum.toString().padStart(4, '0')}`;
    }
  };

  // 🔹 Saves a second readable copy for Admin Panel
  const saveAdminSupportCopy = async (data, notificationId) => {
    try {
      await setDoc(
        doc(collection(db, "SupportNotifications"), notificationId),
        {
          ...data,
          notificationId,
          createdAt: serverTimestamp(),
        }
      );

      console.log("📌 Admin support copy saved:", notificationId);
    } catch (error) {
      console.error("❌ Error saving admin support copy:", error);
    }
  };

  // ✅ Create admin notification for support complaint
  const createAdminSupportNotification = async (
    supportId,
    complaintId,
    subject,
    userEmail,
    issueType,
    userType
  ) => {
    console.log("🔔 Creating admin notification...", {
      supportId,
      complaintId,
      subject,
      userEmail,
      issueType,
    });

    try {
      // Duplicate prevention
      const existingQuery = query(
        collection(db, "AdminNotifications"),
        where("supportId", "==", supportId)
      );

      const snapshot = await getDocs(existingQuery);
      if (!snapshot.empty) {
        console.log("📝 Notification already exists, skipping duplicate");
        return null;
      }

      const notificationData = {
        type: "support",
        supportId,
        complaintId, // Include complaint ID in notification
        message: `New ${userType} complaint (${complaintId}): "${subject}"`,
        subject,
        userEmail,
        issueType,
        userType,
        read: false,
        status: "pending",
        timestamp: serverTimestamp(),
      };

      // Main notification saved
      const ref = await addDoc(
        collection(db, "AdminNotifications"),
        notificationData
      );

      console.log("✅ Notification created:", ref.id);

      // Save copy for Admin panel
      await saveAdminSupportCopy(notificationData, ref.id);

      return ref.id;
    } catch (error) {
      console.error("❌ Error creating admin notification:", error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject || !description || !issueType) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userType = isContributor ? "contributor" : "regular";

      // ✅ Generate unique complaint ID
      const complaintId = await generateComplaintId();

      console.log("📝 Generated Complaint ID:", complaintId);

      // 1️⃣ Save complaint in user's Support subcollection with complaintId
      const userSupportRef = await addDoc(
        collection(db, `Profiles/${currentUser.uid}/Support`),
        {
          userId: currentUser.uid,
          email: currentUser.email,
          complaintId, // Include unique complaint ID
          subject,
          description,
          issueType,
          file: file ? file.name : "",
          createdAt: serverTimestamp(),
          userType: userType,
          status: "pending",
        }
      );

      console.log("✅ Support complaint saved with ID:", userSupportRef.id, "Complaint ID:", complaintId);

      // 2️⃣ ALSO save complaint in Contributors collection if user is a contributor
      if (isContributor) {
        await addDoc(
          collection(db, `Contributors/${currentUser.uid}/Support`),
          {
            userId: currentUser.uid,
            email: currentUser.email,
            complaintId, // Include unique complaint ID
            subject,
            description,
            issueType,
            file: file ? file.name : "",
            createdAt: serverTimestamp(),
            userType: userType,
            status: "pending",
          }
        );
      }

      // ✅ Create admin notification with complaintId
      await createAdminSupportNotification(
        userSupportRef.id,
        complaintId,
        subject,
        currentUser.email,
        issueType,
        userType
      );

      // Show success message with complaint ID
      alert(`Your report has been submitted successfully!\n\nComplaint ID: ${complaintId}\n\nPlease save this ID for future reference.`);

      setSubject("");
      setDescription("");
      setIssueType("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(
        "We encountered an issue while submitting your report. Please try again."
      );
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <>
     <SEO {...SEO_CONFIG.helpCenter} />
      {currentUser ? (
        <div className="page_content support-page">
          <div className="support_section">
            <form onSubmit={handleSubmit} className="support_form">
              <PageTitle title="Report an Issue" />

              <div className="form_content">
                <div className="form_left">
                  <div className="form_group">
                    <label htmlFor="subject" className="form_label">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Brief description of your issue"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="form_input"
                    />
                  </div>

                  <div className="form_group">
                    <label htmlFor="issueType" className="form_label">
                      Issue Type
                    </label>
                    <select
                      id="issueType"
                      name="issueType"
                      required
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="form_select"
                    >
                      <option value="" disabled>
                        Select the type of issue
                      </option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Issue</option>
                      <option value="general">General Inquiry</option>
                      {isContributor && (
                        <>
                          <option value="content_approval">
                            Content Approval
                          </option>
                          <option value="earnings">Earnings Issue</option>
                          <option value="account_verification">
                            Account Verification
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form_group">
                    <label className="form_label">Attachment (Optional)</label>
                    <div className="file_upload_container">
                      <input
                        type="file"
                        name="file"
                        id="file"
                        onChange={handleFileChange}
                        className="file_input"
                      />
                      <label htmlFor="file" className="file_upload_label">
                        <img
                          className="upload_icon"
                          src={plus_icon}
                          alt="Upload"
                        />
                        <span className="file_placeholder">
                          {file ? file.name : "Choose file to attach"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form_right">
                  <div className="form_group">
                    <label htmlFor="description" className="form_label">
                      Description
                    </label>
                    <DescriptionBox
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        isContributor
                          ? "Please provide detailed information about your issue. As a contributor, you can mention specific concerns about your content, earnings, or account status..."
                          : "Please provide detailed information about your issue..."
                      }
                      className="description_box"
                    />
                  </div>
                </div>
              </div>

              <div className="form_actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit_button"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="auth_required_message">
            <h2>Authentication Required</h2>
            <p>Please log in to report an issue or get support.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Support;