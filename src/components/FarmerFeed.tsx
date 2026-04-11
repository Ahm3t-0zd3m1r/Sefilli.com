import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera } from 'lucide-react';
import { FeedPost } from '../types';

interface FarmerFeedProps {
  posts: FeedPost[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onPost: () => void;
}

const FarmerFeed: React.FC<FarmerFeedProps> = ({ posts, onLike, onComment, onPost }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-farm-leaf/10 flex items-center justify-center text-farm-leaf">
          <Camera size={20} />
        </div>
        <button 
          onClick={onPost}
          className="flex-grow text-left px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-500 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          Tarladan ne haber? Bir fotoğraf paylaş...
        </button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  {post.userPhoto ? (
                    <img src={post.userPhoto} alt={post.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-farm-leaf text-white font-bold">
                      {post.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{post.userName}</div>
                  <div className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleString('tr-TR')}</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="px-4 pb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {post.content}
              </p>
            </div>

            {post.imageUrl && (
              <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="p-4 flex items-center gap-6 border-t border-gray-50 dark:border-gray-700/50">
              <button 
                onClick={() => onLike(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Heart size={20} className={post.likes.length > 0 ? "fill-red-500 text-red-500" : ""} />
                <span className="text-xs font-bold">{post.likes.length}</span>
              </button>
              <button 
                onClick={() => onComment(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-farm-leaf transition-colors"
              >
                <MessageCircle size={20} />
                <span className="text-xs font-bold">{post.commentCount}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors ml-auto">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarmerFeed;
