import { User } from "../user/user.types";

export namespace Tenent {
    export type CreateData = {
        name: string;
        slug: string;
        logo?: string;
        description?: string;
        users?: any
    }

    export type UpdateData = {
        id: string
        name?: string;
        logo?: string | null;
        description?: string | null;
    }

    export type Data = {
        id: string
        name: string
        slug: string
        logo: string | null
        description: string | null
        createdAt: Date
        updatedAt: Date
    }
}