import { z } from "zod";


const skillSchema = z.object({
    name: z.string(),
    level: z.number()
})


const cursusInfoSchema = z.object({
    slug: z.string()
})

const cursusUsersSchema = z.object({
    grade: z.string().nullable(),
    level: z.number(),
    skills: z.array(skillSchema),
    cursus: cursusInfoSchema
})


const imageSchema = z.object({
    link: z.string(),
})

const projectSchema = z.object({
    name: z.string()
})


const projectsUsersSchema = z.object({
    status: z.string(),
    "validated?": z.boolean().nullable(),
    final_mark: z.number().nullable(),
    project: projectSchema
})


export const user42Schema = z.object({
    login: z.string(),
    email: z.string(),
    image: imageSchema.nullable(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    wallet: z.number(),
    correction_point: z.number(),
    cursus_users: z.array(cursusUsersSchema),
    projects_users: z.array(projectsUsersSchema)
});
