// // // import {createOpenAI} from '@ai-sdk/openai'
// // // import { generateObject } from 'ai';
// // // import pMap from "p-map";
// // // import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// // // import { buildFileCodeSystem, FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './diff.js';
// // // import { el } from 'zod/v4/locales';
// // // import { normalizeContent } from './contentNormalizer.js';
// // // import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';
// // // import { createOpenAI } from '@ai-sdk/openai';
// // // import { generateObject } from 'ai';
// // // import pMap from "p-map";
// // // import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// // // import { buildFileCodeSystem } from './diff.js';
// // // import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// // // import { normalizeContent } from './contentNormalizer.js';
// // // import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// // // // --- OpenRouter Model Client Setup ---
// // // const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
// // // const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "6", 10)

// // // const openrouter = createOpenAI({
// // //     baseURL: "https://openrouter.ai/api/v1",
// // //     apiKey: process.env.OPENROUTER_API_KEY,
// // // })

// // // const model = openrouter(MODEL);

// // // // Generate a single file's code
// // // async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles){
// // //      const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);

// // //      const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${file.description}`;

// // //      console.log(`[AI] Creating file: ${file.path}...`);
// // //      const { object } = await generateObject({
// // //         model,
// // //         schema: FileCodeSchema,
// // //         system,
// // //         prompt: userMsg,
// // //         maxRetries: 2,
// // //      })

// // //      let code = normalizeContent(object.code);

// // //      if(code.trim().length === 0){
// // //         throw new Error("Generated code is empty after normalization");
// // //      }

// // //      // Apply post-generation validation and auto-fixing
// // //      const validation = validateAndFixCode(code, file.path, {allPlannedFiles: allFiles});

// // //      code = validation.code;

// // //      if(validation.warnings.length > 0){
// // //         console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// // //      }

// // //      console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
// // //      return {path: file.path, code}
// // // }

// // // // Generate project files: plan first, then build files in order with fallback retries
// // // export async function generateProject(prompt, callbacks){
// // //     // Phase 1: Plan
// // //     console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0,80)}..."`);
// // //     const { object: plan } = await generateObject({
// // //         model,
// // //         schema: FilePlanSchema,
// // //         system: FILE_PLAN_SYSTEM,
// // //         prompt: `Plan a React website for: ${prompt}`,
// // //         maxRetries: 2,
// // //     });

// // //     if(!plan.files.find((f)=> f.path === "/App.js")){
// // //         plan.files.unshift({
// // //             path: "/App.js",
// // //             description: "Main application entry point",
// // //             exports: "default App",
// // //             imports: ["./styles.css"],
// // //         })
// // //     }

// // //     if(!plan.files.find((f)=> f.path === "/styles.css")){
// // //         plan.files.push({
// // //              path: "/styles.css",
// // //             description: "Global CSS: Google Font import, keyframe animations, utility classes",
// // //             exports: "none",
// // //             imports: [],
// // //         })
// // //     }

// // //     if(callbacks?.onPlan){
// // //         await callbacks.onPlan(plan)
// // //     }

// // //     console.log(`[AI] Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f)=> f.path).join(", ")}`);


// // //     const files = {};
// // //     let pendingFiles = plan.files.map((f)=>({...f}));

// // //     const maxRetryRounds = 2;

// // //     for (let round = 0; round <= maxRetryRounds; round++) {
// // //         if(pendingFiles.length === 0) break;

// // //         if(round > 0){
// // //             console.log(
// // //                 `[AI] Retry round ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
// // //             );
// // //         }

// // //         const results = await pMap(
// // //             pendingFiles,
// // //             async (file) => {
// // //                 try {
// // //                     if (callbacks?.onFileStart){
// // //                         await callbacks.onFileStart(file.path)
// // //                     }

// // //                     const singleResult = await generateSingleFile(file, plan.files, prompt, files)

// // //                     if(callbacks?.onFileComplete){
// // //                         await callbacks.onFileComplete(file.path, singleResult.code)
// // //                     }
// // //                     return {success: true, file, result: singleResult }
// // //                 } catch (err) {
// // //                     return { success: false, file, error: err };
// // //                 }
// // //             },
// // //             {concurrency: MAX_CONCURRENCY},
// // //         )

// // //          const failedFiles = [];
// // //          for (const entry of results) {
// // //             if (entry.success) {
// // //                 const { path, code } = entry.result;
// // //                 files[path.startsWith("/") ? path : "/" + path] = code;
// // //             }else{
// // //                 console.warn(`[AI] File ${entry.file.path} failed in round ${round}: ${entry.error?.message || entry.error}`);
// // //                 failedFiles.push(entry.file)
// // //             }
// // //          }
// // //          pendingFiles = failedFiles;
// // //     }

// // //     if(pendingFiles.length > 0){
// // //         const failedPaths = pendingFiles.map((f)=>f.path).join(", ");
// // //         console.error(`[AI] Failed to generate ${pendingFiles.length} files after all retry rounds: ${failedPaths}`);

// // //         if (pendingFiles.some((f) => f.path === "/App.js")){
// // //             const ext = file.path.split(".").pop()?.toLowerCase();

// // //             if(ext === "css"){
// // //                 files[file.path] = `/* ${file.description} — Generation failed, please retry */\n`
// // //             }else{
// // //                 files[file.path] = "import React from 'react';\n\n" + 
// // //                 `// ⚠️ This file could not be generated. Please retry.\n` +
// // //                 `// Purpose: ${file.description}\n\n` + 
// // //                 "export default function Placeholder() {\n" +
// // //                 "  return (\n" +
// // //                     "    <div className='p-8 text-center text-zinc-400'>\n" +
// // //                     "      <p>⚠️ Component failed to generate. Please try again.</p>\n" +
// // //                     "    </div>\n" +
// // //                     "  );\n" +
// // //                     "}\n";
// // //             }
// // //         }

// // //     }

// // //     if(!files["/App.js"]){
// // //         throw new Error("AI did not generate /App.js entry point");
// // //     }

// // //     return {files, description: plan.projectDescription}
// // // }

// // // export async function reviseProject(prompt, manifest, relevantFiles, recentMessages){
// // //     const contextParts = [];

// // //     contextParts.push("## Current Project Files (manifest)");
// // //     contextParts.push("```");
// // //     for (const f of manifest) {
// // //         contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`)
// // //     }
// // //     contextParts.push("```");

// // //     if(Object.keys(relevantFiles).length > 0){
// // //         contextParts.push("\n## File Contents (for reference)");
// // //         for (const [path, content] of Object.entries(relevantFiles)) {
// // //         contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``)
// // //     }
// // //     }

// // //     if(recentMessages.length > 0){
// // //         contextParts.push("\n## Recent Conversation");
// // //         for (const msg of recentMessages.slice(-3)) {
// // //         contextParts.push(`${msg.role}: ${msg.content}`)
// // //     }
// // //     }

// // //     contextParts.push(`\n## Revision Request\n${prompt}`);

// // //     console.log("[AI] Revising project...");

// // //     const { object: rawParsed } = await generateObject({
// // //         model,
// // //         schema: RevisionResultSchema,
// // //         system: REVISE_SYSTEM,
// // //         prompt: contextParts.join("\n"),
// // //         maxRetries: 2
// // //     })

// // //     if(rawParsed && Array.isArray(rawParsed.operations)){
// // //         rawParsed.operations = rawParsed.operations.map((op)=>{
// // //             if(!op || typeof op !== "object") return op;

// // //             let opStr = String(op.op || "").trim().toLowerCase();

// // //             if(["create", "add", "new"].includes(opStr)) op.op = "create";
// // //             else if (["update", "edit", "modify", "patch"].includes(opStr)) op.op = "update";
// // //             else if (["delete", "remove", "del", "rm"].includes(opStr)) op.op = "delete";

// // //             if(op.path && typeof op.path === "string" && !op.path.startsWith("/")){
// // //                 op.path = "/" + op.path;
// // //             }

// // //             if (op.content) op.content = normalizeContent(op.content);
// // //             if (op.search) op.search = normalizeContent(op.search);
// // //             if (op.replace) op.replace = normalizeContent(op.replace);

