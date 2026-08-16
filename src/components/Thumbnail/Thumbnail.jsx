import './Thumbnail.css';

// Reused for post cards, chat reference cards, place mini rows and festival cards.
export default function Thumbnail({ variant = 1, image, className = '', style }) {
  const bgStyle = image
    ? { backgroundImage: `url('https://picsum.photos/seed/${image}/500/360')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  return <div className={`post-thumb c${variant} ${className}`} style={{ ...bgStyle, ...style }} />;
}
