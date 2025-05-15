import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the hero section', () => {
    render(<HomePage />);
    expect(screen.getByText(/Step into Style/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover the latest trends/i)).toBeInTheDocument();
  });

  it('renders the product section', () => {
    render(<HomePage />);
    expect(screen.getByText(/Explore Our Collection/i)).toBeInTheDocument();
  });

  it('renders collection banners', () => {
    render(<HomePage />);
    expect(screen.getByText(/Men's Collection/i)).toBeInTheDocument();
    expect(screen.getByText(/Women's Collection/i)).toBeInTheDocument();
  });
});
