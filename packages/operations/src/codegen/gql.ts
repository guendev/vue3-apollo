/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment PostDetail on Post {\n  id\n  title\n  body\n}": typeof types.PostDetailFragmentDoc,
    "mutation UpdatePost($postId: Int!, $post: UpdatePostInput!) {\n  updatePost(postId: $postId, post: $post) {\n    id\n    title\n  }\n}": typeof types.UpdatePostDocument,
    "query UserById($userByIdId: Int!) {\n  userById(id: $userByIdId) {\n    id\n    name\n    email\n  }\n}\n\nquery Posts($userId: Int, $first: Int) {\n  posts(userId: $userId, first: $first) {\n    id\n    ...PostDetail\n  }\n}\n\nquery Todos($userId: Int, $first: Int) {\n  todos(userId: $userId, first: $first) {\n    id\n  }\n}": typeof types.UserByIdDocument,
};
const documents: Documents = {
    "fragment PostDetail on Post {\n  id\n  title\n  body\n}": types.PostDetailFragmentDoc,
    "mutation UpdatePost($postId: Int!, $post: UpdatePostInput!) {\n  updatePost(postId: $postId, post: $post) {\n    id\n    title\n  }\n}": types.UpdatePostDocument,
    "query UserById($userByIdId: Int!) {\n  userById(id: $userByIdId) {\n    id\n    name\n    email\n  }\n}\n\nquery Posts($userId: Int, $first: Int) {\n  posts(userId: $userId, first: $first) {\n    id\n    ...PostDetail\n  }\n}\n\nquery Todos($userId: Int, $first: Int) {\n  todos(userId: $userId, first: $first) {\n    id\n  }\n}": types.UserByIdDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment PostDetail on Post {\n  id\n  title\n  body\n}"): (typeof documents)["fragment PostDetail on Post {\n  id\n  title\n  body\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdatePost($postId: Int!, $post: UpdatePostInput!) {\n  updatePost(postId: $postId, post: $post) {\n    id\n    title\n  }\n}"): (typeof documents)["mutation UpdatePost($postId: Int!, $post: UpdatePostInput!) {\n  updatePost(postId: $postId, post: $post) {\n    id\n    title\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UserById($userByIdId: Int!) {\n  userById(id: $userByIdId) {\n    id\n    name\n    email\n  }\n}\n\nquery Posts($userId: Int, $first: Int) {\n  posts(userId: $userId, first: $first) {\n    id\n    ...PostDetail\n  }\n}\n\nquery Todos($userId: Int, $first: Int) {\n  todos(userId: $userId, first: $first) {\n    id\n  }\n}"): (typeof documents)["query UserById($userByIdId: Int!) {\n  userById(id: $userByIdId) {\n    id\n    name\n    email\n  }\n}\n\nquery Posts($userId: Int, $first: Int) {\n  posts(userId: $userId, first: $first) {\n    id\n    ...PostDetail\n  }\n}\n\nquery Todos($userId: Int, $first: Int) {\n  todos(userId: $userId, first: $first) {\n    id\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;