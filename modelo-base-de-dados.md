# Possíveis tabelas

- [x] Estudantes
- [x] Usuário
- [x] Perfil
- [x] Matrícula
- [x] Curso
- [x] Notas
- [ ] Histórico
- [x] Turma
- [x] Ano Lectivo
- [x] Classe
- [x] Disciplinas
- [x] Faltas
- [x] Papel


## Usuario
- id
- nomeUsuario
- email
- senha
- estado
- criadoEm
- atualizadoEm
- *papelId*

## Perfil
- id
- nome
- bilheteIdentidade
- dataNascimento
- foto
- endereco
- bio
- genero
- criadoEm
- atualizadoEm
- *usuarioId*

- ADMIN DIRECTOR SUBDIRETOR_PEDAGOGICO PROFESSOR ESTUDANTE SECRETARIA


## Papel 
- id
- nome
- criadoEm
- atualizadoEm

## Classe
- id
- nome
- nivel
- criadoEm
- atualizadoEm

## Ano Lectivo
- id
- nome
- dataInicio
- dataFim
- estado
- criadoEm
- atualizadoEm

## Curso
- id
- nome
- codigo
- criadoEm
- atualizadoEm

## Turma
- id
- nome
- codigo
- turno
- *anoLectivoId*
- *cursoId*
- *classeId*
- capacidade
- criadoEm
- atualizadoEm

## Disciplina
- id
- nome
- codigo
- descricao
- cargaHoraria
- estado
- criadoEm
- atualizadoEm

## DisciplinaTurma
- id
- *turmaId*
- *disciplinaId*
- *professorId*
- cargaHoraria
- estado
- criadoEm
- atualizadoEm

## ProfessorDisciplina
- id
- *professorId*
- *disciplinaId*
- criadoEm
- atualizadoEm

## Estudante
- id
- numeroProcesso
- *perfilId*
- estado
- criadoEm
- atualizadoEm

## Matrícula
- id
- *estudanteId*
- *turmaId*
- dataMatricula
- estado
- tipo
- criadoEm
- AtualizadoEm

## Faltas
- id
- *matriculaId*
- *disciplinaId*
- data
- justificada
- motivo
- registadoPorUsuarioId
- criadoEm
- atualizadoEm

## Notas
- id
- *matriculaId*
- *disciplina*
- *lancadoPorUsuarioId*
- tipo
- valor
- criadoEm
- atualizadoEm

## Documento
- id
- titulo
- descricao
- nomeFicheiro
- caminhoFicheiro
- tipo
- formato
- tamanho
- usuarioId
- enviadoPorUsuarioId
- estado
- criadoEm
- atualizadoEm
