import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Typography, IconButton, TextField, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'next-auth/react';
import { Forum, Comment } from '@/app/types';
import CommentForm from '../comments/commentform';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface ForumDetailProps {
  forum: Forum;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeForum: () => Promise<void>;
  onDeleteForum: () => Promise<void>;
  isLiked: boolean;
}

export default function ForumDetail({
  forum,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeForum,
  onDeleteForum,
  isLiked
}: ForumDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const handleAddComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      await onAddComment(content);
      setReplyingTo(null);
      setReplyContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentReply = (commentId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
    setReplyError(null);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setReplyError("You must be logged in to comment");
      return;
    }

    if (!replyContent.trim()) {
      setReplyError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setReplyError(null);

    try {
      await handleAddComment(replyContent.trim());
    } catch (err) {
      console.error('Error posting comment:', err);
      setReplyError('An error occurred while posting your comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditForum = () => {
    router.push(`/forums/edit/${forum.id}`);
  };

  const isOwner = session?.user?.id === forum.authorId;
  const createdAt = forum.createdAt ? new Date(forum.createdAt) : new Date();

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" gutterBottom>
                {forum.title}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Posted by {forum.author?.name || 'Anonymous'} • {formatDistanceToNow(createdAt, { addSuffix: true })}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={onLikeForum}
                color={isLiked ? 'primary' : 'default'}
                aria-label={isLiked ? 'Unlike forum' : 'Like forum'}
              >
                {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                <Typography variant="body2" ml={0.5}>
                  {forum._count?.likes || 0}
                </Typography>
              </IconButton>

              {isOwner && (
                <>
                  <IconButton onClick={handleEditForum} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={onDeleteForum} color="error">
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" paragraph whiteSpace="pre-wrap">
            {forum.description}
          </Typography>

          {forum.tags && forum.tags.length > 0 && (
            <Box mt={2}>
              {forum.tags.map((tag: string, index: number) => (
                <Chip key={index} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* comment form at the top of comments section */}
      <Box mt={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>

            {session ? (
              <Box sx={{ mb: 3 }}>
                <CommentForm
                  forumId={forum.id}
                  comments={[]}
                  onCommentAdded={(newComment) => handleAddComment(newComment.content)}
                  onDeleteComment={onDeleteComment}
                  isSubmitting={isSubmitting}
                />
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', mb: 3 }}>
                <Typography color="text.secondary">
                  Please sign in to join the discussion
                </Typography>
                <Button
                  variant="contained"
                  href="/login"
                  sx={{ mt: 2 }}
                >
                  Sign In
                </Button>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* comment list */}
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <Box key={comment.id} id={`comment-${comment.id}`} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: '0 0 40px' }}>
                      <Box
                        component="img"
                        src={comment.author?.image || "/default-avatar.png"}
                        alt={comment.author?.name || "User"}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {comment.author?.name || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                      >
                        {comment.content}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<CommentIcon fontSize="small" />}
                          onClick={() => handleCommentReply(comment.id)}
                          color={replyingTo === comment.id ? "primary" : "inherit"}
                        >
                          Reply
                        </Button>

                        {session?.user?.id === comment.authorId && (
                          <Button
                            size="small"
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => onDeleteComment(comment.id)}
                            color="error"
                          >
                            Delete
                          </Button>
                        )}
                      </Box>

                      {replyingTo === comment.id && (
                        <Box sx={{ mt: 2 }} component="form" onSubmit={handleSubmitReply}>
                          {replyError && (
                            <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
                              {replyError}
                            </Typography>
                          )}
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            disabled={isSubmitting}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              type="button"
                              variant="text"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => setReplyingTo(null)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              size="small"
                              endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                              disabled={isSubmitting || !replyContent.trim()}
                            >
                              {isSubmitting ? 'Posting...' : 'Post'}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {index < comments.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}