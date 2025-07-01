import type {MetaFunction} from '@shopify/remix-oxygen';
import React, {useState} from 'react';

import {VideoBanner} from '~/components/VideoBanner';
import {MyStuff} from '~/components/MyStuff';

export const meta: MetaFunction = () => {
  return [
    {title: 'Video Demo - Miami Heat'},
    {property: 'og:title', content: 'Video Demo - Miami Heat'},
    {
      name: 'description',
      content: 'Demo page showcasing the VideoBanner and MyStuff components',
    },
  ];
};

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

export default function VideoDemo() {
  const [currentVideoInBanner, setCurrentVideoInBanner] =
    useState<VideoData | null>(null);

  // Handle video play from MyStuff - this will integrate the two components
  const handleVideoPlay = (video: VideoData) => {
    console.log('Playing video from MyStuff in banner:', video);
    setCurrentVideoInBanner(video);

    // Scroll to video banner
    const banner = document.querySelector('.video-banner');
    if (banner) {
      banner.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Video Banner - Using API */}
      <section className="mb-8">
        <h2 className="text-white text-2xl font-bold text-center py-8">
          Video Banner - API Content
        </h2>
        <VideoBanner
          apiUrl="https://winoapi.replit.app/?random=true"
          useMyStuff={false}
          refreshInterval={30}
          videoHeight={70}
          mobileVideoHeight={50}
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
          showPlayButton={true}
          showAddButton={true}
        />
      </section>

      {/* My Stuff Section */}
      <section className="mb-8">
        <MyStuff
          sectionTitle="My Stuff"
          backgroundColor="#111111"
          sectionPadding={{top: 40, bottom: 40}}
          titleSettings={{
            fontSize: 32,
            fontWeight: '600',
            color: '#FFFFFF',
            alignment: 'left',
            marginBottom: 20,
          }}
          itemSettings={{
            width: 200,
            mobileWidth: 140,
            gap: 15,
            borderRadius: 8,
          }}
          showClearButton={true}
          onVideoPlay={handleVideoPlay}
        />
      </section>

      {/* My Stuff Video Banner - Shows videos from user's collection */}
      <section className="mb-8">
        <h2 className="text-white text-2xl font-bold text-center py-8">
          Video Banner - My Stuff Content
        </h2>
        <VideoBanner
          useMyStuff={true}
          refreshInterval={15}
          videoHeight={60}
          mobileVideoHeight={40}
          titleSettings={{
            fontSize: 36,
            fontWeight: '600',
            color: '#FFD700',
          }}
          summarySettings={{
            fontSize: 16,
            color: '#FFFFFF',
            maxWidth: 70,
          }}
          textPosition="top"
          showPlayButton={true}
          showAddButton={false}
          className="border-2 border-yellow-500"
        />
      </section>

      {/* Compact Video Banner Example */}
      <section className="mb-8">
        <h2 className="text-white text-2xl font-bold text-center py-8">
          Compact Video Banner
        </h2>
        <VideoBanner
          apiUrl="https://winoapi.replit.app/?random=true"
          refreshInterval={45}
          videoHeight={40}
          mobileVideoHeight={30}
          containerPadding={{top: 20, bottom: 20, left: 20, right: 20}}
          textPadding={{top: 20, bottom: 20, left: 20, right: 20}}
          titleSettings={{
            fontSize: 28,
            fontWeight: '500',
            color: '#FFFFFF',
          }}
          summarySettings={{
            fontSize: 14,
            color: '#CCCCCC',
            maxWidth: 80,
          }}
          showPlayButton={false}
          showAddButton={true}
        />
      </section>

      {/* Custom Styled My Stuff */}
      <section className="mb-8">
        <MyStuff
          sectionTitle="Featured Collection"
          backgroundColor="#1a1a2e"
          sectionPadding={{top: 60, bottom: 60}}
          titleSettings={{
            fontSize: 28,
            fontWeight: '700',
            color: '#00d4ff',
            alignment: 'center',
            marginBottom: 30,
          }}
          itemSettings={{
            width: 180,
            mobileWidth: 120,
            gap: 20,
            borderRadius: 12,
          }}
          emptyState={{
            title: 'No featured content yet',
            message: 'Add some videos to see them featured here!',
            textColor: '#00d4ff',
          }}
          showClearButton={false}
          metaTextColor="#00d4ff"
          onVideoPlay={handleVideoPlay}
        />
      </section>

      {/* Instructions Section */}
      <section className="bg-gray-900 text-white p-8 mx-4 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Watch videos in the banner sections above</li>
          <li>
            Click &quot;Add to My Stuff&quot; to save videos to your collection
          </li>
          <li>View your saved videos in the &quot;My Stuff&quot; sections</li>
          <li>
            Click on any video in &quot;My Stuff&quot; to play it in the banner
          </li>
          <li>
            Remove videos by clicking the &quot;×&quot; button when hovering
            over items
          </li>
          <li>
            The &quot;My Stuff&quot; data is stored in your browser&apos;s
            localStorage
          </li>
        </ol>

        <h4 className="text-lg font-bold mt-6 mb-2">Component Features</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>VideoBanner: Supports MP4, HLS, and other Video.js formats</li>
          <li>VideoBanner: Auto-refresh content at configurable intervals</li>
          <li>
            VideoBanner: Fully customizable styling and data source mapping
          </li>
          <li>MyStuff: localStorage-based video collection management</li>
          <li>MyStuff: Horizontal scrolling rail with responsive design</li>
          <li>Cross-component integration for seamless video playback</li>
        </ul>
      </section>
    </div>
  );
}