// // //             if (op.op === "create" && op.content){
// // //                 const validation = validateRevisionContent(op.content, op.path, "create");
// // //                 op.content = validation.content;
// // //                 if(validation.warnings.length > 0){
// // //                     console.log(`[Validator] Revision Create adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// // //                 }
// // //             }else if(op.op === "update" && op.replace){
// // //                  const validation = validateRevisionContent(op.replace, op.path, "update");
// // //                  op.replace = validation.content;
// // //                  if(validation.warnings.length > 0){
// // //                     console.log(`[Validator] Revision Update adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// // //                  }
// // //             }
// // //             return op;
// // //         })
// // //     }
// // //     return rawParsed;
// // // }

// // import { createOpenAI } from '@ai-sdk/openai';
// // import { generateObject } from 'ai';
// // import pMap from 'p-map';
// // import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// // import { buildFileCodeSystem } from './diff.js';
// // import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// // import { normalizeContent } from './contentNormalizer.js';
// // import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// // // --- OpenRouter Model Client Setup ---
// // const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
// // // Free models are prone to rate limits when hit concurrently, default concurrency is set to 2
// // const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

// // const openrouter = createOpenAI({
// //     baseURL: "https://openrouter.ai/api/v1",
// //     apiKey: process.env.OPENROUTER_API_KEY,
// // });

// // const model = openrouter(MODEL);

// // // Global default system override to enforce strict JSON compliance across all AI SDK calls
// // const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

// // // Generate a single file's code
// // async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
// //     const system = STRICT_JSON_SYSTEM_PREFIX + buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
// //     const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${file.description}`;

// //     console.log(`[AI] Creating file: ${file.path}...`);

// //     let object;
// //     try {
// //         const response = await generateObject({
// //             model,
// //             schema: FileCodeSchema,
// //             mode: 'json',
// //             temperature: 0.1, // Lower temperature reduces response corruption/formatting hallucinations
// //             system,
// //             prompt: userMsg,
// //             maxRetries: 3,
// //         });
// //         object = response.object;
// //     } catch (err) {
// //         console.error(`[AI] Standard JSON mode failed for ${file.path}. Attempting auto mode fallback...`, err.message);
// //         // Fallback execution if the model rejects constrained JSON mode
// //         const response = await generateObject({
// //             model,
// //             schema: FileCodeSchema,
// //             temperature: 0.1,
// //             system,
// //             prompt: userMsg,
// //             maxRetries: 2,
// //         });
// //         object = response.object;
// //     }

// //     if (!object || !object.code) {
// //         throw new Error(`Failed to generate code for ${file.path}: Response object missing 'code' field`);
// //     }

// //     let code = normalizeContent(object.code);

// //     if (code.trim().length === 0) {
// //         throw new Error("Generated code is empty after normalization");
// //     }

// //     // Apply post-generation validation and auto-fixing
// //     const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
// //     code = validation.code;

// //     if (validation.warnings.length > 0) {
// //         console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// //     }

// //     console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
// //     return { path: file.path, code };
// // }

// // // Generate project files: plan first, then build files in order with fallback retries
// // export async function generateProject(prompt, callbacks) {
// //     // Phase 1: Plan
// //     console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
    
// //     let plan;
// //     try {
// //         const { object } = await generateObject({
// //             model,
// //             schema: FilePlanSchema,
// //             mode: 'json',
// //             temperature: 0.2,
// //             system: STRICT_JSON_SYSTEM_PREFIX + FILE_PLAN_SYSTEM,
// //             prompt: `Plan a React website for: ${prompt}`,
// //             maxRetries: 3,
// //         });
// //         plan = object;
// //     } catch (err) {
// //         console.error('[AI] Phase 1 standard planning failed. Trying auto mode fallback...', err.message);
// //         const { object } = await generateObject({
// //             model,
// //             schema: FilePlanSchema,
// //             temperature: 0.2,
// //             system: STRICT_JSON_SYSTEM_PREFIX + FILE_PLAN_SYSTEM,
// //             prompt: `Plan a React website for: ${prompt}`,
// //             maxRetries: 2,
// //         });
// //         plan = object;
// //     }

// //     if (!plan || !Array.isArray(plan.files)) {
// //         throw new Error("Failed to generate file structure plan from model output.");
// //     }

// //     if (!plan.files.find((f) => f.path === "/App.js")) {
// //         plan.files.unshift({
// //             path: "/App.js",
// //             description: "Main application entry point",
// //             exports: "default App",
// //             imports: ["./styles.css"],
// //         });
// //     }

// //     if (!plan.files.find((f) => f.path === "/styles.css")) {
// //         plan.files.push({
// //             path: "/styles.css",
// //             description: "Global CSS: Google Font import, keyframe animations, utility classes",
// //             exports: "none",
// //             imports: [],
// //         });
// //     }

// //     if (callbacks?.onPlan) {
// //         await callbacks.onPlan(plan);
// //     }

// //     console.log(`[AI] Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f) => f.path).join(", ")}`);

// //     const files = {};
// //     let pendingFiles = plan.files.map((f) => ({ ...f }));

// //     const maxRetryRounds = 2;

// //     for (let round = 0; round <= maxRetryRounds; round++) {
// //         if (pendingFiles.length === 0) break;

// //         if (round > 0) {
// //             console.log(
// //                 `[AI] Retry round ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
// //             );
// //         }

// //         const results = await pMap(
// //             pendingFiles,
// //             async (file) => {
// //                 try {
// //                     if (callbacks?.onFileStart) {
// //                         await callbacks.onFileStart(file.path);
// //                     }

// //                     const singleResult = await generateSingleFile(file, plan.files, prompt, files);

// //                     if (callbacks?.onFileComplete) {
// //                         await callbacks.onFileComplete(file.path, singleResult.code);
// //                     }
// //                     return { success: true, file, result: singleResult };
// //                 } catch (err) {
// //                     return { success: false, file, error: err };
// //                 }
// //             },
// //             { concurrency: MAX_CONCURRENCY },
// //         );

// //         const failedFiles = [];
// //         for (const entry of results) {
// //             if (entry.success) {
// //                 const { path, code } = entry.result;
// //                 files[path.startsWith("/") ? path : "/" + path] = code;
// //             } else {
// //                 console.warn(`[AI] File ${entry.file.path} failed in round ${round}: ${entry.error?.message || entry.error}`);
// //                 failedFiles.push(entry.file);
// //             }
// //         }
// //         pendingFiles = failedFiles;
// //     }

// //     // Safe fallback handling for any files that failed after all retry rounds
// //     if (pendingFiles.length > 0) {
// //         const failedPaths = pendingFiles.map((f) => f.path).join(", ");
// //         console.error(`[AI] Failed to generate ${pendingFiles.length} files after all retry rounds: ${failedPaths}`);

// //         for (const f of pendingFiles) {
// //             const ext = f.path.split(".").pop()?.toLowerCase();

// //             if (ext === "css") {
// //                 files[f.path] = `/* ${f.description} — Generation failed, please retry */\n`;
// //             } else {
// //                 files[f.path] =
// //                     "import React from 'react';\n\n" +
// //                     `// ⚠️ This file could not be generated. Please retry.\n` +
// //                     `// Purpose: ${f.description}\n\n` +
// //                     "export default function Placeholder() {\n" +
// //                     "  return (\n" +
// //                     "    <div className='p-8 text-center text-zinc-400'>\n" +
// //                     "      <p>⚠️ Component failed to generate. Please try again.</p>\n" +
// //                     "    </div>\n" +
// //                     "  );\n" +
// //                     "}\n";
// //             }
// //         }
// //     }

// //     if (!files["/App.js"]) {
// //         throw new Error("AI did not generate /App.js entry point");
// //     }

// //     return { files, description: plan.projectDescription || prompt };
// // }

// // export async function reviseProject(prompt, manifest, relevantFiles, recentMessages) {
// //     const contextParts = [];

// //     contextParts.push("## Current Project Files (manifest)");
// //     contextParts.push("```");
// //     for (const f of manifest) {
// //         contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`);
// //     }
// //     contextParts.push("```");

// //     if (Object.keys(relevantFiles).length > 0) {
// //         contextParts.push("\n## File Contents (for reference)");
// //         for (const [path, content] of Object.entries(relevantFiles)) {
// //             contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``);
// //         }
// //     }

// //     if (recentMessages.length > 0) {
// //         contextParts.push("\n## Recent Conversation");
// //         for (const msg of recentMessages.slice(-3)) {
// //             contextParts.push(`${msg.role}: ${msg.content}`);
// //         }
// //     }

