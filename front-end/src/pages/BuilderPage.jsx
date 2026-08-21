// import React, { useEffect, useState } from 'react'
// import { useAppContext } from '../context/AppContext'
// import { useNavigate, useParams } from 'react-router-dom'
// import Loading from '../components/Loading'
// import BuilderHeader from '../components/BuilderHeader'
// import { MessageSquareIcon, FolderTreeIcon } from 'lucide-react'
// import ChatPanel from '../components/ChatPanel'
// import FileExplorer from '../components/FileExplorer'
// import PreviewPanel from '../components/PreviewPanel'
// import AgentProgressDashboard from '../components/AgentProgressDashboard'
// import PublishModal from '../components/PublishModal'
// import api from '../api/api'
// import toast from 'react-hot-toast'
// import { exportProjectZip } from '../utils/sandpackUtils'
// import { act } from 'react'

// const BuilderPage = () => {

//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [leftTab, setLeftTab] = useState("chat");
//   const [publishing, setPublishing] = useState(false);
//   const [publishUrl, setPublishUrl] = useState(null);

//   const { activeProject, loadingActiveProject, activeFile, showCode, setActiveFile, setShowCode, loadProject, logout, handleChat } = useAppContext();

//   const [chatLoading, setChatLoading] = useState(false)

//   useEffect(() => {
//     if (!id) return;
//     loadProject(id)
//   }, [id])

//   useEffect(() => {
//     if (!id || !activeProject) return;
//     if (activeProject.status === "pending" || activeProject.status === "generating") {
//       const interval = setInterval(() => {
//         loadProject(id, true)
//       }, 1500)
//       return () => clearInterval(interval)
//     }
//   }, [id, loadProject, activeProject])

//   const handleOpenPreview = () => {
//     if (!id) return;
//     window.open(`/preview/${id}`, "_blank")
//   }

//   const handlePublish = async () => {
//    if(!id) return;
//    setPublishing(true)
//    try {
//     await api.post(`/api/projects/${id}/publish`);
//     const url = `${window.location.origin}/publish/${id}`;
//     setPublishUrl(url);
//     toast.success("Website published successfully!")
//    } catch (err) {
//     console.error("publish failed:", err);
//     toast.error(err?.response?.data?.error || "publish failed");
//    }finally{
//     setPublishing(false)
//    }
//   }

//   const handleDownload = () => {
//    if(!activeProject) return;
//    exportProjectZip(activeProject)
//   }

//   if (loadingActiveProject || !activeProject) {
//     return <Loading />
//   }

//   return (
//     <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative'>
//       {/* Top Bar Header */}
//       <BuilderHeader
//         projectName={activeProject.name}
//         version={activeProject.version}
//         showCode={showCode}
//         publishing={publishing}
//         onToggleShowCode={() => setShowCode(!showCode)}
//         onOpenPreview={handleOpenPreview}
//         onPublish={handlePublish}
//         onDownload={handleDownload}
//         onBack={() => navigate("/")}
//         onLogout={logout} />

//       {/* Main Layout */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* left sidebar */}
//         <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
//           {/* Sidebar tabs */}
//           <div className="flex border-b border-zinc-100">
//             <button onClick={() => setLeftTab("chat")}
//               className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "chat" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
//               <MessageSquareIcon size={13} /> Chat
//             </button>

//             <button onClick={() => setLeftTab("files")}
//               className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "files" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
//               <FolderTreeIcon size={13} /> Files
//             </button>
//           </div>

//           {/* sideBar content */}
//           <div className='flex-1 overflow-hidden'>
//             {
//               leftTab === 'chat' ? (
//                 <ChatPanel messages={activeProject.messages} onSend={handleChat} loading={chatLoading} />
//               ) : (
//                 <FileExplorer files={activeProject.files} activeFile={activeFile}
//                 onFileSelect={(path)=>{
//                   setActiveFile(path);
//                   setShowCode(true)
//                 }}/>
//               )
//             }
//           </div>

//         </div>

//         {/* preview / code area */}
//         <div className='flex-1 overflow-hidden'>
//           {activeProject.status === "pending" || activeProject.status === "generating" || activeProject.status === "failed" ? (
//             <AgentProgressDashboard project={activeProject}/>
//           ) : (
//             <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode}/>
//           )}
//         </div>
//       </div>

