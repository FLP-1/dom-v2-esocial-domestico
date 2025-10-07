import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard } from '../unified';

// Styled Components
const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div<{ $theme: any; $variant: 'worked' | 'expected' | 'difference' }>`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$variant) {
        case 'worked':
          return props.$theme.colors.primary;
        case 'expected':
          return '#3498db';
        case 'difference':
          return '#f39c12';
        default:
          return props.$theme.colors.primary;
      }
    }};
  }
`;

const TimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimeLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const TimeValue = styled.span<{ $theme: any; $variant: 'worked' | 'expected' | 'difference' }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => {
    switch (props.$variant) {
      case 'worked':
        return props.$theme.colors.primary;
      case 'expected':
        return '#3498db';
      case 'difference':
        return '#f39c12';
      default:
        return props.$theme.colors.text;
    }
  }};
`;

const DifferenceIndicator = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.$positive ? '#27ae60' : '#e74c3c'};
  margin-left: 0.5rem;
`;


// Interfaces
export interface TimeSummary {
  day: {
    worked: number; // em minutos
    expected: number; // em minutos
  };
  week: {
    worked: number;
    expected: number;
  };
  month: {
    worked: number;
    expected: number;
  };
}

export interface TimeSummaryCardProps {
  summary: TimeSummary;
  theme: any;
  overtimeData?: any;
}

// Helper function para formatar tempo
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
};

// Helper function para calcular diferença
const calculateDifference = (worked: number, expected: number): { value: number; positive: boolean } => {
  const diff = worked - expected;
  return {
    value: Math.abs(diff),
    positive: diff >= 0
  };
};

export const TimeSummaryCard: React.FC<TimeSummaryCardProps> = ({
  summary,
  theme,
  overtimeData,
}) => {
  const dayDiff = calculateDifference(summary.day.worked, summary.day.expected);
  const weekDiff = calculateDifference(summary.week.worked, summary.week.expected);
  const monthDiff = calculateDifference(summary.month.worked, summary.month.expected);

  return (
    <SummaryContainer>
      {/* Horas Trabalhadas */}
      <SummaryCard $theme={theme} $variant="worked">
        <UnifiedCard
          theme={theme}
          variant="default"
          size="md"
          title={
            <>
              <AccessibleEmoji emoji="⏱️" label="Trabalhado" />
              Horas Trabalhadas
            </>
          }
        >
          <TimeRow>
            <TimeLabel>Hoje:</TimeLabel>
            <TimeValue $theme={theme} $variant="worked">
              {formatTime(summary.day.worked)}
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Esta Semana:</TimeLabel>
            <TimeValue $theme={theme} $variant="worked">
              {formatTime(summary.week.worked)}
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Este Mês:</TimeLabel>
            <TimeValue $theme={theme} $variant="worked">
              {formatTime(summary.month.worked)}
            </TimeValue>
          </TimeRow>
        </UnifiedCard>
      </SummaryCard>

      {/* Horas Esperadas */}
      <SummaryCard $theme={theme} $variant="expected">
        <UnifiedCard
          theme={theme}
          variant="default"
          size="md"
          title={
            <>
              <AccessibleEmoji emoji="📅" label="Esperado" />
              Horas Esperadas
            </>
          }
        >
          <TimeRow>
            <TimeLabel>Hoje:</TimeLabel>
            <TimeValue $theme={theme} $variant="expected">
              {formatTime(summary.day.expected)}
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Esta Semana:</TimeLabel>
            <TimeValue $theme={theme} $variant="expected">
              {formatTime(summary.week.expected)}
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Este Mês:</TimeLabel>
            <TimeValue $theme={theme} $variant="expected">
              {formatTime(summary.month.expected)}
            </TimeValue>
          </TimeRow>
        </UnifiedCard>
      </SummaryCard>

      {/* Diferenças */}
      <SummaryCard $theme={theme} $variant="difference">
        <UnifiedCard
          theme={theme}
          variant="default"
          size="md"
          title={
            <>
              <AccessibleEmoji emoji="📊" label="Diferença" />
              Diferenças
            </>
          }
        >
          <TimeRow>
            <TimeLabel>Hoje:</TimeLabel>
            <TimeValue $theme={theme} $variant="difference">
              {formatTime(dayDiff.value)}
              <DifferenceIndicator $positive={dayDiff.positive}>
                <AccessibleEmoji 
                  emoji={dayDiff.positive ? "📈" : "📉"} 
                  label={dayDiff.positive ? "Acima" : "Abaixo"} 
                />
              </DifferenceIndicator>
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Esta Semana:</TimeLabel>
            <TimeValue $theme={theme} $variant="difference">
              {formatTime(weekDiff.value)}
              <DifferenceIndicator $positive={weekDiff.positive}>
                <AccessibleEmoji 
                  emoji={weekDiff.positive ? "📈" : "📉"} 
                  label={weekDiff.positive ? "Acima" : "Abaixo"} 
                />
              </DifferenceIndicator>
            </TimeValue>
          </TimeRow>
          <TimeRow>
            <TimeLabel>Este Mês:</TimeLabel>
            <TimeValue $theme={theme} $variant="difference">
              {formatTime(monthDiff.value)}
              <DifferenceIndicator $positive={monthDiff.positive}>
                <AccessibleEmoji 
                  emoji={monthDiff.positive ? "📈" : "📉"} 
                  label={monthDiff.positive ? "Acima" : "Abaixo"} 
                />
              </DifferenceIndicator>
            </TimeValue>
          </TimeRow>
        </UnifiedCard>
      </SummaryCard>

      {/* Horas Extras */}
      {overtimeData && (
        <SummaryCard $theme={theme} $variant="worked">
          <UnifiedCard
            theme={theme}
            variant="default"
            size="md"
            title={
              <>
                <AccessibleEmoji emoji="⏰" label="Horas Extras" />
                Horas Extras
              </>
            }
          >
            <TimeRow>
              <TimeLabel>Hoje:</TimeLabel>
              <TimeValue $theme={theme} $variant="worked">
                {overtimeData.overtime?.day?.overtime || '0.0'}h
              </TimeValue>
            </TimeRow>
            <TimeRow>
              <TimeLabel>Esta Semana:</TimeLabel>
              <TimeValue $theme={theme} $variant="worked">
                {overtimeData.overtime?.week?.overtime || '0.0'}h
              </TimeValue>
            </TimeRow>
            <TimeRow>
              <TimeLabel>Este Mês:</TimeLabel>
              <TimeValue $theme={theme} $variant="worked">
                {overtimeData.overtime?.month?.overtime || '0.0'}h
              </TimeValue>
            </TimeRow>
            <TimeRow>
              <TimeLabel>Total:</TimeLabel>
              <TimeValue $theme={theme} $variant="worked">
                {overtimeData.totalOvertime || '0.0'}h
              </TimeValue>
            </TimeRow>
          </UnifiedCard>
        </SummaryCard>
      )}
    </SummaryContainer>
  );
};

export default TimeSummaryCard;
