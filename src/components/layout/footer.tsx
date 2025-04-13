 
import { Box, Container, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Community Forums. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link href="/" color="inherit" sx={{ mx: 1 }}>
            Home
          </Link>
          <Link href="/about" color="inherit" sx={{ mx: 1 }}>
            About
          </Link>
          <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
            Terms
          </Link>
          <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
            Privacy
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}