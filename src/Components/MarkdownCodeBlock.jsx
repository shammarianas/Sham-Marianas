import SyntaxHighlighter from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownCodeBlock = ({ language, children, ...props }) => (
  <SyntaxHighlighter
    style={materialDark}
    language={language}
    PreTag="div"
    {...props}
  >
    {children}
  </SyntaxHighlighter>
);

export default MarkdownCodeBlock;