// //     contextParts.push(`\n## Revision Request\n${prompt}`);

// //     console.log("[AI] Revising project...");

// //     let rawParsed;
// //     try {
// //         const { object } = await generateObject({
// //             model,
// //             schema: RevisionResultSchema,
// //             mode: 'json',
// //             temperature: 0.1,
// //             system: STRICT_JSON_SYSTEM_PREFIX + REVISE_SYSTEM,
// //             prompt: contextParts.join("\n"),
// //             maxRetries: 3,
// //         });
// //         rawParsed = object;
// //     } catch (err) {
// //         console.error('[AI] Revision standard mode failed. Retrying with fallback auto mode...', err.message);
// //         const { object } = await generateObject({
// //             model,
// //             schema: RevisionResultSchema,
// //             temperature: 0.1,
// //             system: STRICT_JSON_SYSTEM_PREFIX + REVISE_SYSTEM,
// //             prompt: contextParts.join("\n"),
// //             maxRetries: 2,
// //         });
// //         rawParsed = object;
// //     }

// //     if (rawParsed && Array.isArray(rawParsed.operations)) {
// //         rawParsed.operations = rawParsed.operations.map((op) => {
// //             if (!op || typeof op !== "object") return op;

// //             let opStr = String(op.op || "").trim().toLowerCase();

// //             if (["create", "add", "new"].includes(opStr)) op.op = "create";
// //             else if (["update", "edit", "modify", "patch"].includes(opStr)) op.op = "update";
// //             else if (["delete", "remove", "del", "rm"].includes(opStr)) op.op = "delete";

// //             if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
// //                 op.path = "/" + op.path;
// //             }

// //             if (op.content) op.content = normalizeContent(op.content);
// //             if (op.search) op.search = normalizeContent(op.search);
// //             if (op.replace) op.replace = normalizeContent(op.replace);

// //             if (op.op === "create" && op.content) {
// //                 const validation = validateRevisionContent(op.content, op.path, "create");
// //                 op.content = validation.content;
// //                 if (validation.warnings.length > 0) {
// //                     console.log(`[Validator] Revision Create adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// //                 }
// //             } else if (op.op === "update" && op.replace) {
// //                 const validation = validateRevisionContent(op.replace, op.path, "update");
// //                 op.replace = validation.content;
// //                 if (validation.warnings.length > 0) {
// //                     console.log(`[Validator] Revision Update adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
// //                 }
// //             }
// //             return op;
// //         });
// //     }
// //     return rawParsed;
// // }

// import { createOpenAI } from '@ai-sdk/openai';
// import { generateObject } from 'ai';
// import pMap from 'p-map';
// import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// import { buildFileCodeSystem } from './diff.js';
// import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// import { normalizeContent } from './contentNormalizer.js';
// import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// // --- OpenRouter Model Client Setup ---
// const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
// const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

// const openrouter = createOpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_API_KEY,
// });

// const model = openrouter(MODEL);

// const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

// // Helper for safe AI call execution with detailed schema failure logging
// async function safeGenerateObject({ schema, system, prompt, temperature = 0.1 }) {
//     try {
//         const { object } = await generateObject({
//             model,
//             schema,
//             mode: 'json',
//             temperature,
//             system: STRICT_JSON_SYSTEM_PREFIX + system,
//             prompt,
//             maxRetries: 3,
//         });
//         return object;
//     } catch (err) {
//         console.warn(`[AI Warning] Standard mode failed: ${err.message}. Retrying auto mode...`);
//         if (err.text) {
//             console.error(`[AI Raw Failure Output]:\n`, err.text);
//         }

//         const { object } = await generateObject({
//             model,
//             schema,
//             temperature,
//             system: STRICT_JSON_SYSTEM_PREFIX + system,
//             prompt,
//             maxRetries: 2,
//         });
//         return object;
//     }
// }

// // Generate a single file's code
// async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
//     const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
//     const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${file.description}`;

//     console.log(`[AI] Creating file: ${file.path}...`);

//     const object = await safeGenerateObject({
//         schema: FileCodeSchema,
//         system,
//         prompt: userMsg,
//         temperature: 0.1,
//     });

//     if (!object || !object.code) {
//         throw new Error(`Failed to generate code for ${file.path}`);
//     }

//     let code = normalizeContent(object.code);

//     if (code.trim().length === 0) {
//         throw new Error("Generated code is empty after normalization");
//     }

//     const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
//     code = validation.code;

//     if (validation.warnings.length > 0) {
//         console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//     }

//     console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
//     return { path: file.path, code };
// }

// // // Generate project files
// // export async function generateProject(prompt, callbacks) {
// //     console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
    
// //     const plan = await safeGenerateObject({
// //         schema: FilePlanSchema,
// //         system: FILE_PLAN_SYSTEM,
// //         prompt: `Plan a React website for: ${prompt}`,
// //         temperature: 0.2,
// //     });

// //     if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
// //         throw new Error("Failed to generate file structure plan from model output.");
// //     }

// //     if (!plan.files.find((f) => f.path === "/App.js")) {
// //         plan.files.unshift({
// //             path: "/App.js",
// //             description: "Main application entry point",
// //             exports: "default App",
// //             imports: ["./styles.css"],
// //         });
// //     }

// //     if (!plan.files.find((f) => f.path === "/styles.css")) {
// //         plan.files.push({
// //             path: "/styles.css",
// //             description: "Global CSS: Google Font import, keyframe animations, utility classes",
// //             exports: "none",
// //             imports: [],
// //         });
// //     }

// //     if (callbacks?.onPlan) {
// //         await callbacks.onPlan(plan);
// //     }

// //     console.log(`[AI] Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f) => f.path).join(", ")}`);

// //     const files = {};
// //     let pendingFiles = plan.files.map((f) => ({ ...f }));

// //     const maxRetryRounds = 2;

// //     for (let round = 0; round <= maxRetryRounds; round++) {
// //         if (pendingFiles.length === 0) break;

// //         if (round > 0) {
// //             console.log(
// //                 `[AI] Retry round ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
// //             );
// //         }

// //         const results = await pMap(
// //             pendingFiles,
// //             async (file) => {
// //                 try {
// //                     if (callbacks?.onFileStart) {
// //                         await callbacks.onFileStart(file.path);
// //                     }

// //                     const singleResult = await generateSingleFile(file, plan.files, prompt, files);

// //                     if (callbacks?.onFileComplete) {
// //                         await callbacks.onFileComplete(file.path, singleResult.code);
// //                     }
// //                     return { success: true, file, result: singleResult };
// //                 } catch (err) {
// //                     return { success: false, file, error: err };
// //                 }
// //             },
// //             { concurrency: MAX_CONCURRENCY },
// //         );

// //         const failedFiles = [];
// //         for (const entry of results) {
// //             if (entry.success) {
// //                 const { path, code } = entry.result;
// //                 files[path.startsWith("/") ? path : "/" + path] = code;
// //             } else {
// //                 console.warn(`[AI] File ${entry.file.path} failed in round ${round}: ${entry.error?.message || entry.error}`);
// //                 failedFiles.push(entry.file);
// //             }
// //         }
// //         pendingFiles = failedFiles;
// //     }

// //     if (pendingFiles.length > 0) {
// //         const failedPaths = pendingFiles.map((f) => f.path).join(", ");
// //         console.error(`[AI] Failed to generate ${pendingFiles.length} files after all retry rounds: ${failedPaths}`);

// //         for (const f of pendingFiles) {
// //             const ext = f.path.split(".").pop()?.toLowerCase();

// //             if (ext === "css") {
// //                 files[f.path] = `/* ${f.description} — Generation failed, please retry */\n`;
// //             } else {
// //                 files[f.path] =
// //                     "import React from 'react';\n\n" +
// //                     `// ⚠️ This file could not be generated. Please retry.\n` +
// //                     `// Purpose: ${f.description}\n\n` +
// //                     "export default function Placeholder() {\n" +
// //                     "  return (\n" +
// //                     "    <div className='p-8 text-center text-zinc-400'>\n" +
// //                     "      <p>⚠️ Component failed to generate. Please try again.</p>\n" +
// //                     "    </div>\n" +
// //                     "  );\n" +
// //                     "}\n";
// //             }
// //         }
// //     }

