import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Download, 
  MessageSquare, 
  User, 
  Shield, 
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  userRole: 'user' | 'admin' | 'agent';
  userName: string;
  message: string;
  isInternal: boolean;
  attachments?: Array<{
    url: string;
    name: string;
  }>;
  createdAt: string;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (message: string, isInternal?: boolean) => void;
  currentUserRole: 'user' | 'admin' | 'agent';
  loading?: boolean;
  className?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return Shield;
    case 'agent':
      return User;
    default:
      return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'agent':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function CommentThread({ 
  comments, 
  onAddComment, 
  currentUserRole, 
  loading = false,
  className 
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(newComment.trim(), isInternal);
    setNewComment('');
    setIsInternal(false);
  };

  const canAddInternalComments = currentUserRole === 'admin' || currentUserRole === 'agent';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a comment</p>
          </div>
        ) : (
          comments.map((comment) => {
            const RoleIcon = getRoleIcon(comment.userRole);
            const isOwnComment = comment.userRole === currentUserRole;
            
            return (
              <div 
                key={comment._id} 
                className={cn(
                  "flex gap-3 p-4 rounded-lg border",
                  isOwnComment ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                )}
              >
                {/* Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.userName)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <Badge className={cn("text-xs", getRoleColor(comment.userRole))}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {comment.userRole}
                    </Badge>
                    {comment.isInternal && (
                      <Badge variant="outline" className="text-xs">
                        Internal
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.message}
                  </p>

                  {/* Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comment.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Internal Comment Checkbox */}
        {canAddInternalComments && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="internal"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="internal" className="text-sm text-gray-600">
              Internal comment (only visible to admins and agents)
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!newComment.trim() || loading}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
