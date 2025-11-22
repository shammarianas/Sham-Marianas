import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useUser } from "../Context/UserProvider";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import plus_icon from "../assets/Icons/upload.jpg";
import DescriptionBox from "../Components/DescriptionBox";

const Support = () => {
  const { currentUser } = useUser();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isContributor, setIsContributor] = useState(false);

  // ✅ CHECK IF USER IS CONTRIBUTOR
  useEffect(() => {
    const checkContributorStatus = async () => {
      if (currentUser?.uid) {
        try {
          const contributorDoc = await getDoc(doc(db, "Contributors", currentUser.uid));
          setIsContributor(contributorDoc.exists());
        } catch (error) {
          console.error("Error checking contributor status:", error);
        }
      }
    };

    checkContributorStatus();
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject || !description || !issueType) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `Profiles/${currentUser.uid}/Support`), {
        userId: currentUser.uid,
        email: currentUser.email,
        subject,
        description,
        issueType,
        file: file ? file.name : "",
        createdAt: serverTimestamp(),
        userType: isContributor ? "contributor" : "regular", // ✅ ADD USER TYPE
        status: "pending"
      });
      alert("Your report has been submitted successfully!");
      setSubject("");
      setDescription("");
      setIssueType("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("We encountered an issue while submitting your report. Please try again.");
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
      <Helmet>
        <title>Support | Shammarianas</title>
        <meta name="description" content="Get support and report issues to Shammarianas" />
      </Helmet>

      {currentUser ? (
        <div className="page_content support-page">
          

          <div className="support_section">
            <form onSubmit={handleSubmit} className="support_form">
              <PageTitle title="Report an Issue" />
              
              <div className="form_content">
                <div className="form_left">
                  <div className="form_group">
                    <label htmlFor="subject" className="form_label">Subject</label>
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
                    <label htmlFor="issueType" className="form_label">Issue Type</label>
                    <select
                      id="issueType"
                      name="issueType"
                      required
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="form_select"
                    >
                      <option value="" disabled>Select the type of issue</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Issue</option>
                      <option value="general">General Inquiry</option>
                      {/* ✅ ADDITIONAL OPTIONS FOR CONTRIBUTORS */}
                      {isContributor && (
                        <>
                          <option value="content_approval">Content Approval</option>
                          <option value="earnings">Earnings Issue</option>
                          <option value="account_verification">Account Verification</option>
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
                        <img className="upload_icon" src={plus_icon} alt="Upload" />
                        <span className="file_placeholder">
                          {file ? file.name : "Choose file to attach"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form_right">
                  <div className="form_group">
                    <label htmlFor="description" className="form_label">Description</label>
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