// //     if (!files["/App.js"]) {
// //         throw new Error("AI did not generate /App.js entry point");
// //     }

// //     return { files, description: plan.projectDescription || prompt };
// // }
// //generate project files
// export async function generateProject(prompt, callbacks) {
//     console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
    
//     let plan;
//     try {
//         plan = await safeGenerateObject({
//             schema: FilePlanSchema,
//             system: FILE_PLAN_SYSTEM,
//             prompt: `Plan a React website for: ${prompt}`,
//             temperature: 0.2,
//         });
//     } catch (err) {
//         console.warn("[AI Phase 1 Warning]: AI model failed to produce a valid plan schema. Using standard React structure.", err.message);
//     }

//     // FIX: If the model returns empty data or fails schema checks, supply a safe default file layout
//     if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
//         console.log("[AI Phase 1]: Applying standard React structure fallback...");
//         plan = {
//             projectName: "React Project",
//             projectDescription: prompt,
//             files: [
//                 { path: "/App.js", description: "Main entry point component", exports: "default App", imports: ["./styles.css"] },
//                 { path: "/Header.js", description: "Header navigation component", exports: "default Header", imports: [] },
//                 { path: "/MainSection.js", description: "Main interactive section component", exports: "default MainSection", imports: [] },
//                 { path: "/Footer.js", description: "Footer component", exports: "default Footer", imports: [] },
//                 { path: "/styles.css", description: "Global styling and utility classes", exports: "none", imports: [] }
//             ]
//         };
//     }

//     if (!plan.files.find((f) => f.path === "/App.js")) {
//         plan.files.unshift({
//             path: "/App.js",
//             description: "Main application entry point",
//             exports: "default App",
//             imports: ["./styles.css"],
//         });
//     }

//     if (!plan.files.find((f) => f.path === "/styles.css")) {
//         plan.files.push({
//             path: "/styles.css",
//             description: "Global CSS: Google Font import, keyframe animations, utility classes",
//             exports: "none",
//             imports: [],
//         });
//     }

//     if (callbacks?.onPlan) {
//         await callbacks.onPlan(plan);
//     }
// }
//     // Phase 2 generation continues here...

// export async function reviseProject(prompt, manifest, relevantFiles, recentMessages) {
//     const contextParts = [];

//     contextParts.push("## Current Project Files (manifest)");
//     contextParts.push("```");
//     for (const f of manifest) {
//         contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`);
//     }
//     contextParts.push("```");

//     if (Object.keys(relevantFiles).length > 0) {
//         contextParts.push("\n## File Contents (for reference)");
//         for (const [path, content] of Object.entries(relevantFiles)) {
//             contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``);
//         }
//     }

//     if (recentMessages.length > 0) {
//         contextParts.push("\n## Recent Conversation");
//         for (const msg of recentMessages.slice(-3)) {
//             contextParts.push(`${msg.role}: ${msg.content}`);
//         }
//     }

//     contextParts.push(`\n## Revision Request\n${prompt}`);

//     console.log("[AI] Revising project...");

//     const rawParsed = await safeGenerateObject({
//         schema: RevisionResultSchema,
//         system: REVISE_SYSTEM,
//         prompt: contextParts.join("\n"),
//         temperature: 0.1,
//     });

//     if (rawParsed && Array.isArray(rawParsed.operations)) {
//         rawParsed.operations = rawParsed.operations.map((op) => {
//             if (!op || typeof op !== "object") return op;

//             if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
//                 op.path = "/" + op.path;
//             }

//             if (op.content) op.content = normalizeContent(op.content);
//             if (op.search) op.search = normalizeContent(op.search);
//             if (op.replace) op.replace = normalizeContent(op.replace);

//             if (op.op === "create" && op.content) {
//                 const validation = validateRevisionContent(op.content, op.path, "create");
//                 op.content = validation.content;
//                 if (validation.warnings.length > 0) {
//                     console.log(`[Validator] Revision Create adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//                 }
//             } else if (op.op === "update" && op.replace) {
//                 const validation = validateRevisionContent(op.replace, op.path, "update");
//                 op.replace = validation.content;
//                 if (validation.warnings.length > 0) {
//                     console.log(`[Validator] Revision Update adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//                 }
//             }
//             return op;
//         });
//     }
//     return rawParsed;
// }

// import { createOpenAI } from '@ai-sdk/openai';
// import { generateObject } from 'ai';
// import pMap from 'p-map';
// import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// import { buildFileCodeSystem } from './diff.js';
// import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// import { normalizeContent } from './contentNormalizer.js';
// import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// // --- OpenRouter Model Client Setup ---
// const MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
// const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

// const openrouter = createOpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_API_KEY,
// });

// const model = openrouter(MODEL);

// const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

// // Safe wrapper for generateObject to prevent AI formatting crashes
// async function safeGenerateObject({ schema, system, prompt, temperature = 0.1 }) {
//     try {
//         const { object } = await generateObject({
//             model,
//             schema,
//             mode: 'json',
//             temperature,
//             system: STRICT_JSON_SYSTEM_PREFIX + system,
//             prompt,
//             maxRetries: 3,
//         });
//         return object;
//     } catch (err) {
//         console.warn(`[AI Warning] Standard JSON mode failed: ${err.message}. Retrying auto mode...`);
//         if (err.text) {
//             console.error(`[AI Raw Output on Failure]:\n`, err.text);
//         }

//         const { object } = await generateObject({
//             model,
//             schema,
//             temperature,
//             system: STRICT_JSON_SYSTEM_PREFIX + system,
//             prompt,
//             maxRetries: 2,
//         });
//         return object;
//     }
// }

// // Generate a single file's code with property safety checks
// async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
//     if (!file || !file.path) {
//         throw new Error("Invalid file object provided to generateSingleFile");
//     }

//     // Default description if missing to prevent 'Cannot read properties of undefined'
//     const fileDescription = file.description || "React component/file";
//     const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
//     const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${fileDescription}`;

//     console.log(`[AI] Creating file: ${file.path}...`);

//     const object = await safeGenerateObject({
//         schema: FileCodeSchema,
//         system,
//         prompt: userMsg,
//         temperature: 0.1,
//     });

//     if (!object || typeof object.code !== 'string') {
//         throw new Error(`Failed to generate code for ${file.path}`);
//     }

//     let code = normalizeContent(object.code);

//     if (code.trim().length === 0) {
//         throw new Error("Generated code is empty after normalization");
//     }

//     // Apply post-generation validation and auto-fixing
//     const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
//     code = validation.code;

//     if (validation.warnings && validation.warnings.length > 0) {
//         console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//     }

//     console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
//     return { path: file.path, code };
// }

// // Main generation pipeline
// export async function generateProject(prompt, callbacks) {
//     console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
    
//     let plan;
//     try {
//         plan = await safeGenerateObject({
//             schema: FilePlanSchema,
//             system: FILE_PLAN_SYSTEM,
//             prompt: `Plan a React website for: ${prompt}`,
//             temperature: 0.2,
//         });
//     } catch (err) {
//         console.warn("[AI Phase 1 Warning]: AI model failed to produce plan schema. Applying React structure fallback.", err.message);
//     }

//     // Handle raw string output if the AI returns plain string JSON
//     if (typeof plan === "string") {
//         try {
//             plan = JSON.parse(plan);
//         } catch {
//             plan = null;
//         }
//     }

//     // Fallback: If AI returns empty array or fails, supply standard structure
//     if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
//         console.log("[AI Phase 1]: Applying standard React structure fallback...");
//         plan = {
//             projectName: "React Project",
//             projectDescription: prompt,
//             files: [
//                 { path: "/App.js", description: "Main entry point component", exports: "default App", imports: ["./styles.css"] },
//                 { path: "/Header.js", description: "Header navigation component", exports: "default Header", imports: [] },
//                 { path: "/MainSection.js", description: "Main interactive section component", exports: "default MainSection", imports: [] },
//                 { path: "/Footer.js", description: "Footer component", exports: "default Footer", imports: [] },
//                 { path: "/styles.css", description: "Global styling and utility classes", exports: "none", imports: [] }
//             ]
//         };
//     }

