import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useUser } from "../Context/UserProvider";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject || !description || !issueType) {
      alert("All fields are required!");
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
        file: file ? file.name : "", // Adjust for actual file handling
        createdAt: serverTimestamp(),
      });
      alert("Report submitted successfully!");
      setSubject("");
      setDescription("");
      setIssueType("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Support | Shammarianas</title>
        <meta name="description" content="Report your Issue to Shammarianas" />
      </Helmet>

      {currentUser ? (
        <div className="page_content">
          <div className="upload_section">
            <form onSubmit={handleSubmit}>
              <PageTitle title="Report an Issue" />
              <div className="content">
                <div className="left">
                  <input
                    name="subject"
                    placeholder="Subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <input
                    type="file"
                    name="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label className="thumbnail_input_label">
                    <img className="upload_icon" src={plus_icon} alt="" />
                    <span className="placeholder">
                      {file ? file.name : "Choose Report"}
                    </span>
                  </label>
                </div>
                <div className="right">
                  <DescriptionBox
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <select
                    name="issueType"
                    required
                    className="select_field"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Issue Type
                    </option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Issue</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="not_logged_in">
            <h2>Log in to Report an Issue</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Support;
