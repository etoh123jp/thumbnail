import { useEffect } from 'react';

export default function Custom404() {
  useEffect(() => {
    // ここで何らかの処理を行う
    console.log('404 page is loaded');
  }, []);

  return <h1>404 - Page Not Found</h1>;
}