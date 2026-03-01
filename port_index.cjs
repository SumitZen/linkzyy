const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'index.html');
const cssRawPath = path.join(__dirname, 'src', 'pages', 'LandingPage.css');
const tsxRawPath = path.join(__dirname, 'src', 'pages', 'LandingPage.tsx');

let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

// Extract CSS
const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    let cssContent = styleMatch[1].trim();
    // Remove the CSS variables on :root since we already put them in globals.css, to avoid conflict, or keep them. 
    // Let's just write the whole thing.
    fs.writeFileSync(cssRawPath, cssContent, 'utf-8');
    console.log('LandingPage.css created successfully.');
}

// Extract Body (from <nav> down to <footer>)
const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<script>/);
if (bodyMatch) {
    let innerHtml = bodyMatch[1].trim();

    // HTML to JSX conversions
    innerHtml = innerHtml.replace(/class=/g, 'className=');
    innerHtml = innerHtml.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

    // Convert style="string" to style={{}}
    innerHtml = innerHtml.replace(/style="([^"]+)"/g, (match, styleStr) => {
        let styleObj = {};
        styleStr.split(';').forEach(rule => {
            let [key, val] = rule.split(':');
            if (key && val) {
                let jsKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                styleObj[jsKey] = val.trim();
            }
        });
        return 'style={' + JSON.stringify(styleObj) + '}';
    });

    // Self closing tags (input, img)
    innerHtml = innerHtml.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');

    // Custom replacements for specific React conflicts
    innerHtml = innerHtml.replace(/onclick="([^"]+)"/g, ''); // Remove inline onclicks

    // Some text might have unescaped chars, but HTML is usually fine in JSX if valid.

    // Let's wrap it in the component
    const tsxContent = `import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './LandingPage.css';
import HeroCanvas from '../components/HeroCanvas';

export default function LandingPage() {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ported 3D phone mouse follow
    const handleMouseMove = (e: MouseEvent) => {
      if (!phoneRef.current) return;
      const dx = (e.clientX / window.innerWidth - 0.5) * 22;
      const dy = (e.clientY / window.innerHeight - 0.5) * 14;
      phoneRef.current.style.transform = \`rotateY(\${dx}deg) rotateX(\${-dy}deg)\`;
      phoneRef.current.style.animation = 'none';
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // We can add the GSAP interactions and Lenis back on top of this structure later.

  return (
    <div className="landingRoot">
      {/* 3D Canvas Background for Hero */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
         <HeroCanvas />
      </div>

${innerHtml.replace(/id="phone3d"/, 'id="phone3d" ref={phoneRef}')}

    </div>
  );
}
`;

    fs.writeFileSync(tsxRawPath, tsxContent, 'utf-8');
    console.log('LandingPage.tsx converted successfully.');
} else {
    console.log("Could not match body");
}
