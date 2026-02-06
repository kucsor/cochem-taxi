import xss from 'xss';

// Configure xss to allow style and class attributes on common tags
// We clone the default whitelist
const whiteList = { ...xss.whiteList };

// List of tags where we want to allow 'class' and 'style' attributes
// This ensures that dictionary content with styling/layout is preserved
const tagsAllowingClassAndStyle = [
  'div', 'span', 'p', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'pre', 'code', 'img'
];

tagsAllowingClassAndStyle.forEach(tag => {
  if (!whiteList[tag]) {
      whiteList[tag] = [];
  }
  // Add 'class' and 'style' if not already present
  if (!whiteList[tag].includes('class')) whiteList[tag].push('class');
  if (!whiteList[tag].includes('style')) whiteList[tag].push('style');
});

// For images, allow src, alt, width, height
if (whiteList.img) {
  ['src', 'alt', 'width', 'height', 'title'].forEach(attr => {
    if (!whiteList.img.includes(attr)) whiteList.img.push(attr);
  });
}

const options = {
  whiteList,
  css: {
    whiteList: {
       // Allow common CSS properties if needed, or leave default (which is fairly strict)
       // Default cssfilter allows standard properties.
    }
  },
  stripIgnoreTag: true, // Filter out tags not in whitelist
  stripIgnoreTagBody: ['script', 'style'] // Filter out script/style tags and their content
};

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return xss(html, options);
}
