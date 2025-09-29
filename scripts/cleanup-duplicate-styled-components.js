const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployeeModal.tsx');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Remover styled-components duplicados e usar os compartilhados
const replacements = [
  // Remover FlexContainer duplicado
  {
    pattern:
      /const FlexContainer = styled\.div`\s*display: flex;\s*gap: 0\.5rem;\s*align-items: flex-start;\s*`;\s*/g,
    replacement: '',
  },

  // Remover FlexCenterContainer duplicado
  {
    pattern:
      /const FlexCenterContainer = styled\.div`\s*display: flex;\s*gap: 0\.5rem;\s*align-items: center;\s*`;\s*/g,
    replacement: '',
  },

  // Remover ValidationLabel duplicado
  {
    pattern:
      /const ValidationLabel = styled\.label<\{ \$isValid\?: boolean \}>`\s*display: block;\s*font-size: 0\.9rem;\s*color: \$\{props => \(props\.\$isValid \? '#27ae60' : '#e74c3c'\)\};\s*cursor: pointer;\s*margin-bottom: 0\.5rem;\s*`;\s*/g,
    replacement: '',
  },

  // Remover ValidationButton duplicado
  {
    pattern:
      /const ValidationButton = styled\.button`\s*padding: 0\.5rem;\s*background: #29abe2;\s*color: white;\s*border: none;\s*border-radius: 4px;\s*cursor: pointer;\s*font-size: 0\.8rem;\s*white-space: nowrap;\s*transition: background 0\.3s ease;\s*&:hover \{\s*background: #1e8bc3;\s*\}\s*&:disabled \{\s*background: #ccc;\s*cursor: not-allowed;\s*\}\s*`;\s*/g,
    replacement: '',
  },

  // Remover CepButton duplicado
  {
    pattern:
      /const CepButton = styled\.button<\{ \$disabled\?: boolean \}>`\s*padding: 0\.5rem 1rem;\s*background: \$\{props => \(props\.\$disabled \? '#ccc' : '#29abe2'\)\};\s*color: white;\s*border: none;\s*border-radius: 4px;\s*cursor: \$\{props => \(props\.\$disabled \? 'not-allowed' : 'pointer'\)\};\s*font-size: 0\.8rem;\s*white-space: nowrap;\s*transition: background 0\.3s ease;\s*&:hover \{\s*background: \$\{props => \(props\.\$disabled \? '#ccc' : '#1e8bc3'\)\};\s*\}\s*`;\s*/g,
    replacement: '',
  },

  // Remover ErrorMessage duplicado
  {
    pattern:
      /const ErrorMessage = styled\.div`\s*color: #e74c3c;\s*font-size: 0\.8rem;\s*margin-top: 0\.25rem;\s*font-weight: 500;\s*`;\s*/g,
    replacement: '',
  },

  // Remover HelpText duplicado
  {
    pattern:
      /const HelpText = styled\.div`\s*color: #7f8c8d;\s*font-size: 0\.8rem;\s*margin-top: 0\.25rem;\s*font-style: italic;\s*`;\s*/g,
    replacement: '',
  },
];

// Aplicar todas as substituições
replacements.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

// Adicionar import dos styled-components compartilhados
const importStatement = `import {
  FlexContainer,
  ValidationButton,
  CheckboxContainer,
  SuccessMessage,
  InputStyled,
  ErrorMessage,
  HelpText
} from './shared/styles';`;

// Substituir o import existente
content = content.replace(
  /import { \s*FlexContainer, \s*ValidationButton, \s*CheckboxContainer,\s*SuccessMessage,\s*InputStyled\s*} from '\.\/shared\/styles';/,
  importStatement
);

// Salvar o arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log(
  '✅ Styled-components duplicados removidos e substituídos por compartilhados'
);
