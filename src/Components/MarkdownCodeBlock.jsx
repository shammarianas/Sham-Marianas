import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import lua from "react-syntax-highlighter/dist/esm/languages/prism/lua";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";

[
  ["bash", bash],
  ["shell", bash],
  ["csharp", csharp],
  ["cs", csharp],
  ["css", css],
  ["go", go],
  ["javascript", javascript],
  ["js", javascript],
  ["json", json],
  ["jsx", jsx],
  ["lua", lua],
  ["markup", markup],
  ["html", markup],
  ["xml", markup],
  ["php", php],
  ["python", python],
  ["py", python],
  ["ruby", ruby],
  ["sql", sql],
  ["tsx", tsx],
  ["typescript", typescript],
  ["ts", typescript],
].forEach(([name, language]) => {
  SyntaxHighlighter.registerLanguage(name, language);
});

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
