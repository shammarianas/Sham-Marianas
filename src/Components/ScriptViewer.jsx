import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useUser } from "../Context/UserProvider";

const customStyle = {
  ...dracula,
  'pre[class*="language-"]': {
    ...dracula['pre[class*="language-"]'],
    background: "none",
    padding: "0",
    margin: "0",
  },
};

const ScriptViewer = ({ script, scriptName = "", id, price }) => {
  const { currentUser, userProfile } = useUser();
  const [scriptContent, setScriptContent] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  const scriptType = scriptName && scriptName.includes(".")
    ? scriptName.split(".").pop().toLowerCase()
    : "text";

  useEffect(() => {
    if (!script) {
      setLoading(false);
      return;
    }

    const isPurchased =
      price === 0 ||
      (currentUser && userProfile?.purchasedItems?.includes(id));

    setPurchased(isPurchased);

    axios
      .get(script)
      .then((res) => {
        const content = res.data;
        setScriptContent(isPurchased ? content : content.substring(0, 600) + "...");
      })
      .catch(() => {
        setScriptContent("// Failed to load script");
      })
      .finally(() => setLoading(false));
  }, [script, currentUser, userProfile, id, price]);

  const handleCopy = () => {
    if (!purchased || !scriptContent) return;
    navigator.clipboard.writeText(scriptContent);
    const btn = document.querySelector(".copy_btn");
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        btn.innerHTML = '<i class="far fa-copy"></i>';
      }, 3000);
    }
  };

  if (loading) return <div>Loading script...</div>;

  return (
    <div className="script_viewer_main">
      <div className="container">
        {!purchased && (
          <div className="locked_content">
            <i className="icon fas fa-lock"></i>
            <span>Purchase to view full script</span>
          </div>
        )}

        <div className="header">
          <h2>{scriptName || "Untitled Script"}</h2>
          {purchased && (
            <button onClick={handleCopy} className="copy_btn">
              <i className="far fa-copy"></i>
            </button>
          )}
        </div>

        <div className={`code ${purchased ? "" : "locked"}`}>
          <SyntaxHighlighter language={scriptType} style={customStyle}>
            {scriptContent || "// No content"}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default ScriptViewer;