//     // Sanitize every file object to prevent undefined property errors during execution
//     plan.files = plan.files
//         .filter((f) => f && typeof f === "object" && f.path)
//         .map((f) => ({
//             path: f.path.startsWith("/") ? f.path : "/" + f.path,
//             description: f.description || "React component file",
//             exports: f.exports || "default",
//             imports: Array.isArray(f.imports) ? f.imports : [],
//         }));

//     if (!plan.files.find((f) => f.path === "/App.js")) {
//         plan.files.unshift({
//             path: "/App.js",
//             description: "Main application entry point",
//             exports: "default App",
//             imports: ["./styles.css"],
//         });
//     }

//     if (!plan.files.find((f) => f.path === "/styles.css")) {
//         plan.files.push({
//             path: "/styles.css",
//             description: "Global CSS: Google Font import, keyframe animations, utility classes",
//             exports: "none",
//             imports: [],
//         });
//     }

//     if (callbacks?.onPlan) {
//         await callbacks.onPlan(plan);
//     }

//     console.log(`[AI] Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f) => f.path).join(", ")}`);

//     const files = {};
//     let pendingFiles = plan.files.map((f) => ({ ...f }));

//     const maxRetryRounds = 2;

//     for (let round = 0; round <= maxRetryRounds; round++) {
//         if (pendingFiles.length === 0) break;

//         if (round > 0) {
//             console.log(
//                 `[AI] Retry round ${round}/${maxRetryRounds} for ${pendingFiles.length} failed files: ${pendingFiles.map((f) => f.path).join(", ")}`,
//             );
//         }

//         const results = await pMap(
//             pendingFiles,
//             async (file) => {
//                 try {
//                     if (callbacks?.onFileStart) {
//                         await callbacks.onFileStart(file.path);
//                     }

//                     const singleResult = await generateSingleFile(file, plan.files, prompt, files);

//                     if (callbacks?.onFileComplete) {
//                         await callbacks.onFileComplete(file.path, singleResult.code);
//                     }
//                     return { success: true, file, result: singleResult };
//                 } catch (err) {
//                     return { success: false, file, error: err };
//                 }
//             },
//             { concurrency: MAX_CONCURRENCY },
//         );

//         const failedFiles = [];
//         for (const entry of results) {
//             if (entry.success) {
//                 const { path, code } = entry.result;
//                 files[path.startsWith("/") ? path : "/" + path] = code;
//             } else {
//                 console.warn(`[AI] File ${entry.file.path} failed in round ${round}: ${entry.error?.message || entry.error}`);
//                 failedFiles.push(entry.file);
//             }
//         }
//         pendingFiles = failedFiles;
//     }

//     // Safe fallback handling for files failing all retry rounds
//     if (pendingFiles.length > 0) {
//         const failedPaths = pendingFiles.map((f) => f.path).join(", ");
//         console.error(`[AI] Failed to generate ${pendingFiles.length} files after all retry rounds: ${failedPaths}`);

//         for (const f of pendingFiles) {
//             const ext = f.path.split(".").pop()?.toLowerCase();

//             if (ext === "css") {
//                 files[f.path] = `/* ${f.description} — Generation failed, please retry */\n`;
//             } else {
//                 files[f.path] =
//                     "import React from 'react';\n\n" +
//                     `// ⚠️ This file could not be generated. Please retry.\n` +
//                     `// Purpose: ${f.description}\n\n` +
//                     "export default function Placeholder() {\n" +
//                     "  return (\n" +
//                     "    <div className='p-8 text-center text-zinc-400'>\n" +
//                     "      <p>⚠️ Component failed to generate. Please try again.</p>\n" +
//                     "    </div>\n" +
//                     "  );\n" +
//                     "}\n";
//             }
//         }
//     }

//     if (!files["/App.js"]) {
//         throw new Error("AI did not generate /App.js entry point");
//     }

//     return { files, description: plan.projectDescription || prompt };
// }

// // Project revision pipeline
// export async function reviseProject(prompt, manifest, relevantFiles, recentMessages) {
//     const contextParts = [];

//     contextParts.push("## Current Project Files (manifest)");
//     contextParts.push("```");
//     for (const f of manifest) {
//         contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`);
//     }
//     contextParts.push("```");

//     if (Object.keys(relevantFiles).length > 0) {
//         contextParts.push("\n## File Contents (for reference)");
//         for (const [path, content] of Object.entries(relevantFiles)) {
//             contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``);
//         }
//     }

//     if (recentMessages.length > 0) {
//         contextParts.push("\n## Recent Conversation");
//         for (const msg of recentMessages.slice(-3)) {
//             contextParts.push(`${msg.role}: ${msg.content}`);
//         }
//     }

//     contextParts.push(`\n## Revision Request\n${prompt}`);

//     console.log("[AI] Revising project...");

//     const rawParsed = await safeGenerateObject({
//         schema: RevisionResultSchema,
//         system: REVISE_SYSTEM,
//         prompt: contextParts.join("\n"),
//         temperature: 0.1,
//     });

//     if (rawParsed && Array.isArray(rawParsed.operations)) {
//         rawParsed.operations = rawParsed.operations.map((op) => {
//             if (!op || typeof op !== "object") return op;

//             if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
//                 op.path = "/" + op.path;
//             }

//             if (op.content) op.content = normalizeContent(op.content);
//             if (op.search) op.search = normalizeContent(op.search);
//             if (op.replace) op.replace = normalizeContent(op.replace);

//             if (op.op === "create" && op.content) {
//                 const validation = validateRevisionContent(op.content, op.path, "create");
//                 op.content = validation.content;
//                 if (validation.warnings && validation.warnings.length > 0) {
//                     console.log(`[Validator] Revision Create adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//                 }
//             } else if (op.op === "update" && op.replace) {
//                 const validation = validateRevisionContent(op.replace, op.path, "update");
//                 op.replace = validation.content;
//                 if (validation.warnings && validation.warnings.length > 0) {
//                     console.log(`[Validator] Revision Update adjustments for ${op.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//                 }
//             }
//             return op;
//         });
//     }
//     return rawParsed;
// }

// import { createOpenAI } from '@ai-sdk/openai';
// import { generateObject } from 'ai';
// import pMap from 'p-map';
// import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// import { buildFileCodeSystem } from './diff.js';
// import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// import { normalizeContent } from './contentNormalizer.js';
// import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// // --- OpenRouter Model Client Setup ---
// const MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
// const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

// const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

// const model = openrouter(MODEL);

// const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

// // Helper to construct a standard index.js entry point mounting App.js
// const DEFAULT_INDEX_CODE = `import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App";
// import "./styles.css";

// const rootElement = document.getElementById("root");
// const root = createRoot(rootElement);

// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
// `;

// // Safe wrapper for generateObject to prevent AI formatting crashes
// async function safeGenerateObject({ schema, system, prompt, temperature = 0.1 }) {
//   try {
//     const { object } = await generateObject({
//       model,
//       schema,
//       mode: 'json',
//       temperature,
//       system: STRICT_JSON_SYSTEM_PREFIX + system,
//       maxRetries: 3,
//     });
//     return object;
//   } catch (err) {
//     console.warn(`[AI Warning] Standard JSON mode failed: ${err.message}. Retrying auto mode...`);
//     if (err.text) {
//       console.error(`[AI Raw Output on Failure]:\n`, err.text);
//     }

//     const { object } = await generateObject({
//       model,
//       schema,
//       temperature,
//       system: STRICT_JSON_SYSTEM_PREFIX + system,
//       maxRetries: 2,
//     });
//     return object;
//   }
// }

// // Generate a single file's code with property safety checks
// async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
//   if (!file || !file.path) {
//     throw new Error("Invalid file object provided to generateSingleFile");
//   }

//   const fileDescription = file.description || "React component/file";
//   const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
//   const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${fileDescription}`;

//   console.log(`[AI] Creating file: ${file.path}...`);

//   const object = await safeGenerateObject({
//     schema: FileCodeSchema,
//     system,
//     prompt: userMsg,
//     temperature: 0.1,
//   });

//   if (!object || typeof object.code !== 'string') {
//     throw new Error(`Failed to generate code for ${file.path}`);
//   }

//   let code = normalizeContent(object.code);

//   if (code.trim().length === 0) {
//     throw new Error("Generated code is empty after normalization");
//   }

//   const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
//   code = validation.code;

//   if (validation.warnings && validation.warnings.length > 0) {
//     console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//   }

