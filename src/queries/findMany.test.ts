import { describe, expect, test } from "vitest";

import { db } from "../test/db";
import * as factory from "../test/factory";

describe("findMany", () => {
    test("it can select fields from the model", async () => {
        await db.transact(
            async (db) => {
                const { posts } = await factory.seed(db);
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(results.find((r) => r.id === posts[0].id)).toEqual({
                    id: posts[0].id,
                    title: posts[0].title,
                });
            },
            { rollback: true },
        );
    });

    test("it can fetch N:1 relations", async () => {
        await db.transact(
            async (db) => {
                const { posts, user } = await factory.seed(db);
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["id", "username"] } },
                });

                expect(results.find((r) => r.id === posts[0].id)).toEqual({
                    id: posts[0].id,
                    title: posts[0].title,
                    author: {
                        id: user.id,
                        username: user.username,
                    },
                });
            },
            { rollback: true },
        );
    });

    test("it can fetch 1:N relations", async () => {
        await db.transact(
            async (db) => {
                const { posts, user } = await factory.seed(db);
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    include: { posts: { select: ["id", "title", "content"] } },
                });

                expect(results.find((r) => r.id === user.id)).toEqual({
                    id: user.id,
                    username: user.username,
                    posts: [
                        {
                            id: posts[0].id,
                            title: posts[0].title,
                            content: posts[0].content,
                        },
                        {
                            id: posts[1].id,
                            title: posts[1].title,
                            content: posts[1].content,
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("it can fetch N:N relations", async () => {
        await db.transact(
            async (db) => {
                const { tenants, user } = await factory.seed(db);
                const result = await db.findMany("user", {
                    select: ["id", "username"],
                    include: { tenants: { select: ["id", "name"] } },
                });

                expect(result).toEqual([
                    {
                        id: user.id,
                        username: user.username,
                        tenants: [
                            {
                                id: tenants[0].id,
                                name: tenants[0].name,
                            },
                            {
                                id: tenants[1].id,
                                name: tenants[1].name,
                            },
                        ],
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
