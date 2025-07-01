import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';

interface VideoEntry {
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
    series?: string;
    description?: string;
  };
  media_group?: Array<{
    media_item: Array<{
      key: string;
      src: string;
    }>;
  }>;
}

// Sample video data for demo purposes
const sampleVideos: VideoEntry[] = [
  {
    id: 'sample-1',
    title: 'Miami Heat Championship Highlights',
    summary:
      'Relive the best moments from our championship seasons with incredible plays, clutch shots, and unforgettable victories.',
    content: {
      src: 'https://sample-videos.com/zip/10/mp4/mp4/SampleVideo_1280x720_1mb.mp4',
      type: 'video/mp4',
    },
    extensions: {
      category: 'Highlights',
      duration: 180,
      provider: 'Miami Heat',
      series: 'Championship Series',
    },
    media_group: [
      {
        media_item: [
          {
            key: 'image_base',
            src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop',
          },
        ],
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Player Spotlight: Jimmy Butler',
    summary:
      'Get to know Jimmy Butler on and off the court. From his incredible work ethic to his leadership qualities.',
    content: {
      src: 'https://sample-videos.com/zip/10/mp4/mp4/SampleVideo_1280x720_2mb.mp4',
      type: 'video/mp4',
    },
    extensions: {
      category: 'Player Features',
      duration: 240,
      provider: 'Miami Heat',
      series: 'Player Spotlights',
    },
    media_group: [
      {
        media_item: [
          {
            key: 'image_base',
            src: 'https://images.unsplash.com/photo-1552048797-95c8bbb58882?w=400&h=600&fit=crop',
          },
        ],
      },
    ],
  },
  {
    id: 'sample-3',
    title: 'Behind the Scenes: Training Camp',
    summary:
      'Go behind the scenes during training camp to see how the Heat prepare for the upcoming season.',
    content: {
      src: 'https://sample-videos.com/zip/10/mp4/mp4/SampleVideo_1280x720_5mb.mp4',
      type: 'video/mp4',
    },
    extensions: {
      category: 'Behind the Scenes',
      duration: 300,
      provider: 'Miami Heat',
      series: 'Training Camp',
    },
    media_group: [
      {
        media_item: [
          {
            key: 'image_base',
            src: 'https://images.unsplash.com/photo-1594736797933-d0f7b65c8094?w=400&h=600&fit=crop',
          },
        ],
      },
    ],
  },
  {
    id: 'sample-4',
    title: 'Game Recap: Eastern Conference Finals',
    summary:
      'A complete breakdown of our Eastern Conference Finals performance with key plays and strategic analysis.',
    content: {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video/mp4',
    },
    extensions: {
      category: 'Game Recaps',
      duration: 420,
      provider: 'Miami Heat',
      series: 'Playoffs',
    },
    media_group: [
      {
        media_item: [
          {
            key: 'image_base',
            src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
          },
        ],
      },
    ],
  },
  {
    id: 'sample-5',
    title: 'Community Impact: Heat Cares',
    summary:
      'See how the Miami Heat organization gives back to the community through various charitable initiatives.',
    content: {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
    },
    extensions: {
      category: 'Community',
      duration: 210,
      provider: 'Miami Heat',
      series: 'Heat Cares',
    },
    media_group: [
      {
        media_item: [
          {
            key: 'image_base',
            src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
          },
        ],
      },
    ],
  },
];

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const random = url.searchParams.get('random');
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '1');

  try {
    let videos = [...sampleVideos];

    // Filter by category if specified
    if (category) {
      videos = videos.filter((video) =>
        video.extensions.category
          ?.toLowerCase()
          .includes(category.toLowerCase()),
      );
    }

    // If random is requested, shuffle and return random video(s)
    if (random === 'true') {
      for (let i = videos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videos[i], videos[j]] = [videos[j], videos[i]];
      }
    }

    // Limit results
    const selectedVideos = videos.slice(0, limit);

    // Return in the expected format (matching the original API structure)
    const response = {
      entry: selectedVideos,
      meta: {
        total: videos.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    };

    return json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating video content:', error);

    return json(
      {
        error: 'Failed to fetch video content',
        entry: [],
        meta: {
          total: 0,
          limit,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function action({request}: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  return json({error: 'Method not allowed'}, {status: 405});
}
