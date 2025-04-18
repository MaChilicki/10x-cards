import { useMemo } from "react";

export interface DocumentRouteParams {
  documentId?: string;
  topicId?: string;
}

export function useRouteParams(): DocumentRouteParams {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      documentId: params.get("id") || undefined,
      topicId: params.get("topic_id") || undefined,
    };
  }, []);
}
