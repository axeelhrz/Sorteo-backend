export declare const UserRole: {
    readonly ADMIN: "admin";
    readonly SHOP: "shop";
    readonly USER: "user";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
