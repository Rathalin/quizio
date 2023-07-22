import { useCallback, useRef } from 'react';

type ScrollObserverProps = {
  onIntersect: () => void;
};

export default function ScrollObserver({ onIntersect }: ScrollObserverProps) {
  const observer = useRef<IntersectionObserver | null>();

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current != null) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      });
      if (node) observer.current.observe(node);
    },
    [onIntersect]
  );

  return <div ref={lastElementRef} />;
}