//       {publishUrl && <PublishModal publishUrl={publishUrl} onClose={()=> setPublishUrl(null)}/>}
//     </div>
//   )
// }

// export default BuilderPage

// import React, { useEffect, useState, useRef } from 'react'
// import { useAppContext } from '../context/AppContext'
// import { useNavigate, useParams } from 'react-router-dom'
// import Loading from '../components/Loading'
// import BuilderHeader from '../components/BuilderHeader'
// import { MessageSquareIcon, FolderTreeIcon } from 'lucide-react'
// import ChatPanel from '../components/ChatPanel'
// import FileExplorer from '../components/FileExplorer'
// import PreviewPanel from '../components/PreviewPanel'
// import AgentProgressDashboard from '../components/AgentProgressDashboard'
// import PublishModal from '../components/PublishModal'
// import api from '../api/api'
// import toast from 'react-hot-toast'
// import { exportProjectZip } from '../utils/sandpackUtils'

// const BuilderPage = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [leftTab, setLeftTab] = useState("chat");
//   const [publishing, setPublishing] = useState(false);
//   const [publishUrl, setPublishUrl] = useState(null);

//   const { activeProject, loadingActiveProject, activeFile, showCode, setActiveFile, setShowCode, loadProject, logout, handleChat } = useAppContext();

//   const [chatLoading, setChatLoading] = useState(false)
//   const isMounted = useRef(true)

//   // Initial load when ID changes
//   useEffect(() => {
//     if (!id) return;
//     loadProject(id);
//   }, [id]);

//   // Polling only while project status is pending or generating
//   useEffect(() => {
//     if (!id || !activeProject) return;

//     const isGenerating = activeProject.status === "pending" || activeProject.status === "generating";
    
//     if (!isGenerating) return;

//     const interval = setInterval(() => {
//       loadProject(id, true);
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [id, activeProject?.status]); // 👈 Rely strictly on status string instead of full object reference

//   const handleOpenPreview = () => {
//     if (!id) return;
//     window.open(`/preview/${id}`, "_blank")
//   }

//   const handlePublish = async () => {
//     if(!id) return;
//     setPublishing(true)
//     try {
//       await api.post(`/api/projects/${id}/publish`);
//       const url = `${window.location.origin}/publish/${id}`;
//       setPublishUrl(url);
//       toast.success("Website published successfully!")
//     } catch (err) {
//       console.error("publish failed:", err);
//       toast.error(err?.response?.data?.error || "publish failed");
//     } finally {
//       setPublishing(false)
//     }
//   }

//   const handleDownload = () => {
//     if(!activeProject) return;
//     exportProjectZip(activeProject)
//   }

//   if (loadingActiveProject || !activeProject) {
//     return <Loading />
//   }

//   return (
//     <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative'>
//       {/* Top Bar Header */}
//       <BuilderHeader
//         projectName={activeProject.name}
//         version={activeProject.version}
//         showCode={showCode}
//         publishing={publishing}
//         onToggleShowCode={() => setShowCode(!showCode)}
//         onOpenPreview={handleOpenPreview}
//         onPublish={handlePublish}
//         onDownload={handleDownload}
//         onBack={() => navigate("/")}
//         onLogout={logout} />

//       {/* Main Layout */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* left sidebar */}
//         <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
//           {/* Sidebar tabs */}
//           <div className="flex border-b border-zinc-100">
//             <button onClick={() => setLeftTab("chat")}
//               className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "chat" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
//               <MessageSquareIcon size={13} /> Chat
//             </button>

//             <button onClick={() => setLeftTab("files")}
//               className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "files" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
//               <FolderTreeIcon size={13} /> Files
//             </button>
//           </div>

//           {/* sideBar content */}
//           <div className='flex-1 overflow-hidden'>
//             {
//               leftTab === 'chat' ? (
//                 <ChatPanel messages={activeProject.messages} onSend={handleChat} loading={chatLoading} />
//               ) : (
//                 <FileExplorer files={activeProject.files} activeFile={activeFile}
//                 onFileSelect={(path)=>{
//                   setActiveFile(path);
//                   setShowCode(true)
//                 }}/>
//               )
//             }
//           </div>

