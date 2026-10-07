import React from 'react';
import { TAG_ICONS_MAP, DEFAULT_TAG_ICON } from '@/lib/tag-icons';

interface TagIconProps {
  name?: string;
  className?: string;
}

export const TagIcon: React.FC<TagIconProps> = ({ name, className }) => {
  const IconComp = (name && TAG_ICONS_MAP[name]) || DEFAULT_TAG_ICON;
  return <IconComp className={className} />;
};
