
import React from 'react';
import { Button } from './ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto py-4 flex space-x-2 w-full">
      {categories.map(category => (
        <Button 
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
