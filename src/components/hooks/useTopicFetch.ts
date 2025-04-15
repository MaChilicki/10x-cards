import { useState, useEffect } from 'react';
import type { TopicDto } from '@/types';

interface UseTopicFetchResult {
  topic: { id: string } | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTopicFetch(topicId?: string): UseTopicFetchResult {
  const [topic, setTopic] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    setTopic({ id: topicId });
  }, [topicId]);

  return {
    topic,
    isLoading,
    error
  };
} 