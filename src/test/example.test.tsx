import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Example Unit Test', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Content</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});



