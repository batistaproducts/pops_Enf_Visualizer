import { PopItem } from '../types';

export const EXAMPLE_POPS: PopItem[] = [
  {
    id: 'example-001',
    code: 'EX-POP-001',
    title: 'Exemplo: Monitoração de Sinais Vitais',
    category: 'Procedimentos Gerais',
    hospitalIds: ['hosp-001'],
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'Equipe EnfermaPOP',
    revisedBy: 'Setor de Educação Continuada',
    objective: 'Padronizar a verificação de sinais vitais para monitoração básica do paciente.',
    targetAudience: 'Equipe de Enfermagem',
    materials: [
      'Termômetro',
      'Esfignomanômetro',
      'Estetoscópio',
      'Oxímetro de pulso'
    ],
    keywords: ['sinais vitais', 'exemplo', 'monitoração'],
    steps: [
      {
        stepNumber: 1,
        title: 'Higienização das Mãos',
        description: 'Realizar a lavagem das mãos conforme protocolo institucional.'
      },
      {
        stepNumber: 2,
        title: 'Verificação da Temperatura',
        description: 'Posicionar o termômetro na axila do paciente e aguardar sinal sonoro.'
      }
    ],
    risks: ['Leitura incorreta por mau posicionamento do manguito', 'Falha no equipamento'],
    references: 'Protocolo Brasileiro de Segurança do Paciente, 2023.'
  },
  {
    id: 'example-002',
    code: 'EX-POP-002',
    title: 'Exemplo: Administração de Medicamentos Via Oral',
    category: 'Medicação',
    hospitalIds: ['hosp-001'],
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'Equipe EnfermaPOP',
    revisedBy: 'Farmácia Clínica',
    objective: 'Garantir a administração segura de medicamentos por via oral seguindo os certos da medicação.',
    targetAudience: 'Enfermeiros e Técnicos de Enfermagem',
    materials: [
      'Copo descartável',
      'Água',
      'Prescrição médica',
      'Medicamento'
    ],
    keywords: ['medicação', 'oral', 'exemplo', 'segurança do paciente'],
    steps: [
      {
        stepNumber: 1,
        title: 'Conferência da Prescrição',
        description: 'Verificar os 9 certos da medicação antes do preparo.'
      },
      {
        stepNumber: 2,
        title: 'Identificação do Paciente',
        description: 'Confirmar nome completo e data de nascimento do paciente.'
      }
    ],
    risks: ['Broncoaspiração', 'Troca de medicamento'],
    references: 'Guia de Boas Práticas em Enfermagem, 2024.'
  }
];
