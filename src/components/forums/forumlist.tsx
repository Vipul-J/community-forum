 
import { useState, useEffect } from "react";
import { Box, Typography, Pagination, TextField, InputAdornment, Chip, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ForumCard from "./forumcard";
import { Forum, ForumWithUser } from "@/app/types";

interface ForumListProps {
  initialForums?: ForumWithUser[];
  initialPagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  forums: Forum[];  

}

export default function ForumList({ initialForums, initialPagination }: ForumListProps) {
  const [forums, setForums] = useState<ForumWithUser[]>(initialForums || []);
  const [pagination, setPagination] = useState(initialPagination || { total: 0, pages: 1, page: 1, limit: 10 });
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedForumIds, setLikedForumIds] = useState<Record<string, boolean>>({});

  // forums based on filters
  const loadForums = async (page = 1, searchTerm = search, tag = selectedTag) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }
      
      if (tag) {
        queryParams.append("tag", tag);
      }
      
      const response = await fetch(`/api/forums?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch forums");
      }
      
      const data = await response.json();
      
      setForums(data.data);
      setPagination(data.pagination);
      
      // like status for each forum
      data.data.forEach((forum: ForumWithUser) => {
        checkLikeStatus(forum.id);
      });
    } catch (err) {
      setError("Failed to load forums. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // if user has liked a forum
  const checkLikeStatus = async (forumId: string) => {
    try {
      const response = await fetch(`/api/forums/${forumId}/likes`);
      
      if (response.ok) {
        const data = await response.json();
        setLikedForumIds(prev => ({
          ...prev,
          [forumId]: data.data.liked
        }));
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  // like/unlike
  const handleLike = async (forumId: string) => {
    try {
      const response = await fetch(`/api/forums/${forumId}/likes`, {
        method: "POST",
      });
  
      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }
  
      const data = await response.json();
  
      setForums(prevForums =>
        prevForums.map(forum => {
          if (forum.id === forumId) {
            return {
              ...forum,
              _count: {
                ...forum._count,
                likes: data.data.likeCount,
                comments: forum._count?.comments ?? 0 // Ensure comments is defined
              }
            } as ForumWithUser ; // Cast to ForumWithUser 
          }
          return forum;
        })
      );
  
      setLikedForumIds(prev => ({
        ...prev,
        [forumId]: data.data.liked
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // forum deletion
  const handleDelete = async (forumId: string) => {
    if (!window.confirm("Are you sure you want to delete this forum?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/forums/${forumId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete forum");
      }
      
      setForums(prevForums => prevForums.filter(forum => forum.id !== forumId));
    } catch (error) {
      console.error("Error deleting forum:", error);
    }
  };

  // page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    loadForums(page);
  };

  // search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // tag selection
  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const allTags = Array.from(
      new Set(forums.flatMap(forum => forum.tags))
    ).filter((tag): tag is string => tag !== undefined).slice(0, 10);

  // search after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      loadForums(1, search, selectedTag);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  useEffect(() => {
    if (!initialForums) {
      loadForums();
    }
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search forums..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>
      
      {allTags.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {allTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagSelect(tag)}
              color={selectedTag === tag ? "primary" : "default"}
              clickable
            />
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading forums...</Typography>
      ) : forums.length === 0 ? (
        <Typography align="center" sx={{ my: 4 }}>
          No forums found. {search || selectedTag ? "Try a different search or tag." : "Be the first to create one!"}
        </Typography>
      ) : (
        <>
          {forums.map(forum => (
            <ForumCard
              key={forum.id}
              forum={forum}
              onLike={handleLike}
              onDelete={handleDelete}
              userHasLiked={likedForumIds[forum.id] || false}
            />
          ))}
          
          {pagination.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}