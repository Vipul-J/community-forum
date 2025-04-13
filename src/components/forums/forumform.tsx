import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Chip, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Forum } from '@/app/types';

interface ForumFormProps {
  initialData?: Forum;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  description: string;
  tags: string[];
}

export default function ForumForm({ initialData, onSubmit, isSubmitting, mode }: ForumFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data in form:', initialData);
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags : []
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      description: '',
    };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onSubmit(formData);
  };

  console.log('Current form state:', formData);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {mode === 'create' ? 'Create New Forum' : 'Edit Forum'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Forum Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            disabled={isSubmitting}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={5}
            id="description"
            label="Forum Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={isSubmitting}
          />
          
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Tags (optional)
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <TextField
                fullWidth
                size="small"
                id="tagInput"
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                disabled={isSubmitting}
              />
              <Button
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isSubmitting}
              >
                Add
              </Button>
            </Box>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  disabled={isSubmitting}
                />
              ))}
            </Box>
          </Box>
          
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === 'create' ? 'Creating...' : 'Updating...'
                : mode === 'create' ? 'Create Forum' : 'Update Forum'
              }
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}