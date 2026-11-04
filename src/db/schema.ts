import { pgEnum, date, serial, pgTable, text, timestamp, uuid, varchar, integer, smallint, primaryKey, boolean, unique, numeric } from "drizzle-orm/pg-core";


// ENUM'S

export const enumGenero = pgEnum("enum_genero", ["M", "F"]);
export const enumTurno = pgEnum("enum_turno", ["MANHA", "TARDE", "NOITE"]);

// USUÁRIOS

export const usuarios = pgTable("usuarios", {
  id: uuid().primaryKey().defaultRandom(),

  email: varchar("email", { length: 200 })
    .notNull()
    .unique(),

  senha: text("senha")
    .notNull(),

  estado: boolean("estado").default(true),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// PERFIS

export const perfis = pgTable("perfis", {
  id: uuid().primaryKey().defaultRandom(),

  nomeProprio: varchar("nome", { length: 100 })
    .notNull(),

  sobrenome: varchar("sobrenome", { length: 200 })
    .notNull(),

  bilheteIdentidade: varchar("bilhete_identidade", { length: 20 })
    .notNull()
    .unique(),

  dataNascimento: date("data_nascimento"),

  foto: text("foto").default("foto_padrao.png"),

  endereco: text("endereco"),

  bio: varchar("bio", { length: 200 }),

  genero: enumGenero("genero"),

  usuarioId: uuid("usuario_id").unique().references(() => usuarios.id),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// PAPEIS


export const papeis = pgTable("papeis", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 })
    .notNull(),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// USUARIOS_PAPEIS


export const usuariosPapeis = pgTable("usuarios_papeis", {
  usuarioId: uuid().notNull().references(() => usuarios.id),
  papelId: uuid().notNull().references(() => papeis.id),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
},
  (tabela) => [
    primaryKey({
      columns: [
        tabela.usuarioId,
        tabela.papelId,
     ]
   })
 ]
)


// CLASSES


export const classes = pgTable("classes", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),

  ordem: smallint("ordem").notNull(),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// ANOS LECTIVOS


export const anosLectivos = pgTable("anos_lectivos", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),

  dataInicio: date("data_inicio"),
  dataFim: date("data_fim"),

  estado: boolean("estado"),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// CURSOS


export const cursos = pgTable("cursos", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),

  estado: boolean("estado").default(true),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})

// TURMAS

export const turmas = pgTable("turmas", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),

  codigo: varchar("codigo", { length: 20 }).notNull().unique(),

  turno: enumTurno("turno").notNull(),

  capacidade: integer("capacidade"),

  anoLectivoId: uuid("ano_lectivo_id").notNull().references(() => anosLectivos.id),

  cursoId: uuid("curso_id").notNull().references(() => cursos.id),

  classeId: uuid("classe_id").notNull().references(() => classes.id),

  estado: boolean("estado").default(true),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})

// DISCIPLINAS


export const disciplinas = pgTable("disciplinas", {
  id: uuid().primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),

  codigo: varchar("codigo", { length: 20 }).notNull().unique(),

  cargaHoraria: integer("carga_horaria"),

  estado: boolean("estado").default(true),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// ESTUDANTES

export const estudantes = pgTable("estudantes", {
  id: uuid().primaryKey().defaultRandom(),

  numeroProcesso: serial("numero_processo").notNull().unique(),

  perfilId: uuid("perfil_id").notNull().unique().references(() => perfis.id),

  estado: boolean("estado").default(true),

  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow().$onUpdate(() => new Date()),
})


// PROFESSORES

export const professores = pgTable("professores", {
  id: uuid().primaryKey().defaultRandom(),

  numeroAgente: serial("numero_agente").notNull().unique(),

  perfilId: uuid("perfil_id")
    .notNull()
    .unique()
    .references(() => perfis.id),

  especialidade: varchar("especialidade", { length: 150 }),

  estado: boolean("estado").notNull().default(true),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});


// TURMAS_DISCIPLINAS

export const turmasDisciplinas = pgTable("turmas_disciplinas", {
  turmaId: uuid("turma_id")
    .notNull()
    .references(() => turmas.id),

  disciplinaId: uuid("disciplina_id")
    .notNull()
    .references(() => disciplinas.id),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

},
  (tabela) => [
    primaryKey({
      columns: [
        tabela.turmaId,
        tabela.disciplinaId,
      ]
    })
  ]
);



// TURMAS_PROFESSORES_DISCIPLINAS

export const turmasProfessoresDisciplinas = pgTable("turmas_professores_disciplinas", {
  id: uuid().primaryKey().defaultRandom(),

  turmaId: uuid("turma_id")
    .notNull()
    .references(() => turmas.id),

  professorId: uuid("professor_id")
    .notNull()
    .references(() => professores.id),

  disciplinaId: uuid("disciplina_id")
    .notNull()
    .references(() => disciplinas.id),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

},
  (tabela) => [
    unique().on(
      tabela.turmaId,
      tabela.professorId,
      tabela.disciplinaId
    )
  ]
);




// MATRÍCULAS

export const matriculas = pgTable("matriculas", {
  id: uuid().primaryKey().defaultRandom(),

  estudanteId: uuid("estudante_id")
    .notNull()
    .references(() => estudantes.id),

  turmaId: uuid("turma_id")
    .notNull()
    .references(() => turmas.id),

  dataMatricula: date("data_matricula")
    .notNull()
    .defaultNow(),

  estado: varchar("estado", { length: 30 })
    .notNull()
    .default("ATIVA"),

  tipo: varchar("tipo", { length: 30 })
    .notNull(),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
},
  (tabela) => [
    unique().on(
      tabela.estudanteId,
      tabela.turmaId
    )
]
);


// FALTAS

export const faltas = pgTable("faltas", {
  id: uuid().primaryKey().defaultRandom(),

  matriculaId: uuid("matricula_id")
    .notNull()
    .references(() => matriculas.id),

  disciplinaId: uuid("disciplina_id")
    .notNull()
    .references(() => disciplinas.id),

  data: date("data")
    .notNull(),

  justificada: boolean("justificada")
    .notNull()
    .default(false),

  motivo: text("motivo"),

  registadoPorUsuarioId: uuid("registado_por_usuario_id")
    .notNull()
    .references(() => usuarios.id),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});



// NOTAS

export const notas = pgTable("notas", {
  id: uuid().primaryKey().defaultRandom(),

  matriculaId: uuid("matricula_id")
    .notNull()
    .references(() => matriculas.id),

  disciplinaId: uuid("disciplina_id")
    .notNull()
    .references(() => disciplinas.id),

  lancadoPorUsuarioId: uuid("lancado_por_usuario_id")
    .notNull()
    .references(() => usuarios.id),

  tipo: varchar("tipo", { length: 50 })
    .notNull(),

  valor: numeric("valor", {
    precision: 5,
    scale: 2,
  }).notNull(),

  criadoEm: timestamp("criado_em")
    .notNull()
    .defaultNow(),

  atualizadoEm: timestamp("atualizado_em")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
