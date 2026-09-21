import './Thumbnail.css';

// Reused for post cards, chat reference cards, place mini rows and festival cards.
export default function Thumbnail({ variant = 1, image, src, className = '', style }) {
  const url = src || (image ? `https://picsum.photos/seed/${image}/500/360` : null);
  const bgStyle = url
    ? { backgroundImage: `url('${url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  return <div className={`post-thumb c${variant} ${className}`} style={{ ...bgStyle, ...style }} />;
}
