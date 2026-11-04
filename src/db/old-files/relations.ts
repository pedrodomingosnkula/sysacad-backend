import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

// Drizzle v1 (RQB v2): npm i drizzle-orm@rc && npm i -D drizzle-kit@rc
// As relations existem só ao nível da aplicação; as FKs reais estão no schema.ts.

export const relations = defineRelations(schema, (r) => ({
  // ---------------------------------------------------------------
  // AUTENTICAÇÃO
  // ---------------------------------------------------------------
  usuarios: {
    // A FK está em perfis.usuarioId, por isso pode não existir perfil
    perfil: r.one.perfis({
      from: r.usuarios.id,
      to: r.perfis.usuarioId,
    }),
    // Muitos-para-muitos via usuarios_papeis
    papeis: r.many.papeis({
      from: r.usuarios.id.through(r.usuariosPapeis.usuarioId),
      to: r.papeis.id.through(r.usuariosPapeis.papelId),
    }),
  },

  papeis: {
    usuarios: r.many.usuarios({
      from: r.papeis.id.through(r.usuariosPapeis.papelId),
      to: r.usuarios.id.through(r.usuariosPapeis.usuarioId),
    }),
  },

  perfis: {
    usuario: r.one.usuarios({
      from: r.perfis.usuarioId,
      to: r.usuarios.id,
    }),
    estudante: r.one.estudantes({
      from: r.perfis.id,
      to: r.estudantes.perfilId,
    }),
    professor: r.one.professores({
      from: r.perfis.id,
      to: r.professores.perfilId,
    }),
  },

  // ---------------------------------------------------------------
  // ESTRUTURA ACADÉMICA
  // ---------------------------------------------------------------
  classes: {
    turmas: r.many.turmas({
      from: r.classes.id,
      to: r.turmas.classeId,
    }),
  },

  anosLectivos: {
    turmas: r.many.turmas({
      from: r.anosLectivos.id,
      to: r.turmas.anoLectivoId,
    }),
  },

  cursos: {
    turmas: r.many.turmas({
      from: r.cursos.id,
      to: r.turmas.cursoId,
    }),
  },

  disciplinas: {
    turmas: r.many.turmas({
      from: r.disciplinas.id.through(r.turmasDisciplinas.disciplinaId),
      to: r.turmas.id.through(r.turmasDisciplinas.turmaId),
    }),
  },

  turmas: {
    anoLectivo: r.one.anosLectivos({
      from: r.turmas.anoLectivoId,
      to: r.anosLectivos.id,
      optional: false,
    }),
    curso: r.one.cursos({
      from: r.turmas.cursoId,
      to: r.cursos.id,
      optional: false,
    }),
    classe: r.one.classes({
      from: r.turmas.classeId,
      to: r.classes.id,
      optional: false,
    }),
    // Disciplinas do currículo da turma, diretamente (sem passar pela junção)
    disciplinas: r.many.disciplinas({
      from: r.turmas.id.through(r.turmasDisciplinas.turmaId),
      to: r.disciplinas.id.through(r.turmasDisciplinas.disciplinaId),
    }),
    matriculas: r.many.matriculas({
      from: r.turmas.id,
      to: r.matriculas.turmaId,
    }),
  },

  // ---------------------------------------------------------------
  // PESSOAS
  // ---------------------------------------------------------------
  estudantes: {
    perfil: r.one.perfis({
      from: r.estudantes.perfilId,
      to: r.perfis.id,
      optional: false,
    }),
    matriculas: r.many.matriculas({
      from: r.estudantes.id,
      to: r.matriculas.estudanteId,
    }),
  },

  professores: {
    perfil: r.one.perfis({
      from: r.professores.perfilId,
      to: r.perfis.id,
      optional: false,
    }),
    atribuicoes: r.many.turmasProfessoresDisciplinas({
      from: r.professores.id,
      to: r.turmasProfessoresDisciplinas.professorId,
    }),
  },

  // ---------------------------------------------------------------
  // CURRÍCULO E ATRIBUIÇÕES (chaves compostas: turmaId + disciplinaId)
  // ---------------------------------------------------------------
  turmasDisciplinas: {
    turma: r.one.turmas({
      from: r.turmasDisciplinas.turmaId,
      to: r.turmas.id,
      optional: false,
    }),
    disciplina: r.one.disciplinas({
      from: r.turmasDisciplinas.disciplinaId,
      to: r.disciplinas.id,
      optional: false,
    }),
    professores: r.many.turmasProfessoresDisciplinas({
      from: [r.turmasDisciplinas.turmaId, r.turmasDisciplinas.disciplinaId],
      to: [
        r.turmasProfessoresDisciplinas.turmaId,
        r.turmasProfessoresDisciplinas.disciplinaId,
      ],
    }),
  },

  turmasProfessoresDisciplinas: {
    turmaDisciplina: r.one.turmasDisciplinas({
      from: [
        r.turmasProfessoresDisciplinas.turmaId,
        r.turmasProfessoresDisciplinas.disciplinaId,
      ],
      to: [r.turmasDisciplinas.turmaId, r.turmasDisciplinas.disciplinaId],
      optional: false,
    }),
    professor: r.one.professores({
      from: r.turmasProfessoresDisciplinas.professorId,
      to: r.professores.id,
      optional: false,
    }),
  },

  // ---------------------------------------------------------------
  // MATRÍCULAS, FALTAS E NOTAS
  // ---------------------------------------------------------------
  matriculas: {
    estudante: r.one.estudantes({
      from: r.matriculas.estudanteId,
      to: r.estudantes.id,
      optional: false,
    }),
    turma: r.one.turmas({
      from: r.matriculas.turmaId,
      to: r.turmas.id,
      optional: false,
    }),
    faltas: r.many.faltas({
      from: r.matriculas.id,
      to: r.faltas.matriculaId,
    }),
    notas: r.many.notas({
      from: r.matriculas.id,
      to: r.notas.matriculaId,
    }),
  },

  faltas: {
    matricula: r.one.matriculas({
      from: r.faltas.matriculaId,
      to: r.matriculas.id,
      optional: false,
    }),
    disciplina: r.one.disciplinas({
      from: r.faltas.disciplinaId,
      to: r.disciplinas.id,
      optional: false,
    }),
    turmaDisciplina: r.one.turmasDisciplinas({
      from: [r.faltas.turmaId, r.faltas.disciplinaId],
      to: [r.turmasDisciplinas.turmaId, r.turmasDisciplinas.disciplinaId],
      optional: false,
    }),
    registadoPor: r.one.usuarios({
      from: r.faltas.registadoPorUsuarioId,
      to: r.usuarios.id,
      optional: false,
    }),
  },

  notas: {
    matricula: r.one.matriculas({
      from: r.notas.matriculaId,
      to: r.matriculas.id,
      optional: false,
    }),
    disciplina: r.one.disciplinas({
      from: r.notas.disciplinaId,
      to: r.disciplinas.id,
      optional: false,
    }),
    turmaDisciplina: r.one.turmasDisciplinas({
      from: [r.notas.turmaId, r.notas.disciplinaId],
      to: [r.turmasDisciplinas.turmaId, r.turmasDisciplinas.disciplinaId],
      optional: false,
    }),
    lancadoPor: r.one.usuarios({
      from: r.notas.lancadoPorUsuarioId,
      to: r.usuarios.id,
      optional: false,
    }),
  },
}));

// ---------------------------------------------------------------------
// USO
// ---------------------------------------------------------------------
// import { drizzle } from "drizzle-orm/node-postgres";
// import { relations } from "./relations";
//
// const db = drizzle({ client, relations });
//
// const boletim = await db.query.matriculas.findMany({
//   where: { estudanteId },
//   with: { turma: true, notas: { with: { disciplina: true } } },
// });
