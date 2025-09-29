import React from 'react';

interface AccessibleEmojiProps {
  emoji: string;
  label: string;
  className?: string;
}

const AccessibleEmoji: React.FC<AccessibleEmojiProps> = ({
  emoji,
  label,
  className,
}) => {
  return (
    <span role='img' aria-label={label} className={className}>
      {emoji}
    </span>
  );
};

export default AccessibleEmoji;