//   console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
//   return { path: file.path, code };
// }

// // Main generation pipeline
// export async function generateProject(prompt, callbacks) {
//   console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
  
//   let plan;
//   try {
//     plan = await safeGenerateObject({
//       schema: FilePlanSchema,
//       system: FILE_PLAN_SYSTEM,
//       prompt: `Plan a React website for: ${prompt}`,
//       temperature: 0.2,
//     });
//   } catch (err) {
//     console.warn("[AI Phase 1 Warning]: AI model failed to produce plan schema. Applying React structure fallback.", err.message);
//   }

//   if (typeof plan === "string") {
//     try {
//       plan = JSON.parse(plan);
//     } catch {
//       plan = null;
//     }
//   }

//   // Fallback structure
//   if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
//     console.log("[AI Phase 1]: Applying standard React structure fallback...");
//     plan = {
//       projectName: "React Project",
//       projectDescription: prompt,
//       files: [
//         { path: "/index.js", description: "Entry point that mounts App into DOM", exports: "none", imports: ["./App", "./styles.css"] },
//         { path: "/App.js", description: "Main entry point component", exports: "default App", imports: ["./styles.css"] },
//         { path: "/Header.js", description: "Header navigation component", exports: "default Header", imports: [] },
//         { path: "/MainSection.js", description: "Main interactive section component", exports: "default MainSection", imports: [] },
//         { path: "/Footer.js", description: "Footer component", exports: "default Footer", imports: [] },
//         { path: "/styles.css", description: "Global styling and utility classes", exports: "none", imports: [] }
//       ]
//     };
//   }

//   // Sanitize file objects
//   plan.files = plan.files
//     .filter((f) => f && typeof f === "object" && f.path)
//     .map((f) => ({
//       path: f.path.startsWith("/") ? f.path : "/" + f.path,
//       description: f.description || "React component file",
//       exports: f.exports || "default",
//       imports: Array.isArray(f.imports) ? f.imports : [],
//     }));

//   if (!plan.files.find((f) => f.path === "/index.js")) {
//     plan.files.unshift({
//       path: "/index.js",
//       description: "Entry point mounting App component",
//       exports: "none",
//       imports: ["./App", "./styles.css"],
//     });
//   }

//   if (!plan.files.find((f) => f.path === "/App.js")) {
//     plan.files.unshift({
//       path: "/App.js",
//       description: "Main application entry point",
//       exports: "default App",
//       imports: ["./styles.css"],
//     });
//   }

//   if (!plan.files.find((f) => f.path === "/styles.css")) {
//     plan.files.push({
//       path: "/styles.css",
//       description: "Global CSS: Google Font import, keyframe animations, utility classes",
//       exports: "none",
//       imports: [],
//     });
//   }

//   if (callbacks?.onPlan) {
//     await callbacks.onPlan(plan);
//   }

//   console.log(`[AI] Phase 2: Generating ${plan.files.length} files in parallel (concurrency=${MAX_CONCURRENCY}): ${plan.files.map((f) => f.path).join(", ")}`);

//   const files = {};
//   let pendingFiles = plan.files.map((f) => ({ ...f }));

//   const maxRetryRounds = 2;

//   for (let round = 0; round <= maxRetryRounds; round++) {
//     if (pendingFiles.length === 0) break;

//     const results = await pMap(
//       pendingFiles,
//       async (file) => {
//         try {
//           if (callbacks?.onFileStart) {
//             await callbacks.onFileStart(file.path);
//           }

//           // Generate directly or auto-fill index.js
//           let singleResult;
//           if (file.path === "/index.js") {
//             singleResult = { path: "/index.js", code: DEFAULT_INDEX_CODE };
//           } else {
//             singleResult = await generateSingleFile(file, plan.files, prompt, files);
//           }

//           if (callbacks?.onFileComplete) {
//             await callbacks.onFileComplete(file.path, singleResult.code);
//           }
//           return { success: true, file, result: singleResult };
//         } catch (err) {
//           return { success: false, file, error: err };
//         }
//       },
//       { concurrency: MAX_CONCURRENCY },
//     );

//     const failedFiles = [];
//     for (const entry of results) {
//       if (entry.success) {
//         const { path, code } = entry.result;
//         files[path.startsWith("/") ? path : "/" + path] = code;
//       } else {
//         console.warn(`[AI] File ${entry.file.path} failed in round ${round}: ${entry.error?.message || entry.error}`);
//         failedFiles.push(entry.file);
//       }
//     }
//     pendingFiles = failedFiles;
//   }

//   // Ensure index.js exists
//   if (!files["/index.js"]) {
//     files["/index.js"] = DEFAULT_INDEX_CODE;
//   }

//   if (!files["/App.js"]) {
//     throw new Error("AI did not generate /App.js entry point");
//   }

//   return { files, description: plan.projectDescription || prompt };
// }

// // Project revision pipeline
// export async function reviseProject(prompt, manifest, relevantFiles, recentMessages) {
//   const contextParts = [];

//   contextParts.push("## Current Project Files (manifest)");
//   contextParts.push("```");
//   for (const f of manifest) {
//     contextParts.push(`${f.path} (${f.hash}, ${f.size}B)`);
//   }
//   contextParts.push("```");

//   if (Object.keys(relevantFiles).length > 0) {
//     contextParts.push("\n## File Contents (for reference)");
//     for (const [path, content] of Object.entries(relevantFiles)) {
//       contextParts.push(`\n### ${path}\n\`\`\`\n${content}\n\`\`\``);
//     }
//   }

//   if (recentMessages.length > 0) {
//     contextParts.push("\n## Recent Conversation");
//     for (const msg of recentMessages.slice(-3)) {
//       contextParts.push(`${msg.role}: ${msg.content}`);
//     }
//   }

//   contextParts.push(`\n## Revision Request\n${prompt}`);

//   console.log("[AI] Revising project...");

//   const rawParsed = await safeGenerateObject({
//     schema: RevisionResultSchema,
//     system: REVISE_SYSTEM,
//     prompt: contextParts.join("\n"),
//     temperature: 0.1,
//   });

//   if (rawParsed && Array.isArray(rawParsed.operations)) {
//     rawParsed.operations = rawParsed.operations.map((op) => {
//       if (!op || typeof op !== "object") return op;

//       if (op.path && typeof op.path === "string" && !op.path.startsWith("/")) {
//         op.path = "/" + op.path;
//       }

//       if (op.content) op.content = normalizeContent(op.content);
//       if (op.search) op.search = normalizeContent(op.search);
//       if (op.replace) op.replace = normalizeContent(op.replace);

//       if (op.op === "create" && op.content) {
//         const validation = validateRevisionContent(op.content, op.path, "create");
//         op.content = validation.content;
//       } else if (op.op === "update" && op.replace) {
//         const validation = validateRevisionContent(op.replace, op.path, "update");
//         op.replace = validation.content;
//       }
//       return op;
//     });
//   }
//   return rawParsed;
// }


// import { createOpenAI } from '@ai-sdk/openai';
// import { generateObject } from 'ai';
// import pMap from 'p-map';
// import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
// import { buildFileCodeSystem } from './diff.js';
// import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

// import { normalizeContent } from './contentNormalizer.js';
// import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

// const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

// const openrouter = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

// // Fallback chain of free models
// const FALLBACK_MODELS = [
//   process.env.OPENROUTER_MODEL,
//   "google/gemini-2.0-flash-lite-preview-02-05:free",
//   "meta-llama/llama-3.1-8b-instruct:free",
//   "mistralai/mistral-7b-instruct:free",
//   "qwen/qwen-2.5-7b-instruct:free"
// ].filter(Boolean);

// const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

// const DEFAULT_INDEX_CODE = `import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App";
// import "./styles.css";

// const rootElement = document.getElementById("root");
// const root = createRoot(rootElement);

// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
// `;

// function buildFallbackApp(files) {
//   const fileKeys = Object.keys(files);
//   const hasHeader = fileKeys.includes("/Header.js");
//   const hasMain = fileKeys.includes("/MainSection.js");
//   const hasFooter = fileKeys.includes("/Footer.js");

//   let imports = `import React from "react";\nimport "./styles.css";\n`;
//   if (hasHeader) imports += `import Header from "./Header";\n`;
//   if (hasMain) imports += `import MainSection from "./MainSection";\n`;
//   if (hasFooter) imports += `import Footer from "./Footer";\n`;

