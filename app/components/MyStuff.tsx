import React, {useEffect, useState, useCallback} from 'react';

interface VideoData {
  id: string;
  title: string;
  summary: string;
  content: {
    src: string;
    type: string;
  };
  extensions: {
    category?: string;
    duration?: number;
    provider?: string;
  };
  media_group?: Array<{
    media_item: Array<{
      key: string;
      src: string;
    }>;
  }>;
  addedAt?: number;
}

interface MyStuffProps {
  sectionTitle?: string;
  backgroundColor?: string;
  sectionPadding?: {
    top: number;
    bottom: number;
  };
  containerPadding?: number;
  titleSettings?: {
    fontSize: number;
    fontWeight: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
    marginBottom: number;
  };
  itemSettings?: {
    width: number;
    mobileWidth: number;
    gap: number;
    borderRadius: number;
  };
  railPadding?: number;
  itemTextSettings?: {
    titleSize: number;
    metaSize: number;
  };
  emptyState?: {
    title: string;
    message: string;
    textColor: string;
  };
  showClearButton?: boolean;
  metaTextColor?: string;
  className?: string;
  onVideoPlay?: (video: VideoData) => void;
}

export function MyStuff({
  sectionTitle = 'My Stuff',
  backgroundColor = '#000000',
  sectionPadding = {top: 40, bottom: 40},
  containerPadding = 20,
  titleSettings = {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    alignment: 'left',
    marginBottom: 20,
  },
  itemSettings = {
    width: 200,
    mobileWidth: 140,
    gap: 15,
    borderRadius: 8,
  },
  railPadding = 10,
  itemTextSettings = {
    titleSize: 14,
    metaSize: 12,
  },
  emptyState = {
    title: 'Your collection is empty',
    message:
      "Start adding videos to your collection by clicking the 'Add to My Stuff' button on videos you want to save.",
    textColor: '#FFFFFF',
  },
  showClearButton = true,
  metaTextColor = '#FFFFFF',
  className = '',
  onVideoPlay,
}: MyStuffProps) {
  const [myStuffVideos, setMyStuffVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Format duration from seconds to MM:SS
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load My Stuff from localStorage
  const loadMyStuff = useCallback(() => {
    try {
      const storedStuff = JSON.parse(localStorage.getItem('myStuff') || '[]');
      setMyStuffVideos(storedStuff);
      setLoading(false);
    } catch (error) {
      console.error('Error loading My Stuff:', error);
      setMyStuffVideos([]);
      setLoading(false);
    }
  }, []);

  // Remove video from My Stuff
  const removeFromMyStuff = useCallback(
    (videoId: string, videoTitle: string) => {
      if (confirm(`Remove "${videoTitle}" from My Stuff?`)) {
        try {
          let myStuff = JSON.parse(localStorage.getItem('myStuff') || '[]');

          // Filter out the video with the matching ID
          myStuff = myStuff.filter((video: VideoData) => video.id !== videoId);

          // Save back to localStorage
          localStorage.setItem('myStuff', JSON.stringify(myStuff));

          // Update local state
          setMyStuffVideos(myStuff);

          // Dispatch custom event to update other My Stuff sections and video banners
          window.dispatchEvent(new CustomEvent('myStuffUpdated'));

          console.log(`Removed "${videoTitle}" from My Stuff`);
        } catch (error) {
          console.error('Error removing from My Stuff:', error);
          alert('Error removing video from My Stuff');
        }
      }
    },
    [],
  );

  // Clear all My Stuff
  const clearAllMyStuff = useCallback(() => {
    if (confirm('Are you sure you want to clear all videos from My Stuff?')) {
      localStorage.removeItem('myStuff');
      setMyStuffVideos([]);
      window.dispatchEvent(new CustomEvent('myStuffUpdated'));
    }
  }, []);

  // Play video from My Stuff
  const playMyStuffVideo = useCallback(
    (video: VideoData) => {
      console.log('Playing video from My Stuff:', video);

      if (onVideoPlay) {
        onVideoPlay(video);
        return;
      }

      // Fallback: try to find video banner sections on the page
      const videoBanners = document.querySelectorAll('[id*="video-banner-"]');

      if (videoBanners.length > 0) {
        // Scroll to first video banner and trigger custom event
        const videoBanner = videoBanners[0] as HTMLElement;
        videoBanner.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Dispatch custom event with video data
        window.dispatchEvent(
          new CustomEvent('playVideoFromMyStuff', {
            detail: video,
          }),
        );
      } else {
        // Fallback: open video source directly
        if (video.content && video.content.src) {
          window.open(video.content.src, '_blank');
        } else {
          alert('Video source not available');
        }
      }
    },
    [onVideoPlay],
  );

  // Create individual My Stuff item
  const renderMyStuffItem = useCallback(
    (video: VideoData, index: number) => {
      // Get image from media_group
      let imageSrc = '';
      if (
        video.media_group &&
        video.media_group[0] &&
        video.media_group[0].media_item
      ) {
        const imageBase = video.media_group[0].media_item.find(
          (item) => item.key === 'image_base',
        );
        if (imageBase && imageBase.src) {
          imageSrc = imageBase.src;
        }
      }

      // Fallback to placeholder if no image
      if (!imageSrc) {
        imageSrc =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
      }

      const category = video.extensions?.category || 'Video';
      const duration = video.extensions?.duration
        ? formatDuration(video.extensions.duration)
        : '';

      return (
        <div
          key={video.id}
          className="my-stuff-item relative cursor-pointer transition-all duration-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 hover:z-10"
          style={{
            flexShrink: 0,
            width: `${itemSettings.width}px`,
            borderRadius: `${itemSettings.borderRadius}px`,
          }}
          onClick={() => playMyStuffVideo(video)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              playMyStuffVideo(video);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Play video: ${video.title || 'Untitled'}`}
        >
          <img
            src={imageSrc}
            alt={video.title || 'Video'}
            className="w-full aspect-[2/3] object-cover bg-gray-700"
            style={{
              borderRadius: `${itemSettings.borderRadius}px`,
            }}
            loading="lazy"
          />

          <button
            className="absolute top-2 right-2 w-8 h-8 bg-red-600/90 hover:bg-red-700 border-none rounded-full text-white text-lg cursor-pointer flex items-center justify-center opacity-0 scale-75 transition-all duration-300 hover:scale-110 z-10"
            onClick={(e) => {
              e.stopPropagation();
              removeFromMyStuff(video.id, video.title || 'Untitled');
            }}
            title="Remove from My Stuff"
            style={{
              transform: 'scale(0.8)',
            }}
          >
            ×
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 transform translate-y-full transition-transform duration-300">
            <div
              className="font-semibold mb-1 truncate"
              style={{fontSize: `${itemTextSettings.titleSize}px`}}
            >
              {video.title || 'Untitled'}
            </div>
            <div
              className="opacity-80 truncate"
              style={{fontSize: `${itemTextSettings.metaSize}px`}}
            >
              {category}
              {duration ? ' • ' + duration : ''}
            </div>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
              .my-stuff-item:hover .absolute.bottom-0 {
                transform: translateY(0);
              }
              .my-stuff-item:hover button {
                opacity: 1;
                transform: scale(1);
              }
              @media screen and (max-width: 768px) {
                .my-stuff-item {
                  width: ${itemSettings.mobileWidth}px !important;
                }
              }
            `,
            }}
          />
        </div>
      );
    },
    [
      itemSettings,
      itemTextSettings,
      formatDuration,
      playMyStuffVideo,
      removeFromMyStuff,
    ],
  );

  // Listen for storage changes and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'myStuff') {
        loadMyStuff();
      }
    };

    const handleMyStuffUpdate = () => {
      loadMyStuff();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('myStuffUpdated', handleMyStuffUpdate);

    // Initial load
    loadMyStuff();

    // Refresh periodically to catch same-page changes
    const refreshInterval = setInterval(loadMyStuff, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myStuffUpdated', handleMyStuffUpdate);
      clearInterval(refreshInterval);
    };
  }, [loadMyStuff]);

  const containerStyle = {
    backgroundColor,
    paddingTop: `${sectionPadding.top}px`,
    paddingBottom: `${sectionPadding.bottom}px`,
  };

  const containerInnerStyle = {
    paddingLeft: `${containerPadding}px`,
    paddingRight: `${containerPadding}px`,
  };

  const titleStyle = {
    fontSize: `${titleSettings.fontSize}px`,
    fontWeight: titleSettings.fontWeight,
    color: titleSettings.color,
    textAlign: titleSettings.alignment as 'left' | 'center' | 'right',
    marginBottom: `${titleSettings.marginBottom}px`,
  };

  const railStyle = {
    gap: `${itemSettings.gap}px`,
    padding: `${railPadding}px 0`,
  };

  if (loading) {
    return (
      <div className={`my-stuff-section ${className}`} style={containerStyle}>
        <div className="max-w-full mx-auto" style={containerInnerStyle}>
          <div className="text-center py-16">
            <div className="text-white opacity-70">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (myStuffVideos.length === 0) {
    return (
      <div className={`my-stuff-section ${className}`} style={containerStyle}>
        <div className="max-w-full mx-auto" style={containerInnerStyle}>
          <div
            className="text-center py-16"
            style={{color: emptyState.textColor}}
          >
            <div className="text-6xl mb-4 opacity-50">📺</div>
            <div className="text-2xl font-semibold mb-2">
              {emptyState.title}
            </div>
            <div className="text-base opacity-70 max-w-md mx-auto">
              {emptyState.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-stuff-section ${className}`} style={containerStyle}>
      <div className="max-w-full mx-auto" style={containerInnerStyle}>
        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="m-0" style={titleStyle}>
              {sectionTitle}
            </h2>
            <div className="text-sm opacity-80" style={{color: metaTextColor}}>
              {myStuffVideos.length} video
              {myStuffVideos.length !== 1 ? 's' : ''}
            </div>
          </div>
          {showClearButton && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded text-sm cursor-pointer transition-colors duration-300 active:translate-y-px"
              onClick={clearAllMyStuff}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Rail */}
        <div
          className="flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50 scroll-smooth"
          style={railStyle}
        >
          {myStuffVideos.map((video, index) => renderMyStuffItem(video, index))}
        </div>

        {/* Mobile responsive styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media screen and (max-width: 480px) {
                .my-stuff-section .flex.justify-between {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 1rem;
                }
                .my-stuff-section .max-w-full {
                  padding-left: ${containerPadding * 0.5}px !important;
                  padding-right: ${containerPadding * 0.5}px !important;
                }
                .my-stuff-section h2 {
                  font-size: ${titleSettings.fontSize * 0.8}px !important;
                }
              }
              
              /* Scrollbar styling for webkit browsers */
              .my-stuff-section .flex.overflow-x-auto::-webkit-scrollbar {
                height: 8px;
              }
              .my-stuff-section .flex.overflow-x-auto::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
              }
              .my-stuff-section .flex.overflow-x-auto::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 4px;
              }
              .my-stuff-section .flex.overflow-x-auto::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
              }
            `,
          }}
        />
      </div>
    </div>
  );
}

export default MyStuff;
