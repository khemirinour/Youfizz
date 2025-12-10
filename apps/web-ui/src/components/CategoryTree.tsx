'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import type { Category } from '@/lib/categories.api';

interface CategoryTreeProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  className?: string;
}

export function CategoryTree({ categories, selectedIds, onToggle, className = '' }: CategoryTreeProps) {
  // Helper function to check if a category should be shown
  const shouldShowCategory = (category: Category): boolean => {
    // Always show root categories (no parent)
    if (!category.parentId) return true;
    
    // Show if parent is selected
    const parent = categories.find(cat => cat.id === category.parentId);
    if (parent && selectedIds.includes(category.parentId)) return true;
    
    // Show if any ancestor is selected
    const findAncestor = (cat: Category | undefined): boolean => {
      if (!cat || !cat.parentId) return false;
      if (selectedIds.includes(cat.parentId)) return true;
      const ancestor = categories.find(c => c.id === cat.parentId);
      return findAncestor(ancestor);
    };
    
    return findAncestor(category);
  };

  // Get root categories (categories without parents)
  const rootCategories = useMemo(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  // Render category with children recursively
  const renderCategory = (category: Category, level: number = 0): JSX.Element => {
    const isSelected = selectedIds.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const showChildren = isSelected && hasChildren;
    const childrenToShow = category.children?.filter(child => shouldShowCategory(child)) || [];

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center space-x-2 py-1.5 ${level > 0 ? 'pl-6' : ''}`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <Checkbox
            id={`cat-${category.id}`}
            checked={isSelected}
            onCheckedChange={() => onToggle(category.id)}
          />
          <Label
            htmlFor={`cat-${category.id}`}
            className="text-sm font-normal cursor-pointer flex-1 flex items-center gap-2"
          >
            {hasChildren && (
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${showChildren ? 'rotate-90' : ''}`}
              />
            )}
            <span className={level === 0 ? 'font-medium' : ''}>{category.name}</span>
            {category.description && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({category.description})
              </span>
            )}
          </Label>
        </div>
        {showChildren && childrenToShow.length > 0 && (
          <div className="ml-4 border-l-2 border-muted pl-2">
            {childrenToShow.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (rootCategories.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground py-4 text-center ${className}`}>
        No categories available
      </div>
    );
  }

  return (
    <div className={className}>
      {rootCategories.map(category => renderCategory(category))}
    </div>
  );
}