//         </div>

//         {/* preview / code area */}
//         <div className='flex-1 overflow-hidden'>
//           {activeProject.status === "pending" || activeProject.status === "generating" || activeProject.status === "failed" ? (
//             <AgentProgressDashboard project={activeProject}/>
//           ) : (
//             <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode}/>
//           )}
//         </div>
//       </div>

//       {publishUrl && <PublishModal publishUrl={publishUrl} onClose={()=> setPublishUrl(null)}/>}
//     </div>
//   )
// }

// export default BuilderPage

import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import BuilderHeader from '../components/BuilderHeader'
import { MessageSquareIcon, FolderTreeIcon } from 'lucide-react'
import ChatPanel from '../components/ChatPanel'
import FileExplorer from '../components/FileExplorer'
import PreviewPanel from '../components/PreviewPanel'
import AgentProgressDashboard from '../components/AgentProgressDashboard'
import PublishModal from '../components/PublishModal'
import api from '../api/api'
import toast from 'react-hot-toast'
import { exportProjectZip } from '../utils/sandpackUtils'

const BuilderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leftTab, setLeftTab] = useState("chat")
  const [publishing, setPublishing] = useState(false)
  const [publishUrl, setPublishUrl] = useState(null)

  const { 
    activeProject, 
    loadingActiveProject, 
    activeFile, 
    showCode, 
    setActiveFile, 
    setShowCode, 
    loadProject, 
    logout, 
    handleChat 
  } = useAppContext();

  const [chatLoading, setChatLoading] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initial load when ID changes
  useEffect(() => {
    if (!id) return;
    loadProject(id);
  }, [id]);

  // Polling strictly while project status is pending or generating
  useEffect(() => {
    if (!id || !activeProject) return;

    const isGenerating = activeProject.status === "pending" || activeProject.status === "generating";
    
    if (!isGenerating) return;

    const interval = setInterval(() => {
      if (isMounted.current) {
        loadProject(id, true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, activeProject?.status]);

  const handleOpenPreview = () => {
    if (!id) return;
    window.open(`/preview/${id}`, "_blank");
  }

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      if (isMounted.current) {
        setPublishUrl(url);
      }
      toast.success("Website published successfully!");
    } catch (err) {
      console.error("Publish failed:", err);
      toast.error(err?.response?.data?.error || "Publish failed");
    } finally {
      if (isMounted.current) {
        setPublishing(false);
      }
    }
  }

  const handleDownload = () => {
    if (!activeProject) return;
    exportProjectZip(activeProject);
  }

  const handleSendMessage = async (msg) => {
    setChatLoading(true);
    try {
      await handleChat(msg);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      if (isMounted.current) {
        setChatLoading(false);
      }
    }
  }

  if (loadingActiveProject || !activeProject) {
    return <Loading />
  }

  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative'>
      {/* Top Bar Header */}
      <BuilderHeader
        projectName={activeProject.name}
        version={activeProject.version}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate("/")}
        onLogout={logout} 
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
          {/* Sidebar tabs */}
          <div className="flex border-b border-zinc-100">
            <button 
              onClick={() => setLeftTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === "chat" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <MessageSquareIcon size={13} /> Chat
            </button>

            <button 
              onClick={() => setLeftTab("files")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === "files" ? "border-b-2 border-zinc-900 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FolderTreeIcon size={13} /> Files
            </button>
          </div>

          {/* Sidebar content */}
          <div className='flex-1 overflow-hidden'>
            {leftTab === 'chat' ? (
              <ChatPanel 
                messages={activeProject.messages} 
                onSend={handleSendMessage} 
                loading={chatLoading} 
              />
            ) : (
              <FileExplorer 
                files={activeProject.files} 
                activeFile={activeFile}
                onFileSelect={(path) => {
                  setActiveFile(path);
                  setShowCode(true);
                }}
              />
            )}
          </div>
        </div>

        {/* Preview / Code Area */}
        <div className='flex-1 overflow-hidden'>
          {activeProject.status === "pending" || activeProject.status === "generating" || activeProject.status === "failed" ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode} />
          )}
        </div>
      </div>

      {publishUrl && <PublishModal publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />}
    </div>
  )
}

export default BuilderPage