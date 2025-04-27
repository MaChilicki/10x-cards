import { useState, useEffect } from "react";

export function useSearchParams() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  return searchParams;
}
