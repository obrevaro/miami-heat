# Miami Heat Hydrogen Video Components

This repository contains the converted Hydrogen React components from the original Shopify Liquid sections `video-banner.liquid` and `my-stuff.liquid`.

## 🚀 Quick Start

```bash
# Install dependencies
npm install video.js @types/video.js @videojs/http-streaming

# Start development server
npm run dev

# Visit demo page
open http://localhost:3000/video-demo
```

## 📦 Components

### 1. VideoBanner Component

A powerful video banner component with Video.js integration, API content fetching, and "My Stuff" functionality.

#### Features

- **Video Player**: Video.js integration with HLS support
- **Content Sources**: API or localStorage ("My Stuff") content
- **Auto-refresh**: Configurable content refresh intervals
- **Responsive**: Mobile-optimized with customizable breakpoints
- **Customizable**: Extensive styling and layout options
- **Data Mapping**: Configurable data source mapping for flexible APIs

#### Basic Usage

```jsx
import {VideoBanner} from '~/components/VideoBanner';

function MyPage() {
  return (
    <VideoBanner
      apiUrl="https://your-api.com/videos?random=true"
      videoHeight={70}
      showPlayButton={true}
      showAddButton={true}
    />
  );
}
```

#### Advanced Configuration

```jsx
<VideoBanner
  // Content Settings
  apiUrl="/api/video-content?random=true"
  useMyStuff={false}
  refreshInterval={30}
  // Layout
  videoHeight={70}
  mobileVideoHeight={50}
  textPosition="bottom"
  // Spacing
  containerMargin={{top: 0, bottom: 0, left: 0, right: 0}}
  containerPadding={{top: 0, bottom: 0, left: 0, right: 0}}
  textPadding={{top: 30, bottom: 30, left: 30, right: 30}}
  textMargin={{top: 0, bottom: 0, left: 0, right: 0}}
  // Typography
  titleSettings={{
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  }}
  summarySettings={{
    fontSize: 19,
    color: '#FFFFFF',
    maxWidth: 60,
  }}
  textColor="#FFFFFF"
  // Data Sources (for flexible API mapping)
  dataSources={{
    title: 'title',
    summary: 'summary',
    category: 'extensions.category',
    duration: 'extensions.duration',
    provider: 'extensions.provider',
  }}
  // Controls
  showPlayButton={true}
  showAddButton={true}
  className="custom-banner"
/>
```

#### API Response Format

The VideoBanner expects this data structure:

```typescript
interface ApiResponse {
  entry: Array<{
    id: string;
    title: string;
    summary: string;
    content: {
      src: string;
      type: string; // 'video/mp4', 'application/x-mpegURL', etc.
    };
    extensions: {
      category?: string;
      duration?: number; // in seconds
      provider?: string;
    };
    media_group?: Array<{
      media_item: Array<{
        key: string;
        src: string;
      }>;
    }>;
  }>;
}
```

### 2. MyStuff Component

A horizontal scrolling collection manager for saved videos with localStorage persistence.

#### Features

- **Collection Management**: Add, remove, and view saved videos
- **Horizontal Scrolling**: Touch-friendly rail with custom scrollbars
- **Integration**: Seamless integration with VideoBanner
- **Responsive**: Mobile-optimized with different item sizes
- **Customizable**: Extensive styling and layout options
- **Empty States**: Configurable empty state messaging

#### Basic Usage

```jsx
import {MyStuff} from '~/components/MyStuff';

function MyPage() {
  return <MyStuff sectionTitle="My Stuff" showClearButton={true} />;
}
```

#### Advanced Configuration

```jsx
<MyStuff
  // General
  sectionTitle="My Collection"
  backgroundColor="#000000"
  className="custom-section"
  // Spacing
  sectionPadding={{top: 40, bottom: 40}}
  containerPadding={20}
  railPadding={10}
  // Title Styling
  titleSettings={{
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    alignment: 'left',
    marginBottom: 20,
  }}
  // Item Settings
  itemSettings={{
    width: 200,
    mobileWidth: 140,
    gap: 15,
    borderRadius: 8,
  }}
  // Text Settings
  itemTextSettings={{
    titleSize: 14,
    metaSize: 12,
  }}
  // Empty State
  emptyState={{
    title: 'Your collection is empty',
    message: 'Start adding videos to build your collection!',
    textColor: '#FFFFFF',
  }}
  // Controls
  showClearButton={true}
  metaTextColor="#FFFFFF"
  // Integration
  onVideoPlay={(video) => {
    console.log('Playing video:', video);
    // Custom video play handler
  }}
/>
```

## 🔧 Integration Example

Here's how to integrate both components for seamless video playback:

```jsx
import React, {useState} from 'react';
import {VideoBanner} from '~/components/VideoBanner';
import {MyStuff} from '~/components/MyStuff';

export default function VideoPage() {
  const handleVideoPlay = (video) => {
    // Scroll to video banner and play the selected video
    const banner = document.querySelector('.video-banner');
    if (banner) {
      banner.scrollIntoView({behavior: 'smooth', block: 'center'});
    }

    // You can dispatch a custom event or use state management
    window.dispatchEvent(
      new CustomEvent('playVideoFromMyStuff', {
        detail: video,
      }),
    );
  };

  return (
    <div>
      {/* Main video banner */}
      <VideoBanner
        apiUrl="/api/video-content?random=true"
        refreshInterval={30}
        videoHeight={70}
      />

      {/* User's saved videos */}
      <MyStuff sectionTitle="My Saved Videos" onVideoPlay={handleVideoPlay} />

      {/* My Stuff as content source */}
      <VideoBanner
        useMyStuff={true}
        refreshInterval={20}
        videoHeight={50}
        titleSettings={{
          color: '#FFD700',
          fontSize: 36,
        }}
      />
    </div>
  );
}
```

