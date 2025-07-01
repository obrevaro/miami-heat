import React, {useEffect, useRef, useState, useCallback} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

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
}

interface VideoBannerProps {
  apiUrl?: string;
  useMyStuff?: boolean;
  refreshInterval?: number;
  videoHeight?: number;
  mobileVideoHeight?: number;
  containerMargin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  containerPadding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  textPosition?: 'top' | 'bottom';
  textPadding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  textMargin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  titleSettings?: {
    fontSize: number;
    fontWeight: string;
    color: string;
  };
  summarySettings?: {
    fontSize: number;
    color: string;
    maxWidth: number;
  };
  textColor?: string;
  dataSources?: {
    title: string;
    summary: string;
    category: string;
    duration: string;
    provider: string;
  };
  showPlayButton?: boolean;
  showAddButton?: boolean;
  className?: string;
}

export function VideoBanner({
  apiUrl = 'https://winoapi.replit.app/?random=true',
  useMyStuff = false,
  refreshInterval = 30,
  videoHeight = 70,
  mobileVideoHeight = 50,
  containerMargin = {top: 0, bottom: 0, left: 0, right: 0},
  containerPadding = {top: 0, bottom: 0, left: 0, right: 0},
  textPosition = 'bottom',
  textPadding = {top: 30, bottom: 30, left: 30, right: 30},
  textMargin = {top: 0, bottom: 0, left: 0, right: 0},
  titleSettings = {fontSize: 48, fontWeight: '700', color: '#FFFFFF'},
  summarySettings = {fontSize: 19, color: '#FFFFFF', maxWidth: 60},
  textColor = '#FFFFFF',
  dataSources = {
    title: 'title',
    summary: 'summary',
    category: 'extensions.category',
    duration: 'extensions.duration',
    provider: 'extensions.provider',
  },
  showPlayButton = true,
  showAddButton = true,
  className = '',
}: VideoBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(
    null,
  );
  const [userInteracted, setUserInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [myStuffIndex, setMyStuffIndex] = useState(0);
  const [myStuffVideos, setMyStuffVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate unique IDs for this component instance
  const componentId = useRef(
    `video-banner-${Math.random().toString(36).substr(2, 9)}`,
  );
  const playerId = `video-player-${componentId.current}`;

  // Helper function to get nested object property by path
  const getNestedValue = useCallback((obj: any, path: string) => {
    return path
      .split('.')
      .reduce((current, key) => current && current[key], obj);
  }, []);

  // Format duration from seconds to MM:SS
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Check if current video is in My Stuff
  const isVideoInMyStuff = useCallback((videoData: VideoData | null) => {
    if (!videoData || !videoData.id) return false;

    try {
      const myStuff = JSON.parse(localStorage.getItem('myStuff') || '[]');
      return myStuff.some((item: VideoData) => item.id === videoData.id);
    } catch (error) {
      console.error('Error checking My Stuff:', error);
      return false;
    }
  }, []);

  // Add or remove video from My Stuff
  const toggleMyStuff = useCallback((videoData: VideoData) => {
    if (!videoData || !videoData.id) {
      console.error('Invalid video data');
      return;
    }

    try {
      const myStuff = JSON.parse(localStorage.getItem('myStuff') || '[]');
      const existingIndex = myStuff.findIndex(
        (item: VideoData) => item.id === videoData.id,
      );

      if (existingIndex === -1) {
        // Add new video to the beginning of the array
        myStuff.unshift({
          id: videoData.id,
          title: videoData.title,
          summary: videoData.summary,
          content: videoData.content,
          extensions: videoData.extensions,
          media_group: videoData.media_group,
          addedAt: Date.now(),
        });

        console.log('Video added to My Stuff:', videoData.title);
      } else {
        // Remove video from My Stuff
        myStuff.splice(existingIndex, 1);
        console.log('Video removed from My Stuff:', videoData.title);
      }

      // Save back to localStorage
      localStorage.setItem('myStuff', JSON.stringify(myStuff));

      // Dispatch custom event to update My Stuff sections
      window.dispatchEvent(new CustomEvent('myStuffUpdated'));
    } catch (error) {
      console.error('Error toggling My Stuff:', error);
    }
  }, []);

  // Fetch content from API or My Stuff
  const fetchContent = useCallback(async () => {
    setLoading(true);

    if (useMyStuff) {
      try {
        const storedVideos = JSON.parse(
          localStorage.getItem('myStuff') || '[]',
        );

        if (storedVideos.length === 0) {
          console.log('No videos in My Stuff');
          setLoading(false);
          return;
        }

        // Get current video from My Stuff list
        const videoEntry = storedVideos[myStuffIndex];
        setCurrentVideoData(videoEntry);

        // Move to next video for next fetch (infinite loop)
        setMyStuffIndex((prevIndex) => (prevIndex + 1) % storedVideos.length);

        console.log(
          `Playing My Stuff video ${myStuffIndex + 1}/${storedVideos.length}: ${
            videoEntry.title
          }`,
        );
      } catch (error) {
        console.error('Error fetching from My Stuff:', error);
      }
    } else {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.entry && data.entry.length > 0) {
          const videoEntry = data.entry[0];
          setCurrentVideoData(videoEntry);
        }
      } catch (error) {
        console.error('Error fetching video content:', error);
      }
    }

    setLoading(false);
  }, [apiUrl, useMyStuff, myStuffIndex]);

  // Initialize Video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      fluid: true,
      responsive: true,
      controls: false,
      autoplay: 'muted',
      muted: true,
      loop: true,
      preload: 'auto',
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
          withCredentials: false,
        },
      },
    });

    playerRef.current = player;

    // Handle user interaction
    player.on('click', () => {
      setUserInteracted(true);
      if (player.muted()) {
        player.muted(false);
        player.controls(true);
      }
    });

    // Handle player errors
    player.on('error', () => {
      const error = player.error();
      console.error('Video player error:', error);

      // Try to recover from certain HLS errors
      if (error && error.code === 4) {
        console.log('Media error detected, attempting to reload...');
        setTimeout(() => {
          if (
            currentVideoData &&
            currentVideoData.content &&
            currentVideoData.content.src
          ) {
            console.log('Reloading video source...');
            player.load();
          }
        }, 2000);
      }
    });

    // Handle fullscreen events
    player.on('fullscreenchange', () => {
      setIsFullscreen(player.isFullscreen() || false);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Update video content when currentVideoData changes
  useEffect(() => {
    if (!playerRef.current || !currentVideoData) return;

    const player = playerRef.current;
    const {content} = currentVideoData;

    if (content && content.src) {
      // Map HLS content types properly
      let contentType = content.type || 'video/mp4';
      if (
        contentType === 'video/hls' ||
        contentType === 'application/x-mpegURL'
      ) {
        contentType = 'application/x-mpegURL';
      }

      // For HLS content, disable loop on the player element
      const isHLS = contentType === 'application/x-mpegURL';

      if (isHLS) {
        player.loop(false);
      } else {
        player.loop(true);
      }

      player.ready(() => {
        console.log(
          `Loading ${isHLS ? 'HLS' : 'standard'} video:`,
          content.src,
          `(${contentType})`,
        );

        player.src({
          src: content.src,
          type: contentType,
        });

        // Reset mute state and controls for new content if user hasn't interacted
        if (!userInteracted) {
          player.muted(true);
          player.controls(false);
        }

        // For HLS, wait a bit longer before starting playback
        const playDelay = isHLS ? 1000 : 0;
        setTimeout(() => {
          if (!userInteracted) {
            player.play().catch((error: any) => {
              console.log('Auto-play prevented:', error);
            });
          }
        }, playDelay);
      });
    }
  }, [currentVideoData, userInteracted]);

  // Set up refresh interval
  useEffect(() => {
    fetchContent(); // Initial fetch

    if (refreshInterval > 0 && !isFullscreen) {
      const intervalId = setInterval(fetchContent, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [fetchContent, refreshInterval, isFullscreen]);

  // Listen for My Stuff updates
  useEffect(() => {
    const handleMyStuffUpdate = () => {
      if (useMyStuff) {
        setMyStuffIndex(0);
        setMyStuffVideos([]);
        fetchContent();
      }
    };

    window.addEventListener('myStuffUpdated', handleMyStuffUpdate);
    return () =>
      window.removeEventListener('myStuffUpdated', handleMyStuffUpdate);
  }, [useMyStuff, fetchContent]);

  const handlePlayClick = () => {
    if (!playerRef.current) return;

    setUserInteracted(true);
    playerRef.current.muted(false);
    playerRef.current.controls(true);
    playerRef.current.play();

    // Request fullscreen
    if (playerRef.current.requestFullscreen) {
      playerRef.current.requestFullscreen();
    }
  };

  const handleAddClick = () => {
    if (currentVideoData) {
      toggleMyStuff(currentVideoData);
    }
  };

  // Get display values using configurable data sources
  const titleValue = currentVideoData
    ? getNestedValue(currentVideoData, dataSources.title) || 'Untitled'
    : 'Loading Content...';
  const summaryValue = currentVideoData
    ? getNestedValue(currentVideoData, dataSources.summary) || ''
    : 'Please wait while we load the latest content...';
  const categoryValue = currentVideoData
    ? getNestedValue(currentVideoData, dataSources.category) || 'Video'
    : 'Loading...';
  const durationValue = currentVideoData
    ? getNestedValue(currentVideoData, dataSources.duration)
    : null;
  const providerValue = currentVideoData
    ? getNestedValue(currentVideoData, dataSources.provider) || 'Unknown'
    : '--';

  const formattedDuration = durationValue
    ? formatDuration(durationValue)
    : '--:--';
  const isInMyStuff = isVideoInMyStuff(currentVideoData);

  const containerStyle = {
    height: `${videoHeight}vh`,
    marginTop: `${containerMargin.top}px`,
    marginBottom: `${containerMargin.bottom}px`,
    marginLeft: `${containerMargin.left}px`,
    marginRight: `${containerMargin.right}px`,
    paddingTop: `${containerPadding.top}px`,
    paddingBottom: `${containerPadding.bottom}px`,
    paddingLeft: `${containerPadding.left}px`,
    paddingRight: `${containerPadding.right}px`,
  };

  const contentOverlayStyle = {
    [textPosition]: 0,
    paddingTop: `${textPadding.top}px`,
    paddingBottom: `${textPadding.bottom}px`,
    paddingLeft: `${textPadding.left}px`,
    paddingRight: `${textPadding.right}px`,
    marginTop: `${textMargin.top}px`,
    marginBottom: `${textMargin.bottom}px`,
    marginLeft: `${textMargin.left}px`,
    marginRight: `${textMargin.right}px`,
    color: textColor,
  };

  const titleStyle = {
    fontSize: `${titleSettings.fontSize}px`,
    fontWeight: titleSettings.fontWeight,
    color: titleSettings.color,
  };

  const summaryStyle = {
    fontSize: `${summarySettings.fontSize}px`,
    color: summarySettings.color,
    maxWidth: `${summarySettings.maxWidth}%`,
  };

  return (
    <div
      id={componentId.current}
      className={`video-banner relative w-full overflow-hidden bg-black ${className}`}
      style={containerStyle}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        id={playerId}
        className="video-js vjs-default-skin absolute top-0 left-0 w-full h-full"
        controls={false}
        preload="auto"
        muted
        autoPlay
        loop
        data-setup="{}"
      >
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to
          a web browser that
          <a
            href="https://videojs.com/html5-video-support/"
            target="_blank"
            rel="noopener noreferrer"
          >
            supports HTML5 video
          </a>
          .
        </p>
      </video>

      {/* Video Overlay */}
      <div className="video-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/70 via-black/30 to-black/10 pointer-events-none z-10" />

      {/* Content Overlay */}
      <div
        className="content-overlay absolute left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-20"
        style={contentOverlayStyle}
      >
        <div className="metadata flex gap-4 mb-6 text-sm opacity-90">
          <span className="category bg-white/20 px-3 py-1 rounded backdrop-blur-sm">
            {categoryValue}
          </span>
          <span className="duration bg-white/20 px-3 py-1 rounded backdrop-blur-sm">
            {formattedDuration}
          </span>
          <span className="provider bg-white/20 px-3 py-1 rounded backdrop-blur-sm">
            {providerValue}
          </span>
        </div>

        <h1 className="mb-4 drop-shadow-lg" style={titleStyle}>
          {titleValue}
        </h1>

        <div
          className="summary mb-6 leading-relaxed drop-shadow-sm"
          style={summaryStyle}
        >
          {summaryValue}
        </div>

        <div className="cta-buttons flex gap-4">
          {showPlayButton && (
            <button
              className="btn btn-primary bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition-all duration-300 hover:-translate-y-0.5"
              onClick={handlePlayClick}
            >
              ▶ Play
            </button>
          )}
          {showAddButton && (
            <button
              className={`btn px-8 py-3 rounded font-bold transition-all duration-300 ${
                isInMyStuff
                  ? 'btn-success bg-green-600 hover:bg-green-700 text-white'
                  : 'btn-secondary bg-white/30 hover:bg-white/40 text-white backdrop-blur-sm'
              }`}
              onClick={handleAddClick}
            >
              {isInMyStuff ? '✓ In My Stuff' : '+ Add to My Stuff'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media screen and (max-width: 768px) {
              #${componentId.current} {
                height: ${mobileVideoHeight}vh !important;
              }
              
              #${componentId.current} .content-overlay {
                padding: 1rem !important;
              }
              
              #${componentId.current} .content-overlay h1 {
                font-size: 2rem !important;
              }
              
              #${componentId.current} .content-overlay .summary {
                font-size: 1rem !important;
                max-width: 90% !important;
              }
              
              #${componentId.current} .content-overlay .cta-buttons {
                flex-direction: column !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}

export default VideoBanner;
