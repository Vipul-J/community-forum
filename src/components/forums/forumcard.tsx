import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  CardActions, 
  IconButton, 
  Menu, 
  MenuItem,
  Stack,
  TextField,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { ForumWithUser , Comment } from "@/app/types";
import { formatDistanceToNow } from "@/app/lib/utils";

interface ForumCardProps {
  forum: ForumWithUser ;
  onLike?: (forumId: string) => void;
  onDelete?: (forumId: string) => void;
  userHasLiked?: boolean;
  onCommentAdded?: () => void;
}

export default function ForumCard({ 
  forum, 
  onLike, 
  onDelete, 
  userHasLiked = false,
  onCommentAdded
}: ForumCardProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isOwner = session?.user?.id === forum.user.id; // Access user.id instead of userId

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(forum.id);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    if (newShowComments && !commentsLoaded && (forum._count?.comments ?? 0) > 0) {
      fetchComments();
    }
    
    if (!session && !showCommentForm) {
      setError("Please log in to comment");
      setAlertSeverity("error");
      setAlertMessage("Please log in to comment");
      setShowSuccessAlert(true);
    } else {
      setShowCommentForm(!showCommentForm);
    }
  };

  const fetchComments = async () => {
    if (isLoadingComments || commentsLoaded) {
      return;
    }
    
    setIsLoadingComments(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${forum.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments ")
      }
      
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data)) {
        setComments(data.data);
      } else {
        setComments([]);
      }
      setCommentsLoaded(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!commentContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      const response = await fetch(`/api/comments/${forum.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forumId: forum.id,
          content: commentContent.trim(),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post comment");
      }
  
      const newComment = await response.json();
      
      setCommentContent('');
      
      if (newComment && newComment.data) {
        setComments(prevComments => [newComment.data, ...prevComments]);
      }
      
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      setAlertSeverity("success");
      setAlertMessage("Comment posted successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error instanceof Error ? error.message : "Failed to post comment");
      setAlertSeverity("error");
      setAlertMessage(error instanceof Error ? error.message : "Failed to post comment");
      setShowSuccessAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
  
    try {
      const response = await fetch(`/api/comments/${forum.id}?commentId=${commentToDelete}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorText = await response.text();  
        console.error("Error response:", errorText);  
        throw new Error("Failed to delete comment");
      }
  
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentToDelete));
  
      setAlertSeverity("success");
      setAlertMessage("Comment deleted successfully");
      setShowSuccessAlert(true);
  
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setAlertSeverity("error");
      setAlertMessage(error instanceof Error ? error.message : "Failed to delete comment");
      setShowSuccessAlert(true);
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const cancelDeleteComment = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleCloseAlert = () => {
    setShowSuccessAlert(false);
    setError(null);
  };

  return (
    <Card sx={{ mb: 2, width: "100%" }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar src={forum.user.image || undefined} alt={forum.user.name || "User "} sx={{ width: 24, height: 24, mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {forum.user.name || "Anonymous"} • {formatDistanceToNow(new Date(forum.createdAt))}
            </Typography>
          </Box>
          {isOwner && (
            <div>
              <IconButton
                aria-label="more"
                id={`forum-menu-${forum.id}`}
                aria-controls={isMenuOpen ? `forum-menu-${forum.id}` : undefined}
                aria-expanded={isMenuOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleMenuOpen}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                id={`forum-menu-${forum.id}`}
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": `forum-menu-${forum.id}`,
                }}
              >
                <MenuItem onClick={handleDelete}>Delete</MenuItem ></Menu>
            </div>
          )}
        </Box>
        
        <Link href={`/forums/${forum.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {forum.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}>
            {forum.description}
          </Typography>
        </Link>
        
        {(forum.tags ?? []).length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
            {(forum.tags ?? []).slice(0, 3).map((tag: any, index: any) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ height: 24 }}
              />
            ))}
            {(forum.tags ?? []).length > 3 && (
              <Chip 
                label={`+${(forum.tags ?? []).length - 3}`}
                size="small"
                sx={{ height: 24 }}
              />
            )}
          </Stack>
        )}
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton 
            size="small" 
            onClick={() => onLike && onLike(forum.id)}
            color={userHasLiked ? "primary" : "default"}
            disabled={!session}
          >
            {userHasLiked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {forum._count?.likes || 0}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <IconButton 
            size="small" 
            onClick={handleCommentClick}
            color={showComments ? "primary" : "default"}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {forum._count?.comments || 0}
          </Typography>
        </Box>
      </CardActions>
      
      {/* comments section */}
      {showComments && (
        <Box sx={{ px: 2, pt: 1, pb: showCommentForm ? 0 : 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Comments
          </Typography>
          
          {isLoadingComments ? (
            <Typography variant="body2" color="text.secondary">
              Loading comments...
            </Typography>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                    {comment.content}
                  </Typography>
                  
                  {session?.user?.id === comment.user.id && (
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteComment(comment.id)}
                      sx={{ padding: 0.5, ml: 1 }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                    {comment.user?.name ||  "Anonymous"} •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.createdAt))}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Box>
      )}
      
      {/* inline comment form */}
      {showComments && showCommentForm && (
        <Box sx={{ px: 2, pb: 2 }} component="form" onSubmit={handleSubmitComment}>
          {error && (
            <Typography color=" error" variant="caption" sx={{ display: 'block', mb: 1 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Write your comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
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
              onClick={() => setShowCommentForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              endIcon={isSubmitting ? null : <SendIcon />}
              disabled={isSubmitting || !commentContent.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* delete comment dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteComment}
        aria-labelledby="delete-comment-dialog-title"
      >
        <DialogTitle id="delete-comment-dialog-title">
          Delete Comment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteComment}>Cancel</Button>
          <Button onClick={confirmDeleteComment} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar 
        open={showSuccessAlert} 
        autoHideDuration={4000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}