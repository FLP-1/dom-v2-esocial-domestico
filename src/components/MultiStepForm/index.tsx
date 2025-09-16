import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { createThemedStyles, designConstants } from '../../design-system';
import { Button } from '../../design-system/components';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: boolean;
  isOptional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  theme?: any;
  className?: string;
  showStepNumbers?: boolean;
  allowSkipSteps?: boolean;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
`;

const StepIndicator = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 2rem;
      background: ${themedStyles.surface};
      border-bottom: 1px solid ${themedStyles.border};

      @media (max-width: 768px) {
        padding: 1rem 1.5rem;
        overflow-x: auto;
      }
    `;
  }}
`;

const StepItem = styled.div<{
  $active: boolean;
  $completed: boolean;
  $theme: any;
  $optional: boolean;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      display: flex;
      align-items: center;
      flex-shrink: 0;

      &:not(:last-child)::after {
        content: '';
        width: 2rem;
        height: 2px;
        background: ${props.$completed ? themedStyles.success : themedStyles.border};
        margin: 0 0.5rem;

        @media (max-width: 768px) {
          width: 1rem;
        }
      }
    `;
  }}
`;

const StepCircle = styled.div<{
  $active: boolean;
  $completed: boolean;
  $theme: any;
  $optional: boolean;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    const getStepStyles = () => {
      if (props.$completed) {
        return {
          background: themedStyles.success,
          color: '#FFFFFF',
          border: `2px solid ${themedStyles.success}`,
        };
      } else if (props.$active) {
        return {
          background: themedStyles.primary,
          color: '#FFFFFF',
          border: `2px solid ${themedStyles.primary}`,
        };
      } else {
        return {
          background: 'transparent',
          color: themedStyles.textSecondary,
          border: `2px solid ${themedStyles.border}`,
        };
      }
    };

    const stepStyles = getStepStyles();

    return `
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      transition: ${designConstants.transition.base};
      background: ${stepStyles.background};
      color: ${stepStyles.color};
      border: ${stepStyles.border};
      position: relative;

      ${
        props.$optional
          ? `
        &::after {
          content: '?';
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          width: 1rem;
          height: 1rem;
          background: ${themedStyles.warning};
          color: white;
          border-radius: 50%;
          font-size: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `
          : ''
      }

      @media (max-width: 768px) {
        width: 2rem;
        height: 2rem;
        font-size: 0.75rem;
      }
    `;
  }}
`;

const StepContent = styled.div<{ $theme: any }>`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const StepNavigation = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: ${themedStyles.surface};
      border-top: 1px solid ${themedStyles.border};
      gap: 1rem;

      @media (max-width: 768px) {
        padding: 1rem 1.5rem;
        flex-direction: column-reverse;

        > div {
          width: 100%;
          display: flex;
          gap: 1rem;
        }

        button {
          flex: 1;
        }
      }
    `;
  }}
`;

const StepInfo = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      flex: 1;

      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: ${themedStyles.text};
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: ${themedStyles.textSecondary};
      }

      @media (max-width: 768px) {
        text-align: center;

        h3 {
          font-size: 1rem;
        }
      }
    `;
  }}
`;

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  theme,
  className,
  showStepNumbers = true,
  allowSkipSteps = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<any>({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoNext = currentStep?.isValid !== false || allowSkipSteps;
  const canGoPrevious = currentStepIndex > 0;

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      setCurrentStepIndex(prev => prev + 1);
    } else if (isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (
      allowSkipSteps ||
      completedSteps.has(stepIndex) ||
      stepIndex <= currentStepIndex
    ) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <FormContainer className={className}>
      {/* Indicador de etapas */}
      <StepIndicator $theme={theme}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            $active={index === currentStepIndex}
            $completed={completedSteps.has(index)}
            $theme={theme}
            $optional={step.isOptional || false}
            onClick={() => handleStepClick(index)}
            style={{ cursor: allowSkipSteps ? 'pointer' : 'default' }}
          >
            <StepCircle
              $active={index === currentStepIndex}
              $completed={completedSteps.has(index)}
              $theme={theme}
              $optional={step.isOptional || false}
            >
              {completedSteps.has(index)
                ? '✓'
                : showStepNumbers
                  ? index + 1
                  : '●'}
            </StepCircle>
          </StepItem>
        ))}
      </StepIndicator>

      {/* Conteúdo da etapa atual */}
      <StepContent $theme={theme}>
        {React.cloneElement(currentStep.component as React.ReactElement, {
          formData,
          updateFormData,
          theme,
          stepIndex: currentStepIndex,
          totalSteps: steps.length,
        })}
      </StepContent>

      {/* Navegação */}
      <StepNavigation $theme={theme}>
        <StepInfo $theme={theme}>
          <h3>{currentStep.title}</h3>
          {currentStep.description && <p>{currentStep.description}</p>}
        </StepInfo>

        <div>
          <Button
            variant='secondary'
            theme={theme}
            onClick={isFirstStep ? onCancel : handlePrevious}
          >
            {isFirstStep ? 'Cancelar' : 'Anterior'}
          </Button>

          <Button
            variant='primary'
            theme={theme}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            {isLastStep ? 'Finalizar' : 'Próximo'}
          </Button>
        </div>
      </StepNavigation>
    </FormContainer>
  );
};

export default MultiStepForm;
