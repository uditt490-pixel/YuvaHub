import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, X, Globe, Link2, ExternalLink } from 'lucide-react';
import { fetchStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup } from '../../services/apiClient';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';

export default function StudyGroupRooms() {
  const { user } = useAppContext();
  const { socket } = useSocket();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  
  // Live members specific to the currently joined room
  const [liveMembers, setLiveMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    tags: "",
    maxCapacity: 10,
    resourceUrl: ""
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchStudyGroups(undefined, searchQuery || undefined);
      setRooms(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!socket || !joinedRoomId || !user) return;

    const handleMemberJoined = (data: any) => {
      setLiveMembers(prev => {
        if (prev.find(m => m.uid === data.user.uid)) return prev;
        return [...prev, data.user];
      });
    };

    const handleMemberLeft = (data: any) => {
      setLiveMembers(prev => prev.filter(m => m.uid !== data.uid));
    };

    socket.on("member_joined", handleMemberJoined);
    socket.on("member_left", handleMemberLeft);

    // Make sure we emit join so others know
    socket.emit("join_study_group", { roomId: joinedRoomId, user: { uid: user.uid, name: user.displayName || user.email } });

    return () => {
      socket.off("member_joined", handleMemberJoined);
      socket.off("member_left", handleMemberLeft);
      socket.emit("leave_study_group", { roomId: joinedRoomId, user: { uid: user.uid } });
    };
  }, [socket, joinedRoomId, user]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
      await createStudyGroup({
        name: formData.name,
        topic: formData.topic,
        tags: tagsArray,
        maxCapacity: formData.maxCapacity,
        resourceUrl: formData.resourceUrl
      });
      setIsModalOpen(false);
      loadRooms();
    } catch (err) {
      alert("Failed to create room.");
    }
  };

  const handleJoin = async (roomId: string) => {
    try {
      await joinStudyGroup(roomId);
      setJoinedRoomId(roomId);
      const room = rooms.find(r => r.id === roomId);
      // Initialize with self + any known members
      setLiveMembers([{ uid: user?.uid, name: user?.displayName || user?.email }]);
    } catch (err) {
      alert("Could not join the room (might be full).");
    }
  };

  const handleLeave = async () => {
    if (!joinedRoomId) return;
    try {
      await leaveStudyGroup(joinedRoomId);
      if (socket) {
        socket.emit("leave_study_group", { roomId: joinedRoomId, user: { uid: user?.uid } });
      }
      setJoinedRoomId(null);
      setLiveMembers([]);
      loadRooms();
    } catch (err) {
      console.error(err);
    }
  };

  if (joinedRoomId) {
    const currentRoom = rooms.find(r => r.id === joinedRoomId) || { name: "Study Group", topic: "Unknown", resourceUrl: "" };
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-surface dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentRoom.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{currentRoom.topic}</p>
          </div>
          <button onClick={handleLeave} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors">
            Leave Room
          </button>
        </div>

        {currentRoom.resourceUrl && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl flex items-center gap-3">
            <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <a href={currentRoom.resourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
              Shared Resource <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="bg-surface dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-500" /> Live Members ({liveMembers.length})
          </h2>
          <div className="flex flex-wrap gap-4">
            {liveMembers.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                  {m.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Discover topic-based study pods and collaborate.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Create Room
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by topic or name..." 
          className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
          No study groups found. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const isFull = (room.members?.length || 0) >= room.maxCapacity;
            return (
              <div key={room.id} className="bg-surface dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{room.name}</h3>
                  {room.isActive && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4">{room.topic}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(room.tags || []).map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-1 text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{room.members?.length || 0} / {room.maxCapacity}</span>
                  </div>
                  <button 
                    onClick={() => handleJoin(room.id)} 
                    disabled={isFull}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    {isFull ? 'Full' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Study Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input required type="text" className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input type="text" className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Capacity</label>
                <input type="number" min="2" max="100" className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pinned Resource URL (optional)</label>
                <input type="url" className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" value={formData.resourceUrl} onChange={e => setFormData({...formData, resourceUrl: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 mt-4">
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
