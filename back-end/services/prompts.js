// import { z } from "zod";


// export const GenerationResultSchema = z.object({
//     files: z.record(z.string(),  z.string()),
//     description: z.string().default('Generated project')
// })

// export const FileOpSchema = z.object({
//     op: z.enum(["create", "update", "delete"]),
//     path: z.string(),
//     content: z.string().nullable().optional(),
//     search: z.string().nullable().optional(),
//     replace: z.string().nullable().optional(),
// })

// export const RevisionResultSchema = z.object({
//     operations: z.array(FileOpSchema),
//     description: z.string().default('Applied revisions')
// })

// export const FilePlanSchema = z.object({
//     files: z.array(
//         z.object({
//             path: z.string(),
//             description: z.string(),
//             exports: z.string().optional().default(""),
//             imports: z.array(z.string()).optional().default([]),
//         })
//     ),
//     projectName: z.string().default('Generated Project'),
//     projectDescription: z.string().default('A React project')
// })

// export const FileCodeSchema = z.object({
//     code: z.string(),
// })

import { z } from "zod";

// --- System Prompts ---

export const FILE_PLAN_SYSTEM = `
You are an expert full-stack React developer and software architect.
Your job is to break down a user's web app request into a structured execution plan.
Analyze the user request and list all necessary component, style, and utility files required for a complete, production-ready React application.
Ensure you always include entry point files (such as App.jsx or App.js).
`;

export const REVISE_SYSTEM = `
You are an expert React developer specializing in code refactoring and incremental revisions.
Analyze the user's request alongside the current state of the project files.
Generate specific operations (create, update, delete) to satisfy the requested changes cleanly and efficiently without breaking existing dependencies.
`;

// --- Zod Schemas ---

export const GenerationResultSchema = z.object({
  files: z.record(z.string(), z.string()),
  description: z.string().default('Generated project')
});

export const FileOpSchema = z.object({
  op: z.enum(["create", "update", "delete"]),
  path: z.string(),
  content: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  replace: z.string().nullable().optional(),
});

export const RevisionResultSchema = z.object({
  operations: z.array(FileOpSchema),
  description: z.string().default('Applied revisions')
});

export const FilePlanSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      description: z.string(),
      exports: z.string().optional().default(""),
      imports: z.array(z.string()).optional().default([]),
    })
  ),
  projectName: z.string().default('Generated Project'),
  projectDescription: z.string().default('A React project')
});

export const FileCodeSchema = z.object({
  code: z.string(),
});