import React from 'react';
import styled from 'styled-components';
import { Widget, WidgetProps } from '../Widget';

const GridContainer = styled.div<{ $columns?: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.$gap || '1.5rem'};
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 1200px) {
    grid-template-columns: ${props =>
      props.$columns
        ? `repeat(${props.$columns}, 1fr)`
        : 'repeat(auto-fit, minmax(300px, 1fr))'};
  }
`;

export interface WidgetGridProps {
  widgets: WidgetProps[];
  columns?: number;
  gap?: string;
  onWidgetClick?: (widgetId: string) => void;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  columns,
  gap,
  onWidgetClick,
}) => {
  return (
    <GridContainer
      {...(columns && { $columns: columns })}
      {...(gap && { $gap: gap })}
    >
      {(widgets || []).map(widget => (
        <Widget
          key={widget.id}
          {...widget}
          onClick={() => onWidgetClick?.(widget.id)}
        />
      ))}
    </GridContainer>
  );
};

export default WidgetGrid;