//   return `${imports}
// export default function App() {
//   return (
//     <div className="min-h-screen bg-white text-zinc-900">
//       ${hasHeader ? `<Header />` : ``}
//       ${hasMain ? `<MainSection />` : `<main className="p-8 text-center"><h1 className="text-3xl font-bold">Welcome to your Web App</h1></main>`}
//       ${hasFooter ? `<Footer />` : ``}
//     </div>
//   );
// }
// `;
// }

// // Wrapper that iterates through available models on failure
// async function safeGenerateObject({ schema, system, prompt, temperature = 0.1 }) {
//   let lastError;

//   for (const modelName of FALLBACK_MODELS) {
//     try {
//       console.log(`[AI] Attempting generation with model: ${modelName}`);
//       const model = openrouter(modelName);
      
//       const { object } = await generateObject({
//         model,
//         schema,
//         temperature,
//         system: STRICT_JSON_SYSTEM_PREFIX + (system || ""),
//         prompt: prompt || "Generate the required structure",
//         maxRetries: 1,
//       });
      
//       return object;
//     } catch (err) {
//       lastError = err;
//       console.warn(`[AI Warning] Model ${modelName} failed: ${err.message}. Trying next fallback...`);
//     }
//   }

//   throw lastError || new Error("All AI fallback models failed");
// }

// async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
//   if (!file || !file.path) {
//     throw new Error("Invalid file object provided to generateSingleFile");
//   }

//   const fileDescription = file.description || "React component/file";
//   const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
//   const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${fileDescription}`;

//   console.log(`[AI] Creating file: ${file.path}...`);

//   const object = await safeGenerateObject({
//     schema: FileCodeSchema,
//     system,
//     prompt: userMsg,
//     temperature: 0.1,
//   });

//   if (!object || typeof object.code !== 'string') {
//     throw new Error(`Failed to generate code for ${file.path}`);
//   }

//   let code = normalizeContent(object.code);

//   if (code.trim().length === 0) {
//     throw new Error("Generated code is empty after normalization");
//   }

//   const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
//   code = validation.code;

//   if (validation.warnings && validation.warnings.length > 0) {
//     console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
//   }

//   console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
//   return { path: file.path, code };
// }

// export async function generateProject(prompt, callbacks) {
//   console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
  
//   let plan;
//   try {
//     plan = await safeGenerateObject({
//       schema: FilePlanSchema,
//       system: FILE_PLAN_SYSTEM,
//       prompt: `Plan a React website for: ${prompt}`,
//       temperature: 0.2,
//     });
//   } catch (err) {
//     console.warn("[AI Phase 1 Warning]: All AI models failed to produce plan schema. Applying fallback plan.", err.message);
//   }

//   if (typeof plan === "string") {
//     try {
//       plan = JSON.parse(plan);
//     } catch {
//       plan = null;
//     }
//   }

//   if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
//     console.log("[AI Phase 1]: Applying standard React structure fallback...");
//     plan = {
//       projectName: "React Project",
//       projectDescription: prompt,
//       files: [
//         { path: "/index.js", description: "Entry point that mounts App into DOM", exports: "none", imports: ["./App", "./styles.css"] },
//         { path: "/App.js", description: "Main entry point component", exports: "default App", imports: ["./styles.css"] },
//         { path: "/Header.js", description: "Header navigation component", exports: "default Header", imports: [] },
//         { path: "/MainSection.js", description: "Main interactive section component", exports: "default MainSection", imports: [] },
//         { path: "/Footer.js", description: "Footer component", exports: "default Footer", imports: [] },
//         { path: "/styles.css", description: "Global styling and utility classes", exports: "none", imports: [] }
//       ]
//     };
//   }

//   plan.files = plan.files
//     .filter((f) => f && typeof f === "object" && f.path)
//     .map((f) => ({
//       path: f.path.startsWith("/") ? f.path : "/" + f.path,
//       description: f.description || "React component file",
//       exports: f.exports || "default",
//       imports: Array.isArray(f.imports) ? f.imports : [],
//     }));

//   if (!plan.files.find((f) => f.path === "/index.js")) {
//     plan.files.unshift({
//       path: "/index.js",
//       description: "Entry point that mounts App into DOM",
//       exports: "none",
//       imports: ["./App", "./styles.css"]
//     });
//   }

//   if (!plan.files.find((f) => f.path === "/App.js")) {
//     plan.files.unshift({
//       path: "/App.js",
//       description: "Main entry point component",
//       exports: "default App",
//       imports: ["./styles.css"]
//     });
//   }

//   const generatedFiles = {};

//   console.log(`[AI] Phase 2: Generating ${plan.files.length} files with concurrency ${MAX_CONCURRENCY}...`);

//   await pMap(
//     plan.files,
//     async (file) => {
//       try {
//         const result = await generateSingleFile(file, plan.files, prompt, generatedFiles);
//         generatedFiles[result.path] = result.code;
//         if (callbacks?.onFileGenerated) {
//           callbacks.onFileGenerated(result.path, result.code);
//         }
//       } catch (err) {
//         console.error(`[AI Error] Failed to generate ${file.path}: ${err.message}`);
//       }
//     },
//     { concurrency: MAX_CONCURRENCY }
//   );

//   if (!generatedFiles["/index.js"]) {
//     console.log("[AI Phase 2]: Injecting missing default /index.js entry point...");
//     generatedFiles["/index.js"] = DEFAULT_INDEX_CODE;
//     if (callbacks?.onFileGenerated) {
//       callbacks.onFileGenerated("/index.js", DEFAULT_INDEX_CODE);
//     }
//   }

//   if (!generatedFiles["/App.js"]) {
//     console.log("[AI Phase 2]: /App.js was missing. Injecting dynamic fallback /App.js...");
//     const fallbackAppCode = buildFallbackApp(generatedFiles);
//     generatedFiles["/App.js"] = fallbackAppCode;
//     if (callbacks?.onFileGenerated) {
//       callbacks.onFileGenerated("/App.js", fallbackAppCode);
//     }
//   }

//   return generatedFiles;
// }

// export async function reviseProject(existingFiles, revisionInstruction, callbacks) {
//   console.log(`[AI] Phase Revision: Applying changes for: "${revisionInstruction}"`);

//   const filesSummary = Object.keys(existingFiles)
//     .map((path) => `--- ${path} ---\n${existingFiles[path]}`)
//     .join("\n\n");

//   const prompt = `Current Files:\n${filesSummary}\n\nUser Revision Request:\n${revisionInstruction}`;

//   const object = await safeGenerateObject({
//     schema: RevisionResultSchema,
//     system: REVISE_SYSTEM,
//     prompt,
//     temperature: 0.1,
//   });

//   if (!object || !Array.isArray(object.files)) {
//     throw new Error("Revision failed: invalid output structure from AI model");
//   }

//   const updatedFiles = { ...existingFiles };

//   for (const updatedFile of object.files) {
//     if (!updatedFile.path || typeof updatedFile.code !== 'string') continue;

//     const path = updatedFile.path.startsWith("/") ? updatedFile.path : "/" + updatedFile.path;
//     let code = normalizeContent(updatedFile.code);

//     const validation = validateRevisionContent(code, path);
//     code = validation.code;

//     updatedFiles[path] = code;
//     if (callbacks?.onFileGenerated) {
//       callbacks.onFileGenerated(path, code);
//     }
//   }

//   return updatedFiles;
// }

import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import pMap from 'p-map';
import { FileCodeSchema, FilePlanSchema, RevisionResultSchema } from './aiSchemas.js';
import { buildFileCodeSystem } from './diff.js';
import { FILE_PLAN_SYSTEM, REVISE_SYSTEM } from './prompts.js';

import { normalizeContent } from './contentNormalizer.js';
import { validateAndFixCode, validateRevisionContent } from './contentValidator.js';

const MAX_CONCURRENCY = parseInt(process.env.AI_MAX_CONCURRENCY || "2", 10);

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Updated fallback chain with active free models and OpenRouter's auto-router
const FALLBACK_MODELS = [
  process.env.OPENROUTER_MODEL,
  "openrouter/auto",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-r1:free",
  "qwen/qwen-2.5-coder-32b-instruct"
].filter(Boolean);

