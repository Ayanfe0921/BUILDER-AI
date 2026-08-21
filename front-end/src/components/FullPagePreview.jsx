import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { detectDependencies } from '../utils/sandpackUtils';
import React, { useMemo, useState } from 'react'


const FullPagePreview = ({ files }) => {

    const [showErrorOverlay, setShowErrorOverlay] = useState(true);

    // Convert liveFiles to Sandpack format 
    const sandpackFiles = useMemo(() => {
        if (!files) return {};
        const spFiles = {};
        for (const [path, content] of Object.entries(files)) {
            spFiles[path] = { code: content }
        }
        return spFiles;
    }, [files]);

    // Detect dependencies from import statements using liveFiles
    const dependencies = useMemo(() => {
        if (!files)
            return detectDependencies(files);
    }, [liveFiles]);

    if (!project) return null;

    return (
        <div className="h-screen w-screen bg-white overflow-hidden">
            <SandpackProvider
                template="react"
                files={sandpackFiles}
                customSetup={{ dependencies }}
                options={{
                    externalResources: [
                        "https://cdn.tailwindcss.com",
                        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                    ],
                    logLevel: 0
                }}
                className='h-full w-full'>
                <sandpackErrorMonitor  onErrorChange={setShowErrorOverlay} />
                <SandpackLayout
                    className='h-full w-full border-none! bg-transparent'>
                    <SandpackPreview
                        showNavigator={false}
                        showRefreshButton={false}
                        showOpenInCodeSandbox={false}
                        showSandpackErrorOverlay={showErrorOverlay}
                      className='h-full w-full'
                    />
                </SandpackLayout>
            </SandpackProvider>

        </div>
    )
}

export default FullPagePreview

// import React, { useMemo, useState } from 'react';
// import { 
//   SandpackLayout, 
//   SandpackPreview, 
//   SandpackProvider 
// } from '@codesandbox/sandpack-react';
// import { detectDependencies } from '../utils/sandpackUtils';

// const FullPagePreview = ({ files }) => {
//   const [showErrorOverlay] = useState(true);

//   // Convert files to Sandpack format 
//   const sandpackFiles = useMemo(() => {
//     if (!files) return {};
//     const spFiles = {};
//     for (const [path, content] of Object.entries(files)) {
//       const fileCode = typeof content === "string" ? content : content?.content || "";
//       spFiles[path] = { code: fileCode };
//     }
//     return spFiles;
//   }, [files]);

//   // Detect dependencies from import statements using files
//   const dependencies = useMemo(() => {
//     if (!files) return {};
//     return detectDependencies(files);
//   }, [files]);

//   if (!files) return null;

//   return (
//     <div className="h-screen w-screen bg-white overflow-hidden">
//       <SandpackProvider
//         template="react"
//         files={sandpackFiles}
//         customSetup={{ dependencies }}
//         options={{
//           externalResources: [
//             "https://cdn.tailwindcss.com",
//             "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
//           ],
//           logLevel: 0
//         }}
//         className='h-full w-full'
//       >
//         <SandpackLayout className='h-full w-full border-none! bg-transparent'>
//           <SandpackPreview
//             showNavigator={false}
//             showRefreshButton={false}
//             showOpenInCodeSandbox={false}
//             showSandpackErrorOverlay={showErrorOverlay}
//             className='h-full w-full'
//           />
//         </SandpackLayout>
//       </SandpackProvider>
//     </div>
//   );
// };

// export default FullPagePreview;