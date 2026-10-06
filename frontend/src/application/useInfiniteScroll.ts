import { useEffect, useRef, useState } from 'react';
import type { TelemetryData } from '../domain/telemetry.js';

const ITEMS_PER_BATCH = 24;

export const useInfiniteScroll = (allNodes: ReadonlyArray<TelemetryData>) => {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_BATCH);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayedNodes = allNodes.slice(0, displayedCount);
  const hasMore = displayedCount < allNodes.length;

  const loadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_BATCH, allNodes.length));
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      // Load more when user is near bottom (within 200px)
      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore) {
        setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_BATCH, allNodes.length));
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [allNodes.length, hasMore]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { displayedNodes, scrollContainerRef, scrollToTop, hasMore, displayedCount, loadMore };
};