const STRICT_JSON_SYSTEM_PREFIX = "You are a precise automated code generator. You MUST return ONLY valid, raw JSON matching the required schema. Do NOT wrap output in extra markdown text, backticks, or commentary.\n\n";

const DEFAULT_INDEX_CODE = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

function buildFallbackApp(files) {
  const fileKeys = Object.keys(files);
  const hasHeader = fileKeys.includes("/Header.js");
  const hasMain = fileKeys.includes("/MainSection.js");
  const hasFooter = fileKeys.includes("/Footer.js");

  let imports = `import React from "react";\nimport "./styles.css";\n`;
  if (hasHeader) imports += `import Header from "./Header";\n`;
  if (hasMain) imports += `import MainSection from "./MainSection";\n`;
  if (hasFooter) imports += `import Footer from "./Footer";\n`;

  return `${imports}
export default function App() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      ${hasHeader ? `<Header />` : ``}
      ${hasMain ? `<MainSection />` : `<main className="p-8 text-center"><h1 className="text-3xl font-bold">Welcome to your Web App</h1></main>`}
      ${hasFooter ? `<Footer />` : ``}
    </div>
  );
}
`;
}

// Wrapper that iterates through available models on failure
async function safeGenerateObject({ schema, system, prompt, temperature = 0.1 }) {
  let lastError;

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`[AI] Attempting generation with model: ${modelName}`);
      const model = openrouter(modelName);
      
      const { object } = await generateObject({
        model,
        schema,
        temperature,
        system: STRICT_JSON_SYSTEM_PREFIX + (system || ""),
        prompt: prompt || "Generate the required structure",
        maxRetries: 1,
      });
      
      return object;
    } catch (err) {
      lastError = err;
      console.warn(`[AI Warning] Model ${modelName} failed: ${err.message}. Trying next fallback...`);
    }
  }

  throw lastError || new Error("All AI fallback models failed");
}

async function generateSingleFile(file, allFiles, prompt, alreadyGeneratedFiles) {
  if (!file || !file.path) {
    throw new Error("Invalid file object provided to generateSingleFile");
  }

  const fileDescription = file.description || "React component/file";
  const system = buildFileCodeSystem(allFiles, alreadyGeneratedFiles);
  const userMsg = `Project: ${prompt}\n\nWrite the complete code for: ${file.path}\nPurpose: ${fileDescription}`;

  console.log(`[AI] Creating file: ${file.path}...`);

  const object = await safeGenerateObject({
    schema: FileCodeSchema,
    system,
    prompt: userMsg,
    temperature: 0.1,
  });

  if (!object || typeof object.code !== 'string') {
    throw new Error(`Failed to generate code for ${file.path}`);
  }

  let code = normalizeContent(object.code);

  if (code.trim().length === 0) {
    throw new Error("Generated code is empty after normalization");
  }

  const validation = validateAndFixCode(code, file.path, { allPlannedFiles: allFiles });
  code = validation.code;

  if (validation.warnings && validation.warnings.length > 0) {
    console.log(`[Validator] Code adjustments for ${file.path}:\n  - ${validation.warnings.join("\n  - ")}`);
  }

  console.log(`[AI] Created file: ${file.path} (${code.length} chars)`);
  return { path: file.path, code };
}

export async function generateProject(prompt, callbacks) {
  console.log(`[AI] Phase 1: Planning file structure for: "${prompt.slice(0, 80)}..."`);
  
  let plan;
  try {
    plan = await safeGenerateObject({
      schema: FilePlanSchema,
      system: FILE_PLAN_SYSTEM,
      prompt: `Plan a React website for: ${prompt}`,
      temperature: 0.2,
    });
  } catch (err) {
    console.warn("[AI Phase 1 Warning]: All AI models failed to produce plan schema. Applying fallback plan.", err.message);
  }

  if (typeof plan === "string") {
    try {
      plan = JSON.parse(plan);
    } catch {
      plan = null;
    }
  }

  if (!plan || !Array.isArray(plan.files) || plan.files.length === 0) {
    console.log("[AI Phase 1]: Applying standard React structure fallback...");
    plan = {
      projectName: "React Project",
      projectDescription: prompt,
      files: [
        { path: "/index.js", description: "Entry point that mounts App into DOM", exports: "none", imports: ["./App", "./styles.css"] },
        { path: "/App.js", description: "Main entry point component", exports: "default App", imports: ["./styles.css"] },
        { path: "/Header.js", description: "Header navigation component", exports: "default Header", imports: [] },
        { path: "/MainSection.js", description: "Main interactive section component", exports: "default MainSection", imports: [] },
        { path: "/Footer.js", description: "Footer component", exports: "default Footer", imports: [] },
        { path: "/styles.css", description: "Global styling and utility classes", exports: "none", imports: [] }
      ]
    };
  }

  plan.files = plan.files
    .filter((f) => f && typeof f === "object" && f.path)
    .map((f) => ({
      path: f.path.startsWith("/") ? f.path : "/" + f.path,
      description: f.description || "React component file",
      exports: f.exports || "default",
      imports: Array.isArray(f.imports) ? f.imports : [],
    }));

  if (!plan.files.find((f) => f.path === "/index.js")) {
    plan.files.unshift({
      path: "/index.js",
      description: "Entry point that mounts App into DOM",
      exports: "none",
      imports: ["./App", "./styles.css"]
    });
  }

  if (!plan.files.find((f) => f.path === "/App.js")) {
    plan.files.unshift({
      path: "/App.js",
      description: "Main entry point component",
      exports: "default App",
      imports: ["./styles.css"]
    });
  }

  const generatedFiles = {};

  console.log(`[AI] Phase 2: Generating ${plan.files.length} files with concurrency ${MAX_CONCURRENCY}...`);

  await pMap(
    plan.files,
    async (file) => {
      try {
        const result = await generateSingleFile(file, plan.files, prompt, generatedFiles);
        generatedFiles[result.path] = result.code;
        if (callbacks?.onFileGenerated) {
          callbacks.onFileGenerated(result.path, result.code);
        }
      } catch (err) {
        console.error(`[AI Error] Failed to generate ${file.path}: ${err.message}`);
      }
    },
    { concurrency: MAX_CONCURRENCY }
  );

  if (!generatedFiles["/index.js"]) {
    console.log("[AI Phase 2]: Injecting missing default /index.js entry point...");
    generatedFiles["/index.js"] = DEFAULT_INDEX_CODE;
    if (callbacks?.onFileGenerated) {
      callbacks.onFileGenerated("/index.js", DEFAULT_INDEX_CODE);
    }
  }

  if (!generatedFiles["/App.js"]) {
    console.log("[AI Phase 2]: /App.js was missing. Injecting dynamic fallback /App.js...");
    const fallbackAppCode = buildFallbackApp(generatedFiles);
    generatedFiles["/App.js"] = fallbackAppCode;
    if (callbacks?.onFileGenerated) {
      callbacks.onFileGenerated("/App.js", fallbackAppCode);
    }
  }

  return generatedFiles;
}

export async function reviseProject(existingFiles, revisionInstruction, callbacks) {
  console.log(`[AI] Phase Revision: Applying changes for: "${revisionInstruction}"`);

  const filesSummary = Object.keys(existingFiles)
    .map((path) => `--- ${path} ---\n${existingFiles[path]}`)
    .join("\n\n");

  const prompt = `Current Files:\n${filesSummary}\n\nUser Revision Request:\n${revisionInstruction}`;

  const object = await safeGenerateObject({
    schema: RevisionResultSchema,
    system: REVISE_SYSTEM,
    prompt,
    temperature: 0.1,
  });

  if (!object || !Array.isArray(object.files)) {
    throw new Error("Revision failed: invalid output structure from AI model");
  }

  const updatedFiles = { ...existingFiles };

  for (const updatedFile of object.files) {
    if (!updatedFile.path || typeof updatedFile.code !== 'string') continue;

    const path = updatedFile.path.startsWith("/") ? updatedFile.path : "/" + updatedFile.path;
    let code = normalizeContent(updatedFile.code);

    const validation = validateRevisionContent(code, path);
    code = validation.code;

    updatedFiles[path] = code;
    if (callbacks?.onFileGenerated) {
      callbacks.onFileGenerated(path, code);
    }
  }

  return updatedFiles;
}