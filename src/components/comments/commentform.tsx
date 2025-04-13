"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Box, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentFormProps {
  forumId: string;
  comments: Comment[];
  onCommentAdded?: (newComment: Comment) => void;
  onDeleteComment?: (commentId: string) => Promise<void>; 
  isSubmitting: boolean;
}

export default function CommentForm({ forumId, comments = [], onCommentAdded, onDeleteComment, isSubmitting }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedComments, setDisplayedComments] = useState<Comment[]>(comments);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setDisplayedComments(comments);
  }, [comments]);

  useEffect(() => {
    setIsClient(true); 
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError("You must be logged in to comment");
      return;
    }
    
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forumId,
          content: content.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }
      
      const newComment: Comment = {
        id: data.id || `temp-${Date.now()}`,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        authorId: session.user.id,
        author: {
          id: session.user.id,
          name: session.user.name || null,
          image: session.user.image || null
        }
      };
      
      setDisplayedComments(prev => [newComment, ...prev]);
      setContent('');
      
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while posting your comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!session || !onDeleteComment) return;
    
    try {
      await onDeleteComment(commentId);
      setDisplayedComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comments ({displayedComments.length})
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder={session ? "Write a comment..." : "Please sign in to comment"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!session || loading}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: 1,
              },
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              disabled={!session || loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {displayedComments.length > 0 ? (
          <List sx={{ p: 0 }}>
            {displayedComments.map((comment, index) => (
              <Box key={comment.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ px: 0 }}
                  secondaryAction={
                    session?.user?.id === comment.authorId && onDeleteComment && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        size="small"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={comment.author?.image || undefined} alt={comment.author?.name || "User"} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {comment.author?.name || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isClient
                            ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                            : "Just now"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                      >
                        {comment.content}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < displayedComments.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </Box>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