## 🎨 Styling

### CSS Files

The original CSS has been moved to:

- `app/styles/section-video-banner.css`
- `app/styles/section-my-stuff.css`

### Customization

Both components use a combination of:

1. **Tailwind CSS** for utility classes
2. **Inline styles** for dynamic/configurable properties
3. **Custom CSS** via `dangerouslySetInnerHTML` for complex responsive styles

### Responsive Design

Components automatically adapt to mobile screens:

- Video banners adjust height and text size
- MyStuff items resize and use smaller padding
- Touch scrolling is optimized for mobile devices

## 📡 API Routes

### Built-in API Route

The conversion includes a demo API route at `/api/video-content`:

```typescript
// GET /api/video-content?random=true&category=highlights&limit=1
```

#### Parameters

- `random`: Set to 'true' for random video selection
- `category`: Filter by category (optional)
- `limit`: Number of videos to return (default: 1)

#### Usage

```jsx
<VideoBanner apiUrl="/api/video-content?random=true" />
```

### External API Integration

To use with external APIs, ensure your API returns the expected format or use the `dataSources` prop to map fields:

```jsx
<VideoBanner
  apiUrl="https://external-api.com/videos"
  dataSources={{
    title: 'video_title', // Map to your API's title field
    summary: 'video_description', // Map to your API's description field
    category: 'metadata.genre', // Map to nested category field
    duration: 'metadata.length', // Map to duration field
    provider: 'source.name', // Map to provider field
  }}
/>
```

## 💾 Data Persistence

### localStorage Structure

Videos are stored in localStorage under the `myStuff` key:

```json
[
  {
    "id": "video-123",
    "title": "Video Title",
    "summary": "Video description",
    "content": {
      "src": "https://video-url.mp4",
      "type": "video/mp4"
    },
    "extensions": {
      "category": "Sports",
      "duration": 180,
      "provider": "Miami Heat"
    },
    "media_group": [...],
    "addedAt": 1640995200000
  }
]
```

### Cross-Component Sync

Components stay synchronized via:

1. **Custom Events**: `myStuffUpdated` event for real-time updates
2. **Storage Events**: Automatic sync across browser tabs
3. **Polling**: Periodic refresh for same-page updates

## 🔄 Migration from Liquid

### Key Differences

| Liquid Section           | React Component       | Notes                        |
| ------------------------ | --------------------- | ---------------------------- |
| `{{ section.settings }}` | Component props       | Direct prop mapping          |
| `{%- style -%}`          | Inline styles + CSS   | Dynamic styling via props    |
| `{% schema %}`           | TypeScript interfaces | Type safety and autocomplete |
| Liquid filters           | JavaScript functions  | `formatDuration()`, etc.     |
| Section IDs              | `useRef` hooks        | Unique component instances   |

### Props Mapping

Most Liquid section settings map directly to React props:

```liquid
<!-- Liquid -->
{{ section.settings.video_height }}vh

<!-- React -->
<VideoBanner videoHeight={70} />
```

### Data Source Flexibility

The React version adds configurable data source mapping, making it compatible with different API structures:

```jsx
// Original API structure
dataSources={{
  title: 'title',
  summary: 'summary',
}}

// Custom API structure
dataSources={{
  title: 'video_data.name',
  summary: 'video_data.description',
}}
```

## 🚨 Troubleshooting

### Common Issues

1. **Video.js not loading**: Ensure `video.js` is installed and imported
2. **Components not found**: Check import paths and file locations
3. **localStorage errors**: Components handle localStorage gracefully with try/catch
4. **CORS issues**: Use the built-in API route or configure CORS headers
5. **Mobile scrolling**: Ensure `-webkit-overflow-scrolling: touch` is set

### Development

```bash
# Check components are built correctly
npm run typecheck

# Lint components
npm run lint

# Build for production
npm run build
```

## 📱 Demo

Visit `/video-demo` to see all components in action with:

- Multiple VideoBanner configurations
- MyStuff integration examples
- Responsive design showcase
- Interactive feature demonstrations

## 🎯 Production Considerations

1. **Video Sources**: Replace demo videos with your actual content
2. **API Integration**: Connect to your video content API
3. **Error Handling**: Implement proper error boundaries
4. **Performance**: Consider lazy loading for large video collections
5. **Analytics**: Add tracking for video interactions
6. **SEO**: Implement proper meta tags and structured data

## 🤝 Contributing

When extending these components:

1. Maintain TypeScript interfaces for type safety
2. Follow the existing prop structure for consistency
3. Add responsive styles for mobile compatibility
4. Include error handling for network requests
5. Update documentation for new features

---

**Note**: This conversion maintains full feature parity with the original Liquid sections while adding enhanced flexibility, type safety, and modern React patterns.
