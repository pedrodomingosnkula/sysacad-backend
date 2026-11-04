import {
  pgEnum,
  pgTable,
  date,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  smallint,
  boolean,
  numeric,
  primaryKey,
  unique,
  index,
  uniqueIndex,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =====================================================================
// HELPERS REUTILIZÁVEIS
// =====================================================================

const timestamps = {
  criadoEm: timestamp("criado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// Soft delete: em vez de apagar, preenche-se deletado_em.
// Lembra-te de filtrar `deletadoEm IS NULL` nas consultas.
const softDelete = {
  deletadoEm: timestamp("deletado_em", { withTimezone: true }),
};

// =====================================================================
// ENUMS
// =====================================================================

export const enumGenero = pgEnum("enum_genero", ["M", "F"]);
export const enumTurno = pgEnum("enum_turno", ["MANHA", "TARDE", "NOITE"]);

export const enumEstadoMatricula = pgEnum("enum_estado_matricula", [
  "ATIVA",
  "CONCLUIDA",
  "ANULADA",
  "TRANSFERIDA",
]);

export const enumTipoMatricula = pgEnum("enum_tipo_matricula", [
  "NOVA",
  "CONFIRMACAO",
  "TRANSFERENCIA",
]);

export const enumTipoNota = pgEnum("enum_tipo_nota", [
  "MAC", // Média de Avaliação Contínua
  "PP", // Prova do Professor
  "PT", // Prova Trimestral
  "EXAME",
]);

// =====================================================================
// USUÁRIOS
// =====================================================================

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Normaliza para minúsculas na aplicação; o índice abaixo é a rede de segurança
    email: varchar("email", { length: 200 }).notNull(),

    // Guardar SEMPRE o hash (argon2/bcrypt), nunca a senha em texto simples
    senhaHash: text("senha_hash").notNull(),

    estado: boolean("estado").notNull().default(true),

    ...timestamps,
    ...softDelete,
  },
  (t) => [
    // "Ana@x.com" e "ana@x.com" contam como o mesmo email
    uniqueIndex("uq_usuarios_email_lower").on(sql`lower(${t.email})`),
  ]
);

// =====================================================================
// PERFIS
// =====================================================================

export const perfis = pgTable("perfis", {
  id: uuid("id").primaryKey().defaultRandom(),

  nomeProprio: varchar("nome_proprio", { length: 100 }).notNull(),
  sobrenome: varchar("sobrenome", { length: 200 }).notNull(),

  // Formato BI angolano (9 dígitos + 2 letras + 3 dígitos): validar na aplicação
  bilheteIdentidade: varchar("bilhete_identidade", { length: 20 })
    .notNull()
    .unique(),

  dataNascimento: date("data_nascimento"),

  foto: text("foto").default("foto_padrao.png"),

  endereco: text("endereco"),

  bio: varchar("bio", { length: 200 }),

  genero: enumGenero("genero"),

  // Nullable: pode existir perfil sem conta de acesso
  usuarioId: uuid("usuario_id")
    .unique()
    .references(() => usuarios.id, { onDelete: "set null" }),

  ...timestamps,
  ...softDelete,
});

// =====================================================================
// PAPÉIS
// =====================================================================

export const papeis = pgTable("papeis", {
  id: uuid("id").primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull().unique(),

  ...timestamps,
});

// =====================================================================
// USUÁRIOS_PAPÉIS
// =====================================================================

export const usuariosPapeis = pgTable(
  "usuarios_papeis",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),

    papelId: uuid("papel_id")
      .notNull()
      .references(() => papeis.id, { onDelete: "cascade" }),

    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.usuarioId, t.papelId] }),
    index("idx_usuarios_papeis_papel").on(t.papelId),
  ]
);

// =====================================================================
// CLASSES
// =====================================================================

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),

  ordem: smallint("ordem").notNull().unique(),

  ...timestamps,
});

// =====================================================================
// ANOS LECTIVOS
// =====================================================================

export const anosLectivos = pgTable(
  "anos_lectivos",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    nome: varchar("nome", { length: 100 }).notNull(),

    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim").notNull(),

    estado: boolean("estado").notNull().default(false),

    ...timestamps,
  },
  (t) => [
    check("anos_lectivos_datas_validas", sql`${t.dataFim} > ${t.dataInicio}`),
    // Só pode existir UM ano lectivo ativo
    uniqueIndex("uq_um_ano_lectivo_ativo")
      .on(t.estado)
      .where(sql`${t.estado} = true`),
  ]
);

// =====================================================================
// CURSOS
// =====================================================================

export const cursos = pgTable("cursos", {
  id: uuid("id").primaryKey().defaultRandom(),

  nome: varchar("nome", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),

  estado: boolean("estado").notNull().default(true),

  ...timestamps,
});

// =====================================================================
// DISCIPLINAS
// =====================================================================

