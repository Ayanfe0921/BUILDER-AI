// import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react'
// import { detectDependencies }  from '../utils/sandpackUtils'
// import { Component, Radius } from 'lucide-react'
// import { useAppContext } from '../context/AppContext';
// import SandpackErrorMonitor from './SandpackErrorMonitor';

// //watch for filesmedits inside sandpack editor and save changes to DB & livestate
// function SandPackFileWatcher({ onLiveFileChange }) {
//   const { sandpack } = useSandpack();
//   const { files } = sandpack;
//   const { activeProject, updateProjectFiles } = useAppContext()

//   const activeProjectRef = useRef(activeProject)

//   useEffect(() => {
//     const project = activeProjectRef.current;
//     if (!project) return;
//     const updatedFiles = {};
//     let hasChanges = false;

//     for (const [path, fileObj] of Object.entries(files)) {
//       const fileCode = fileObj.code;
//       updatedFiles[path] = fileCode;
//       const originalContent = typeof project.files[path] === "string" ? project.files[path] : project.files[path]?.content;
//       if (originalContent !== undefined && originalContent !== fileCode) {
//         hasChanges = true;
//       }
//     }

//     //sync live files to parent
//     onLiveFileChange(updatedFiles)
//     if (hasChanges) {
//       updateProjectFiles(updatedFiles)
//     }

//   }, [files])
//   return null;
// }

// const PreviewPanel = ({ project, activeFile, showCode }) => {

//   const [showErrorOverlay, setShowErrorOverlay] = useState(true)
//   //keep local state of files that updates as user types
//   const [liveFiles, setLiveFiles] = useState(project.files);
//   const [prevProjectKey, setPrevProjectKey] = useState(`${project._id}-${project.version}`)

//   const currentKey = `${project._id}-${project.version}`;
//   if (prevProjectKey !== currentKey) {
//     setPrevProjectKey(currentKey);
//     setLiveFiles(project.files)
//   }


//   const handleLiveFileChange = (newFiles)=>{
//     setLiveFiles((prev)=>{
//       let changed = false;
//       for (const [p, code] of Object.entries(newFiles)) {
//         if (prev[p] !== code){
//           changed = true;
//           break;
//         }
//       }
//       return changed ? newFiles : prev;
//     })
//   }

//   //convert livefiles to sandpack format
//   const sandpackFiles = useMemo(() => {
//     const spFiles = {};
//     for (const [path, context] of Object.entries(liveFiles)) {
//       const fileCode = typeof content === "string" ? content : content?.content || "";
//       spFiles[paths] = {
//         code: fileCode,
//         active: path === activeFile
//       }
//     }
//     return spFiles
//   }, [liveFiles, activeFile])


//   // detect dependencies from import statements using livefile
//   const dependencies = useMemo(() => {
//     return detectDependencies(liveFiles)
//   }, [liveFiles])

//   return (
//     <div className='h-full w-full'>
//       <SandpackProvider key={project._id} template='react'
//         files={sandpackFiles}
//         customSetup={{ dependencies }}
//         options={{
//           externalResources: [
//             "https://cdn.tailwind.com",
//             "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
//           ],
//           classes: {
//             "sp-wrapper": "sp-wrapper",
//             "sp-layout": "sp layout",
//             "sp-preview": "sp-Preview",
//           },
//           logLevel: 0
//         }}
//         theme={{
//           colors: {
//             surface1: "#ffffff",
//             surface2: "#f4f4f5",
//             surface3: "#e4e4e4",
//             clickable: "#71717a",
//             base: "#09090b",
//             disabled: "#a1a1aa",
//             hover: "#18181b",
//             accent: "#18181b",
//             error: "#ef4444",
//             errorSurface: "#fef2f2"
//           },
//           font: {
//             body: "'Urbanist', system-ui, -apple-system, sans-serif",
//             momo: "'Giest momo', ui-Component, monoSpace",
//             size: "13px",
//             lineHeight: "1.6",
//           }
//         }}>

