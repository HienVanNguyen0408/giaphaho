import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TinNoiBat from '@/components/public/home/TinNoiBat';
import type { NewsListItem } from '@/types';

const mockNews: NewsListItem = {
  id: '1',
  title: 'Lễ giỗ tổ họ Phùng năm 2025',
  slug: 'le-gio-to-ho-phung-2025',
  thumbnail: null,
  isPinned: true,
  publishedAt: '2025-04-01T08:00:00.000Z',
  updatedAt: '2025-04-01T08:00:00.000Z',
};

describe('TinNoiBat', () => {
  it('renders the news title when news items are provided', () => {
    render(<TinNoiBat news={[mockNews]} />);
    expect(screen.getByText('Lễ giỗ tổ họ Phùng năm 2025')).toBeDefined();
  });

  it('renders an empty state when no news is provided', () => {
    render(<TinNoiBat news={[]} />);
    expect(screen.getByText(/Chưa có tin nổi bật/i)).toBeDefined();
  });
});