export const disciplinas = pgTable(
  "disciplinas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    nome: varchar("nome", { length: 100 }).notNull(),
    codigo: varchar("codigo", { length: 20 }).notNull().unique(),

    cargaHoraria: integer("carga_horaria"),

    estado: boolean("estado").notNull().default(true),

    ...timestamps,
  },
  (t) => [
    check(
      "disciplinas_carga_horaria_positiva",
      sql`${t.cargaHoraria} IS NULL OR ${t.cargaHoraria} > 0`
    ),
  ]
);

// =====================================================================
// TURMAS
// =====================================================================

export const turmas = pgTable(
  "turmas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    nome: varchar("nome", { length: 100 }).notNull(),

    // Único por ano lectivo (o mesmo código pode repetir-se em anos diferentes)
    codigo: varchar("codigo", { length: 20 }).notNull(),

    turno: enumTurno("turno").notNull(),

    capacidade: integer("capacidade"),

    anoLectivoId: uuid("ano_lectivo_id")
      .notNull()
      .references(() => anosLectivos.id, { onDelete: "restrict" }),

    cursoId: uuid("curso_id")
      .notNull()
      .references(() => cursos.id, { onDelete: "restrict" }),

    classeId: uuid("classe_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),

    estado: boolean("estado").notNull().default(true),

    ...timestamps,
  },
  (t) => [
    unique("uq_turmas_codigo_ano").on(t.codigo, t.anoLectivoId),
    check(
      "turmas_capacidade_positiva",
      sql`${t.capacidade} IS NULL OR ${t.capacidade} > 0`
    ),
    index("idx_turmas_ano_lectivo").on(t.anoLectivoId),
    index("idx_turmas_curso").on(t.cursoId),
    index("idx_turmas_classe").on(t.classeId),
  ]
);

// =====================================================================
// ESTUDANTES
// =====================================================================

export const estudantes = pgTable("estudantes", {
  id: uuid("id").primaryKey().defaultRandom(),

  numeroProcesso: serial("numero_processo").notNull().unique(),

  perfilId: uuid("perfil_id")
    .notNull()
    .unique()
    .references(() => perfis.id, { onDelete: "restrict" }),

  estado: boolean("estado").notNull().default(true),

  ...timestamps,
  ...softDelete,
});

// =====================================================================
// PROFESSORES
// =====================================================================

export const professores = pgTable("professores", {
  id: uuid("id").primaryKey().defaultRandom(),

  numeroAgente: serial("numero_agente").notNull().unique(),

  perfilId: uuid("perfil_id")
    .notNull()
    .unique()
    .references(() => perfis.id, { onDelete: "restrict" }),

  especialidade: varchar("especialidade", { length: 150 }),

  estado: boolean("estado").notNull().default(true),

  ...timestamps,
  ...softDelete,
});

// =====================================================================
// TURMAS_DISCIPLINAS (currículo da turma: que disciplinas a turma tem)
// =====================================================================

export const turmasDisciplinas = pgTable(
  "turmas_disciplinas",
  {
    turmaId: uuid("turma_id")
      .notNull()
      .references(() => turmas.id, { onDelete: "cascade" }),

    disciplinaId: uuid("disciplina_id")
      .notNull()
      .references(() => disciplinas.id, { onDelete: "restrict" }),

    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.turmaId, t.disciplinaId] }),
    index("idx_turmas_disciplinas_disciplina").on(t.disciplinaId),
  ]
);

// =====================================================================
// TURMAS_PROFESSORES_DISCIPLINAS
// Só permite atribuir professor a disciplinas que a turma realmente tem
// (FK composta para turmas_disciplinas).
// =====================================================================

export const turmasProfessoresDisciplinas = pgTable(
  "turmas_professores_disciplinas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    turmaId: uuid("turma_id").notNull(),

    disciplinaId: uuid("disciplina_id").notNull(),

    professorId: uuid("professor_id")
      .notNull()
      .references(() => professores.id, { onDelete: "restrict" }),

    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "fk_tpd_turma_disciplina",
      columns: [t.turmaId, t.disciplinaId],
      foreignColumns: [turmasDisciplinas.turmaId, turmasDisciplinas.disciplinaId],
    }).onDelete("cascade"),

    unique("uq_tpd_turma_professor_disciplina").on(
      t.turmaId,
      t.professorId,
      t.disciplinaId
    ),
    index("idx_tpd_professor").on(t.professorId),
    index("idx_tpd_turma_disciplina").on(t.turmaId, t.disciplinaId),
  ]
);

// =====================================================================
// MATRÍCULAS
// =====================================================================

