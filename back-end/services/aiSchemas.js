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

export const GenerationResultSchema = z.object({
    files: z.record(z.string(), z.string()).catch({}),
    description: z.string().catch('Generated project')
});

export const FileOpSchema = z.object({
    // Allow loose operation names or fallback gracefully
    op: z.string().transform((val) => {
        const clean = String(val || "").trim().toLowerCase();
        if (["create", "add", "new"].includes(clean)) return "create";
        if (["update", "edit", "modify", "patch"].includes(clean)) return "update";
        if (["delete", "remove", "del", "rm"].includes(clean)) return "delete";
        return "update"; // default safety fallback
    }),
    path: z.string().catch(""),
    content: z.string().nullish().transform((v) => v ?? undefined),
    search: z.string().nullish().transform((v) => v ?? undefined),
    replace: z.string().nullish().transform((v) => v ?? undefined),
});

export const RevisionResultSchema = z.object({
    operations: z.array(FileOpSchema).catch([]),
    description: z.string().catch('Applied revisions')
});

export const FilePlanSchema = z.object({
    files: z.array(
        z.object({
            path: z.string(),
            description: z.string().nullish().transform((v) => v || "Project component"),
            exports: z.string().nullish().transform((v) => v || ""),
            imports: z.array(z.string()).catch([]).nullish().transform((v) => v || []),
        })
    ).catch([]),
    projectName: z.string().catch('Generated Project'),
    projectDescription: z.string().catch('A React project')
});

export const FileCodeSchema = z.object({
    code: z.string().catch(""),
});