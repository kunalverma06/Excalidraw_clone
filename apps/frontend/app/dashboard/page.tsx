"use client"
import React, { useEffect, useState } from 'react';
import { Plus, Users, Calendar, Clock, Copy, ExternalLink, Trash2, Search, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { HttpBackend } from '@/app/draw/config';
import { CreateRoomSchema } from '@repo/zod-types';
import {useRouter} from 'next/navigation';


interface Room {
  id: string;
  roomName: string;
  createdAt: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const router = useRouter();

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Format date helper
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  useEffect(() => {
  const data = localStorage.getItem("userId");
  if (data) setUserId(data);
}, []);

useEffect(() => {
  console.log("userId updated:", userId);
}, [userId]);

  useEffect(()=>{
    if (!userId) return; // wait until userId is set
    const  fetchroom = async () => {
    setLoading(true);
    try{const values = await axios.get(`${HttpBackend}/rooms/${userId}`,)
    const rooms = values.data.rooms  ;
    console.log("rooms",rooms);
    setRooms(rooms);
    
    }catch(error){
      console.log("erros",error)
      showToast("Failed to load rooms", "error");
    } finally {
      setLoading(false);
    }
  }
  fetchroom();
},[userId])

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      showToast("Please enter a room name", "error");
      return;
    }

    console.log(newRoomName)
    setCreating(true);
    try {
      const data = await axios.post(`${HttpBackend}/create-room`,{roomName:newRoomName},{withCredentials:true})
      console.log(data.data.message);
      showToast(data.data.message || "Room created successfully!", "success");
      
      // Add new room to list
      const newRoom: Room = {
        id: data.data.roomId || `room-${Date.now()}`,
        roomName: newRoomName,
        createdAt: Date.now()
      };
      setRooms([newRoom, ...rooms]);
      
      setNewRoomName('');
      setShowCreateModal(false);
    } catch (error) {
      console.log("error creating room", error);
      showToast("Failed to create room", "error");
    } finally {
      setCreating(false);
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    setDeleting(id);
    try {
      await axios.delete(`${HttpBackend}/rooms/${id}`, { withCredentials: true });
      setRooms(rooms.filter(room => room.id !== id));
      showToast("Room deleted successfully", "success");
    } catch (error) {
      console.log("error deleting room", error);
      showToast("Failed to delete room", "error");
    } finally {
      setDeleting(null);
    }
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast("Room ID copied to clipboard!", "success");
  };

  function Openroom(id:string){
    console.log(id);
    router.push(`/canvas/${id}`)
  }

  
  const filteredRooms = rooms.filter(room =>
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white min-w-[300px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium flex-1">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DrawFlow</h1>
                <p className="text-sm text-gray-500">Your Collaborative Whiteboard</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rooms.filter(r => Date.now() - r.createdAt < 3600000).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {rooms.filter(r => Date.now() - r.createdAt < 86400000).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Rooms</h2>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No rooms found matching your search' : 'No rooms yet. Create one to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {room.roomName}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyRoomId(room.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Copy Room ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      disabled={deleting === room.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Room"
                    >
                      {deleting === room.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono text-gray-700">#</span>
                    </div>
                    <span className="font-mono text-xs truncate">{room.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created {formatDate(room.createdAt)}</span>
                  </div>
                </div>

                <button onClick={()=>Openroom(room.id)} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Room</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !creating && createRoom()}
                placeholder="e.g., Product Design Workshop"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={creating}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoomName('');
                }}
                disabled={creating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                disabled={creating || !newRoomName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}