import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Settings, RefreshCw, Download, Trash2, MessageSquare, Server } from 'lucide-react';
import AvatarStyleSelector from './components/AvatarStyleSelector';
import AvatarEditor from './components/AvatarEditor';
import ChatInterface from './components/ChatInterface';
import { AvatarStyle } from './types';
import { uploadImage, customizeAvatar, checkServerHealth } from './services/api';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('pixar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serverCheckInterval = useRef<number>();

  useEffect(() => {
    const checkServer = async () => {
      try {
        const isOnline = await checkServerHealth();
        setServerStatus(isOnline ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };
    
    // Check immediately
    checkServer();
    
    // Then check every 30 seconds
    serverCheckInterval.current = window.setInterval(checkServer, 30000);
    
    // Cleanup interval on unmount
    return () => {
      if (serverCheckInterval.current) {
        clearInterval(serverCheckInterval.current);
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB limit');
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrorMessage('Only JPEG, JPG, and PNG files are allowed');
        return;
      }
      
      setErrorMessage(null);
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedAvatar(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const generateAvatar = async () => {
    if (!uploadedImage || !uploadedFile || serverStatus !== 'online') return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      const result = await uploadImage(uploadedFile, selectedStyle);
      setGeneratedAvatar(result.avatarUrl);
    } catch (error: any) {
      console.error('Error generating avatar:', {
        message: error?.response?.data?.message || error?.message || 'Failed to generate avatar'
      });
      setErrorMessage(error?.response?.data?.message || 'Failed to generate avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetImages = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedAvatar(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadAvatar = () => {
    if (!generatedAvatar) return;
    
    const link = document.createElement('a');
    link.href = generatedAvatar;
    link.download = `avatar-${selectedStyle}-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleChatInstruction = async (instruction: string) => {
    if (!generatedAvatar || serverStatus !== 'online') return;
    
    setIsGenerating(true);
    
    try {
      const result = await customizeAvatar(generatedAvatar, selectedStyle, instruction);
      setGeneratedAvatar(result.avatarUrl);
    } catch (error: any) {
      console.error('Error customizing avatar:', {
        message: error?.response?.data?.message || error?.message || 'Failed to customize avatar'
      });
      setErrorMessage(error?.response?.data?.message || 'Failed to customize avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">AI Avatar Generator</h1>
            <div className="flex items-center">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                serverStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : serverStatus === 'offline'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                <Server size={16} className="mr-1" />
                {serverStatus === 'online' 
                  ? 'Server Online' 
                  : serverStatus === 'offline'
                    ? 'Server Offline'
                    : 'Checking Server...'}
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-2">Upload your photo and transform it into stylized avatars</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
            <span className="block sm:inline">{errorMessage}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setErrorMessage(null)}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}
        
        {serverStatus === 'offline' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Server is offline</p>
            <p>The backend server is not running. Please start the server with:</p>
            <pre className="bg-gray-100 p-2 mt-2 rounded">npm run server</pre>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Original Image */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Photo</h2>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                uploadedImage ? 'border-green-400' : 'border-gray-300 hover:border-indigo-400'
              }`}
              onClick={triggerFileInput}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
              
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative w-64 h-64 mx-auto">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center mx-auto transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetImages();
                    }}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload size={32} className="text-indigo-500" />
                  </div>
                  <p className="text-gray-500">Click to upload a photo or drag and drop</p>
                  <p className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>

            {uploadedImage && (
              <div className="mt-6 space-y-4">
                <AvatarStyleSelector 
                  selectedStyle={selectedStyle} 
                  onSelectStyle={setSelectedStyle} 
                />
                
                <button 
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                    isGenerating || serverStatus !== 'online'
                      ? 'bg-indigo-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  onClick={generateAvatar}
                  disabled={isGenerating || serverStatus !== 'online'}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={20} className="mr-2 animate-spin" />
                      Generating Avatar...
                    </>
                  ) : serverStatus !== 'online' ? (
                    <>
                      <Server size={20} className="mr-2" />
                      Server Offline
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} className="mr-2" />
                      Generate Avatar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Generated Avatar and Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Avatar</h2>
              {generatedAvatar && (
                <button 
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={toggleChat}
                >
                  <MessageSquare size={18} className="mr-1" />
                  {showChat ? 'Hide Chat' : 'Chat with AI'}
                </button>
              )}
            </div>
            
            {generatedAvatar ? (
              <div className="space-y-6">
                <div className="relative w-64 h-64 mx-auto">
                  <img 
                    src={generatedAvatar} 
                    alt="Generated Avatar" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <RefreshCw size={40} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {showChat ? (
                  <ChatInterface 
                    avatarStyle={selectedStyle} 
                    onRegenerateAvatar={generateAvatar}
                    onSendInstruction={handleChatInstruction}
                    isProcessing={isGenerating}
                  />
                ) : (
                  <AvatarEditor 
                    onRegenerateAvatar={generateAvatar}
                    onDownloadAvatar={downloadAvatar}
                    isProcessing={isGenerating}
                  />
                )}
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>Your generated avatar will appear here</p>
                  <p className="text-sm mt-2">Upload a photo and select a style to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 py-6 border-t">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} AI Avatar Generator. All rights reserved.
          </p>
          <p className="text-center text-gray-400 text-sm mt-1">
            This is a demo application. In a production environment, it would connect to Google's AI services.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;