import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Divider, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Comment } from '@/app/types';

interface CommentListProps {
  comments: Comment[];
  forumId: string;
  onDeleteComment: (commentId: string) => Promise<void>;
  onCommentClick: (commentId: string) => void;
  selectedCommentId?: string | null;
}

export default function CommentList({ 
  comments, 
  forumId, 
  onDeleteComment, 
  onCommentClick,
  selectedCommentId 
}: CommentListProps) {
  const { data: session } = useSession();

  if (!comments || comments.length === 0) {
    return (
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', mt: 2 }}>
      {comments.map((comment, index) => {
        const isSelected = selectedCommentId === comment.id;
        return (
          <Box 
            key={comment.id} 
            id={`comment-${comment.id}`}
          >
            <ListItem 
              alignItems="flex-start"
              onClick={() => onCommentClick(comment.id)}
              sx={{ 
                cursor: 'pointer',
                backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
              secondaryAction={
                session?.user?.id === comment.authorId && (
                  <IconButton edge="end" aria-label="delete" onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComment(comment.id);
                  }}>
                    <DeleteIcon />
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
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Typography>
                }
              />
            </ListItem>
            {index < comments.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        );
      })}
    </List>
  );
}