import React, { ReactNode } from 'react';
import { Box, Container, Paper, Typography, Stepper, Step, StepLabel, styled } from '@mui/material';

// Styled components
const FormContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(6),
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
  backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.1))',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

const FormSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
}));

interface BotFormLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  activeStep: number;
  steps: string[];
}

const BotFormLayout: React.FC<BotFormLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  activeStep, 
  steps 
}) => {
  return (
    <FormContainer maxWidth="lg">
      <FormPaper elevation={0}>
        <FormHeader>
          <FormTitle variant="h4" gutterBottom align="center">
            {title}
          </FormTitle>
          <FormSubtitle variant="subtitle1" align="center">
            {subtitle}
          </FormSubtitle>

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </FormHeader>

        {children}
      </FormPaper>
    </FormContainer>
  );
};

export default BotFormLayout; 