export const matriculas = pgTable(
  "matriculas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    estudanteId: uuid("estudante_id")
      .notNull()
      .references(() => estudantes.id, { onDelete: "restrict" }),

    turmaId: uuid("turma_id")
      .notNull()
      .references(() => turmas.id, { onDelete: "restrict" }),

    dataMatricula: date("data_matricula")
      .notNull()
      .default(sql`CURRENT_DATE`),

    estado: enumEstadoMatricula("estado").notNull().default("ATIVA"),

    tipo: enumTipoMatricula("tipo").notNull(),

    ...timestamps,
  },
  (t) => [
    unique("uq_matriculas_estudante_turma").on(t.estudanteId, t.turmaId),

    // Necessário para as FKs compostas de notas e faltas
    // garantirem que a turma da nota/falta é a turma da matrícula
    unique("uq_matriculas_id_turma").on(t.id, t.turmaId),

    // O unique (estudanteId, turmaId) já cobre pesquisas por estudanteId
    index("idx_matriculas_turma").on(t.turmaId),
  ]
);

// =====================================================================
// FALTAS
// =====================================================================

export const faltas = pgTable(
  "faltas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    matriculaId: uuid("matricula_id").notNull(),

    // Redundante de propósito: permite as FKs compostas abaixo
    turmaId: uuid("turma_id").notNull(),

    disciplinaId: uuid("disciplina_id").notNull(),

    data: date("data").notNull(),

    justificada: boolean("justificada").notNull().default(false),

    motivo: text("motivo"),

    registadoPorUsuarioId: uuid("registado_por_usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),

    ...timestamps,
  },
  (t) => [
    // A turma da falta tem de ser a turma da matrícula
    foreignKey({
      name: "fk_faltas_matricula_turma",
      columns: [t.matriculaId, t.turmaId],
      foreignColumns: [matriculas.id, matriculas.turmaId],
    }).onDelete("restrict"),

    // A disciplina tem de pertencer à turma
    foreignKey({
      name: "fk_faltas_turma_disciplina",
      columns: [t.turmaId, t.disciplinaId],
      foreignColumns: [turmasDisciplinas.turmaId, turmasDisciplinas.disciplinaId],
    }).onDelete("restrict"),

    // Se puderem existir várias aulas por dia, acrescenta o horário aqui
    unique("uq_faltas_matricula_disciplina_data").on(
      t.matriculaId,
      t.disciplinaId,
      t.data
    ),

    index("idx_faltas_matricula_data").on(t.matriculaId, t.data),
    index("idx_faltas_turma_disciplina").on(t.turmaId, t.disciplinaId),
    index("idx_faltas_registado_por").on(t.registadoPorUsuarioId),
  ]
);

// =====================================================================
// NOTAS
// =====================================================================

export const notas = pgTable(
  "notas",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    matriculaId: uuid("matricula_id").notNull(),

    // Redundante de propósito: permite as FKs compostas abaixo
    turmaId: uuid("turma_id").notNull(),

    disciplinaId: uuid("disciplina_id").notNull(),

    lancadoPorUsuarioId: uuid("lancado_por_usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),

    tipo: enumTipoNota("tipo").notNull(),

    // mode "number": o Drizzle devolve number em vez de string
    valor: numeric("valor", { precision: 5, scale: 2, mode: "number" }).notNull(),

    ...timestamps,
  },
  (t) => [
    foreignKey({
      name: "fk_notas_matricula_turma",
      columns: [t.matriculaId, t.turmaId],
      foreignColumns: [matriculas.id, matriculas.turmaId],
    }).onDelete("restrict"),

    foreignKey({
      name: "fk_notas_turma_disciplina",
      columns: [t.turmaId, t.disciplinaId],
      foreignColumns: [turmasDisciplinas.turmaId, turmasDisciplinas.disciplinaId],
    }).onDelete("restrict"),

    // Escala angolana 0–20
    check("notas_valor_intervalo", sql`${t.valor} >= 0 AND ${t.valor} <= 20`),

    // Se tiveres trimestres, acrescenta a coluna `trimestre` e inclui-a aqui
    unique("uq_notas_matricula_disciplina_tipo").on(
      t.matriculaId,
      t.disciplinaId,
      t.tipo
    ),

    // O unique (matriculaId, disciplinaId, tipo) já cobre pesquisas por matriculaId
    index("idx_notas_turma_disciplina").on(t.turmaId, t.disciplinaId),
    index("idx_notas_lancado_por").on(t.lancadoPorUsuarioId),
  ]
);

// =====================================================================
// DOCUMENTOS (do estudante, por matrícula)
// Guarda só o registo; o ficheiro em si fica no armazenamento (disco/S3).
// =====================================================================

export const documentos = pgTable(
  "documentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // A matrícula já identifica o estudante, a turma e o ano lectivo
    matriculaId: uuid("matricula_id")
      .notNull()
      .references(() => matriculas.id, { onDelete: "restrict" }),

    // Ex.: "Bilhete de Identidade", "Certificado", "Declaração"
    tipo: varchar("tipo", { length: 50 }).notNull(),

    nome: varchar("nome", { length: 255 }).notNull(),

    // Onde o ficheiro está guardado
    caminho: text("caminho").notNull().unique(),

    ...timestamps,
  },
  (t) => [index("idx_documentos_matricula").on(t.matriculaId)]
);
