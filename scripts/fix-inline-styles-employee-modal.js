const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployeeModal.tsx');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Substituir estilos inline por styled-components
const replacements = [
  // Substituir Input com style={{ flex: 1 }} por FlexInput
  {
    pattern: /<Input([^>]*?)style=\{\{ flex: 1 \}\}([^>]*?)>/g,
    replacement: '<FlexInput$1$2>',
  },

  // Substituir button com estilos inline por ActionButtonStyled
  {
    pattern:
      /<button([^>]*?)style=\{\s*padding:\s*['"]0\.5rem['"],\s*background:\s*['"]#29abe2['"],\s*color:\s*white,\s*border:\s*none,\s*border-radius:\s*4px,\s*cursor:\s*pointer,\s*font-size:\s*0\.875rem,\s*font-weight:\s*500,\s*transition:\s*background-color\s*0\.2s,\s*min-width:\s*120px\s*\}([^>]*?)>/g,
    replacement: '<ActionButtonStyled$1$2>',
  },

  // Substituir button com width/height por IconButton
  {
    pattern:
      /<button([^>]*?)style=\{\{ width:\s*['"]20px['"],\s*height:\s*['"]20px['"]\s*\}\}([^>]*?)>/g,
    replacement: '<IconButton$1$2>',
  },

  // Substituir div com position relative por RelativeContainer
  {
    pattern:
      /<div([^>]*?)style=\{\{ position:\s*['"]relative['"]\s*\}\}([^>]*?)>/g,
    replacement: '<RelativeContainer$1$2>',
  },

  // Substituir Input com padding-right por InputWithIcon
  {
    pattern:
      /<Input([^>]*?)style=\{\{ paddingRight:\s*['"]3rem['"]\s*\}\}([^>]*?)>/g,
    replacement: '<InputWithIcon$1$2>',
  },

  // Substituir span com color por SuccessIcon
  {
    pattern:
      /<span([^>]*?)style=\{\{ color:\s*['"]#27ae60['"],\s*fontSize:\s*['"]1\.2rem['"]\s*\}\}([^>]*?)>/g,
    replacement: '<SuccessIcon$1$2>',
  },

  // Substituir div com display flex por FlexContainer
  {
    pattern:
      /<div([^>]*?)style=\{\{ display:\s*['"]flex['"],\s*gap:\s*['"]0\.5rem['"],\s*alignItems:\s*['"]center['"]\s*\}\}([^>]*?)>/g,
    replacement: '<FlexContainer$1$2>',
  },

  // Substituir div com display flex e alignItems por FlexContainerAlign
  {
    pattern:
      /<div([^>]*?)style=\{\{ display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*['"]0\.5rem['"]\s*\}\}([^>]*?)>/g,
    replacement: '<FlexContainerAlign$1$2>',
  },

  // Substituir input com width/height por CheckboxInput
  {
    pattern:
      /<input([^>]*?)style=\{\{ width:\s*['"]20px['"],\s*height:\s*['"]20px['"],\s*margin:\s*0,\s*cursor:\s*['"]pointer['"]\s*\}\}([^>]*?)>/g,
    replacement: '<CheckboxInput$1$2>',
  },
];

// Aplicar todas as substituições
replacements.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

// Fechar tags que foram abertas
content = content.replace(
  /<ActionButtonStyled([^>]*?)>/g,
  '<ActionButtonStyled$1>'
);
content = content.replace(/<IconButton([^>]*?)>/g, '<IconButton$1>');
content = content.replace(
  /<RelativeContainer([^>]*?)>/g,
  '<RelativeContainer$1>'
);
content = content.replace(/<InputWithIcon([^>]*?)>/g, '<InputWithIcon$1>');
content = content.replace(/<SuccessIcon([^>]*?)>/g, '<SuccessIcon$1>');
content = content.replace(/<FlexContainer([^>]*?)>/g, '<FlexContainer$1>');
content = content.replace(
  /<FlexContainerAlign([^>]*?)>/g,
  '<FlexContainerAlign$1>'
);
content = content.replace(/<CheckboxInput([^>]*?)>/g, '<CheckboxInput$1>');

// Fechar tags que foram abertas
content = content.replace(/<\/button>/g, '</ActionButtonStyled>');
content = content.replace(/<\/button>/g, '</IconButton>');
content = content.replace(/<\/div>/g, '</RelativeContainer>');
content = content.replace(/<\/Input>/g, '</InputWithIcon>');
content = content.replace(/<\/span>/g, '</SuccessIcon>');
content = content.replace(/<\/div>/g, '</FlexContainer>');
content = content.replace(/<\/div>/g, '</FlexContainerAlign>');
content = content.replace(/<\/input>/g, '</CheckboxInput>');

// Salvar o arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log(
  '✅ Estilos inline substituídos por styled-components no EmployeeModal.tsx'
);
