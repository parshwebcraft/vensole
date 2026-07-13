# Vensoul - Where Stories Find Their Soul

A complete, production-ready storytelling platform similar to Wattpad.

## Features

### Core Features
- **Authentication**: Email/password login with secure session handling
- **User Roles**: Reader, Author, Moderator, Admin
- **Story Creation**: Rich text editor with formatting tools
- **Chapter Management**: Create, edit, reorder, publish chapters
- **Cover Images**: Story covers with automatic sizing

### Reading Experience
- Mobile-friendly reading mode with adjustable font sizes
- Chapter navigation sidebar
- Reading progress tracking
- Clean, distraction-free typography

### Social Features
- Follow authors
- Like stories
- Comment on chapters
- Bookmark stories to reading lists
- Receive notifications for follows, likes, comments

### Discovery
- Browse by genre
- Search stories, authors, and tags
- Featured stories section
- Trending algorithms

### Admin Panel
- User management with role assignment
- Content reports and moderation
- Story management
- Platform analytics

### Author Dashboard
- Story statistics (views, reads, likes)
- Analytics charts
- Draft management
- Publication controls

## Tech Stack

- **Frontend**: Next.js 13 with React 18
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Environment Setup

Create a `.env` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_database_url
```

### Installation

```bash
npm install
npm run dev
```

### Database Setup

The database migrations are applied via Supabase MCP tool. The included migrations create:
- User profiles with roles
- Stories and chapters
- Genres and tags
- Social features (follows, likes, comments, bookmarks)
- Notifications system
- Reports and moderation
- Analytics tracking

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured stories |
| `/stories` | Browse all stories |
| `/story/[id]` | Story details page |
| `/story/[id]/chapter/[chapterId]` | Chapter reader |
| `/genres` | Browse by genre |
| `/search` | Search functionality |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Author dashboard |
| `/write` | Create new story |
| `/write/[id]` | Edit story and chapters |
| `/my/library` | Bookmarks and liked stories |
| `/my/analytics` | Author analytics |
| `/settings` | Profile settings |
| `/notifications` | Notification center |
| `/admin` | Admin panel |
| `/report` | Report content |

## Database Schema

### Core Tables
- `profiles` - User profiles with roles
- `stories` - Story metadata
- `chapters` - Story chapters
- `genres` - Story genres
- `story_genres` - Story-genre junction
- `story_tags` - Flexible tagging

### Social Tables
- `follows` - User follows
- `likes` - Story likes
- `comments` - Chapter comments
- `bookmarks` - Reading lists
- `notifications` - User notifications

### Moderation Tables
- `reports` - Content reports

## Security

- Row Level Security (RLS) on all tables
- Owner-scoped access control
- Admin/moderator privileges
- Protected routes via middleware

## Deployment

The project is configured for deployment on Netlify/Vercel:

```bash
npm run build
npm run start
```

## License

MIT
