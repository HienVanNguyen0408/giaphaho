import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroSection from '@/components/public/home/HeroSection';

describe('HeroSection', () => {
  it('renders the family name heading', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toMatch(/Họ Phùng/);
    expect(heading.textContent).toMatch(/Bát Tràng/);
  });

  it('renders a CTA link pointing to /gia-pha', () => {
    render(<HeroSection />);
    const ctaLink = screen.getByRole('link', { name: /Khám Phá Gia Phả/i });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/gia-pha');
  });
});