//           <SandPackFileWatcher onLiveFileChange={handleLiveFileChange} />
//           <SandpackCodeEditor onErrorChange={setShowErrorOverlay} />
//           <SandpackLayout 
//           style={{
//             height: "100%",
//             border: "none",
//             borderRadius: 0,
//              background: "transparent",
//           }}>
//             {showCode && (
//               <SandpackCodeEditor showTabs showLineNumbers showInlineErrors 
//               wrapContent style={{ height: "100%", flex: 1, minWidth: 0 }}/>
//             )}

//             <SandpackPreview showNavigator={false} showRefreshButton
//             showOpenInCodeSandbox={false} showSandpackErrorOverlay={showErrorOverlay}
//             style={{height: "100%", flex: showCode ? 1 : 2, minWidth: 0 }}/>
//           </SandpackLayout>



//       </SandpackProvider>

//     </div>
//   )
// }

// export default PreviewPanel

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { 
//   SandpackCodeEditor, 
//   SandpackLayout, 
//   SandpackPreview, 
//   SandpackProvider, 
//   useSandpack 
// } from '@codesandbox/sandpack-react';
// import { detectDependencies } from '../utils/sandpackUtils';
// import { useAppContext } from '../context/AppContext';

// // Watch for file edits inside sandpack editor and save changes to DB & live state
// function SandPackFileWatcher({ onLiveFileChange }) {
//   const { sandpack } = useSandpack();
//   const { files } = sandpack;
//   const { activeProject, updateProjectFiles } = useAppContext();

//   const activeProjectRef = useRef(activeProject);

//   // Keep ref up to date with current active project state
//   useEffect(() => {
//     activeProjectRef.current = activeProject;
//   }, [activeProject]);

//   useEffect(() => {
//     const project = activeProjectRef.current;
//     if (!project || !project.files) return;

//     const updatedFiles = {};
//     let hasChanges = false;

//     for (const [path, fileObj] of Object.entries(files)) {
//       const fileCode = fileObj.code;
//       updatedFiles[path] = fileCode;
      
//       const originalContent = typeof project.files[path] === "string" 
//         ? project.files[path] 
//         : project.files[path]?.content;

//       if (originalContent !== undefined && originalContent !== fileCode) {
//         hasChanges = true;
//       }
//     }

//     // Sync live files to parent
//     onLiveFileChange(updatedFiles);

//     if (hasChanges) {
//       updateProjectFiles(updatedFiles);
//     }
//   }, [files, updateProjectFiles, onLiveFileChange]);

//   return null;
// }

// const PreviewPanel = ({ project, activeFile, showCode }) => {
//   const [showErrorOverlay, setShowErrorOverlay] = useState(true);
//   const [liveFiles, setLiveFiles] = useState(project?.files || {});
//   const [prevProjectKey, setPrevProjectKey] = useState(`${project?._id}-${project?.version}`);

//   const currentKey = `${project?._id}-${project?.version}`;
//   if (prevProjectKey !== currentKey) {
//     setPrevProjectKey(currentKey);
//     setLiveFiles(project?.files || {});
//   }

//   const handleLiveFileChange = (newFiles) => {
//     setLiveFiles((prev) => {
//       let changed = false;
//       for (const [p, code] of Object.entries(newFiles)) {
//         if (prev[p] !== code) {
//           changed = true;
//           break;
//         }
//       }
//       return changed ? newFiles : prev;
//     });
//   };

//   // Convert liveFiles to Sandpack format 
//   const sandpackFiles = useMemo(() => {
//     const spFiles = {};
//     for (const [path, content] of Object.entries(liveFiles)) {
//       const fileCode = typeof content === "string" ? content : content?.content || "";
//       spFiles[path] = {
//         code: fileCode,
//         active: path === activeFile
//       };
//     }
//     return spFiles;
//   }, [liveFiles, activeFile]);

//   // Detect dependencies from import statements using liveFiles
//   const dependencies = useMemo(() => {
//     return detectDependencies(liveFiles);
//   }, [liveFiles]);

//   if (!project) return null;

//   return (
//     <div className="h-full w-full min-h-[500px]">
//       <SandpackProvider 
//         key={project._id} 
//         template="react"
//         files={sandpackFiles}
//         customSetup={{ dependencies }}
//         options={{
//           externalResources: [
//             "https://cdn.tailwindcss.com",
//             "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
//           ],
//           classes: {
//             "sp-wrapper": "sp-wrapper h-full",
//             "sp-layout": "sp-layout h-full",
//             "sp-preview": "sp-preview h-full",
//           },
//           logLevel: 0
//         }}
//         theme={{
//           colors: {
//             surface1: "#ffffff",
//             surface2: "#f4f4f5",
//             surface3: "#e4e4e4",
//             clickable: "#71717a",
//             base: "#09090b",
//             disabled: "#a1a1aa",
//             hover: "#18181b",
//             accent: "#18181b",
//             error: "#ef4444",
//             errorSurface: "#fef2f2"
//           },
//           font: {
//             body: "'Urbanist', system-ui, -apple-system, sans-serif",
//             mono: "'Geist Mono', ui-monospace, monospace",
//             size: "13px",
//             lineHeight: "1.6",
//           }
//         }}
//       >
//         <SandPackFileWatcher onLiveFileChange={handleLiveFileChange} />
//         <sandpackErrorMonitor onErrorChange={setShowErrorOverlay} />
//         <SandpackLayout 
//           style={{
//             height: "100%",
//             border: "none",
//             borderRadius: 0,
//             background: "transparent",
//           }}
//         >
//           {showCode && (
//             <SandpackCodeEditor 
//               showTabs 
//               showLineNumbers 
//               showInlineErrors 
//               wrapContent 
//               style={{ height: "100%", flex: 1, minWidth: 0 }}
//             />
//           )}

//           <SandpackPreview 
//             showNavigator={false} 
//             showRefreshButton
//             showOpenInCodeSandbox={false} 
//             showSandpackErrorOverlay={showErrorOverlay}
//             style={{ height: "100%", flex: showCode ? 1 : 2, minWidth: 0 }}
//           />
//         </SandpackLayout>
//       </SandpackProvider>
//     </div>
//   );
// };

// export default PreviewPanel;

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { 
//   SandpackCodeEditor, 
//   SandpackLayout, 
//   SandpackPreview, 
//   SandpackProvider, 
//   useSandpack 
// } from '@codesandbox/sandpack-react';
// import { detectDependencies } from '../utils/sandpackUtils';
// import { useAppContext } from '../context/AppContext';

// // Watch for file edits inside sandpack editor and save changes to DB & live state
// function SandPackFileWatcher({ onLiveFileChange }) {
//   const { sandpack } = useSandpack();
//   const { files } = sandpack;
//   const { activeProject, updateProjectFiles } = useAppContext();

//   const activeProjectRef = useRef(activeProject);

//   // Keep ref up to date with current active project state
//   useEffect(() => {
//     activeProjectRef.current = activeProject;
//   }, [activeProject]);

//   useEffect(() => {
//     const project = activeProjectRef.current;
//     if (!project || !project.files) return;

//     const updatedFiles = {};
//     let hasChanges = false;

//     for (const [path, fileObj] of Object.entries(files)) {
//       const fileCode = fileObj.code;
//       updatedFiles[path] = fileCode;
      
//       const originalContent = typeof project.files[path] === "string" 
//         ? project.files[path] 
//         : project.files[path]?.content;

//       if (originalContent !== undefined && originalContent !== fileCode) {
//         hasChanges = true;
//       }
//     }

//     // Sync live files to parent
//     onLiveFileChange(updatedFiles);

//     if (hasChanges) {
//       updateProjectFiles(updatedFiles);
//     }
//   }, [files, updateProjectFiles, onLiveFileChange]);

//   return null;
// }

// const PreviewPanel = ({ project, activeFile, showCode }) => {
//   const [showErrorOverlay] = useState(true);
//   const [liveFiles, setLiveFiles] = useState(project?.files || {});
//   const [prevProjectKey, setPrevProjectKey] = useState(`${project?._id}-${project?.version}`);

//   const currentKey = `${project?._id}-${project?.version}`;
//   if (prevProjectKey !== currentKey) {
//     setPrevProjectKey(currentKey);
//     setLiveFiles(project?.files || {});
//   }

//   const handleLiveFileChange = (newFiles) => {
//     setLiveFiles((prev) => {
//       let changed = false;
//       for (const [p, code] of Object.entries(newFiles)) {
//         if (prev[p] !== code) {
//           changed = true;
//           break;
//         }
//       }
//       return changed ? newFiles : prev;
//     });
//   };

//   // Convert liveFiles to Sandpack format 
//   const sandpackFiles = useMemo(() => {
//     const spFiles = {};
//     for (const [path, content] of Object.entries(liveFiles)) {
//       const fileCode = typeof content === "string" ? content : content?.content || "";
//       spFiles[path] = {
//         code: fileCode,
//         active: path === activeFile
//       };
//     }
//     return spFiles;
//   }, [liveFiles, activeFile]);

//   // Detect dependencies from import statements using liveFiles
//   const dependencies = useMemo(() => {
//     return detectDependencies(liveFiles);
//   }, [liveFiles]);

//   if (!project) return null;

//   return (
//     <div className="h-full w-full min-h-[500px]">
//       <SandpackProvider 
//         key={project._id} 
//         template="react"
//         files={sandpackFiles}
//         customSetup={{ dependencies }}
//         options={{
//           externalResources: [
//             "https://cdn.tailwindcss.com",
//             "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
//           ],
//           classes: {
//             "sp-wrapper": "sp-wrapper h-full",
//             "sp-layout": "sp-layout h-full",
//             "sp-preview": "sp-preview h-full",
//           },
//           logLevel: 0
//         }}
//         theme={{
//           colors: {
//             surface1: "#ffffff",
//             surface2: "#f4f4f5",
//             surface3: "#e4e4e4",
//             clickable: "#71717a",
//             base: "#09090b",
//             disabled: "#a1a1aa",
//             hover: "#18181b",
//             accent: "#18181b",
//             error: "#ef4444",
//             errorSurface: "#fef2f2"
//           },
//           font: {
//             body: "'Urbanist', system-ui, -apple-system, sans-serif",
//             mono: "'Geist Mono', ui-monospace, monospace",
//             size: "13px",
//             lineHeight: "1.6",
//           }
//         }}
//       >
//         <SandPackFileWatcher onLiveFileChange={handleLiveFileChange} />
        
//         <SandpackLayout 
//           style={{
//             height: "100%",
//             border: "none",
//             borderRadius: 0,
//             background: "transparent",
//           }}
//         >
//           {showCode && (
//             <SandpackCodeEditor 
//               showTabs 
//               showLineNumbers 
//               showInlineErrors 
//               wrapContent 
//               style={{ height: "100%", flex: 1, minWidth: 0 }}
//             />
//           )}

//           <SandpackPreview 
//             showNavigator={false} 
//             showRefreshButton
//             showOpenInCodeSandbox={false} 
//             showSandpackErrorOverlay={showErrorOverlay}
//             style={{ height: "100%", flex: showCode ? 1 : 2, minWidth: 0 }}
//           />
//         </SandpackLayout>
//       </SandpackProvider>
//     </div>
//   );
// };

// export default PreviewPanel;

// 

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  SandpackCodeEditor, 
  SandpackLayout, 
  SandpackPreview, 
  SandpackProvider, 
  useSandpack 
} from '@codesandbox/sandpack-react';
import { detectDependencies } from '../utils/sandpackUtils';
import { useAppContext } from '../context/AppContext';

function SandPackFileWatcher({ liveFiles, onLiveFileChange }) {
  const { sandpack } = useSandpack();
  const { files } = sandpack;
  const { activeProject, updateProjectFiles } = useAppContext();

  const activeProjectRef = useRef(activeProject);

  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  useEffect(() => {
    const project = activeProjectRef.current;
    if (!project || !project.files) return;

    const updatedFiles = {};
    let hasLiveChanges = false;
    let hasDbChanges = false;

    for (const [path, fileObj] of Object.entries(files)) {
      const fileCode = fileObj.code;
      updatedFiles[path] = fileCode;
      
      const currentLiveContent = typeof liveFiles[path] === "string" 
        ? liveFiles[path] 
        : liveFiles[path]?.content;

      if (currentLiveContent !== fileCode) {
        hasLiveChanges = true;
      }

      const originalContent = typeof project.files[path] === "string" 
        ? project.files[path] 
        : project.files[path]?.content;

      if (originalContent !== undefined && originalContent !== fileCode) {
        hasDbChanges = true;
      }
    }

    if (hasLiveChanges) {
      onLiveFileChange(updatedFiles);
    }

    if (hasDbChanges) {
      updateProjectFiles(updatedFiles);
    }
  }, [files, liveFiles, updateProjectFiles, onLiveFileChange]);

  return null;
}

const PreviewPanel = ({ project, activeFile, showCode }) => {
  const [showErrorOverlay] = useState(true);
  const [liveFiles, setLiveFiles] = useState(project?.files || {});

  const projectKey = `${project?._id}-${project?.version}`;
  useEffect(() => {
    if (project?.files) {
      setLiveFiles(project.files);
    }
  }, [projectKey]);

  const handleLiveFileChange = (newFiles) => {
    setLiveFiles(newFiles);
  };

  // Convert liveFiles to Sandpack format and guarantee index.js exists
  const sandpackFiles = useMemo(() => {
    const spFiles = {};
    for (const [path, content] of Object.entries(liveFiles)) {
      const fileCode = typeof content === "string" ? content : content?.content || "";
      spFiles[path] = {
        code: fileCode,
        active: path === activeFile
      };
    }

    // Auto-inject entry point if missing from legacy project files
    if (!spFiles["/index.js"]) {
      spFiles["/index.js"] = {
        code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
        hidden: true
      };
    }

    return spFiles;
  }, [liveFiles, activeFile]);

  const dependencies = useMemo(() => {
    return detectDependencies(liveFiles);
  }, [liveFiles]);

  if (!project) return null;

  return (
    <div className="h-full w-full min-h-[500px]">
      <SandpackProvider 
        key={project._id} 
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          externalResources: [],
          classes: {
            "sp-wrapper": "sp-wrapper h-full",
            "sp-layout": "sp-layout h-full",
            "sp-preview": "sp-preview h-full",
          },
          logLevel: 0
        }}
        theme={{
          colors: {
            surface1: "#ffffff",
            surface2: "#f4f4f5",
            surface3: "#e4e4e4",
            clickable: "#71717a",
            base: "#09090b",
            disabled: "#a1a1aa",
            hover: "#18181b",
            accent: "#18181b",
            error: "#ef4444",
            errorSurface: "#fef2f2"
          },
          font: {
            body: "'Urbanist', system-ui, -apple-system, sans-serif",
            mono: "'Geist Mono', ui-monospace, monospace",
            size: "13px",
            lineHeight: "1.6",
          }
        }}
      >
        <SandPackFileWatcher liveFiles={liveFiles} onLiveFileChange={handleLiveFileChange} />
        
        <SandpackLayout 
          style={{
            height: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          {showCode && (
            <SandpackCodeEditor 
              showTabs 
              showLineNumbers 
              showInlineErrors 
              wrapContent 
              style={{ height: "100%", flex: 1, minWidth: 0 }}
            />
          )}

          <SandpackPreview 
            showNavigator={false} 
            showRefreshButton
            showOpenInCodeSandbox={false} 
            showSandpackErrorOverlay={showErrorOverlay}
            style={{ height: "100%", flex: showCode ? 1 : 2, minWidth: 0 }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default PreviewPanel;